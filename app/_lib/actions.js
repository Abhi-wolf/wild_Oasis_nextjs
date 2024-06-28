"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";
import { getBookings } from "./data-service";
import { redirect } from "next/navigation";
import sendEmail from "./emailService";
import { format, parseISO } from "date-fns";

export async function signInAction() {
  await signIn("google", {
    redirectTo: "/account",
  });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function updateGuest(formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");

  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID)) {
    throw new Error("Please provide a valid National ID");
  }

  const updatedFields = { nationality, nationalID, countryFlag };

  const { data, error } = await supabase
    .from("guests")
    .update(updatedFields)
    .eq("id", session.user.guestId)
    .select()
    .single();

  if (error) {
    throw new Error("Guest could not be updated");
  }

  revalidatePath("/account/profile");

  return data;
}

export async function deleteBooking(bookingId) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const guestBookings = await getBookings(session.user.guestId);

  const guestBookingIds = guestBookings.map((booking) => booking.id);

  if (!guestBookingIds.includes(bookingId))
    throw new Error("You are not allowed to delete this booking");

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) {
    throw new Error("Booking could not be deleted");
  }

  revalidatePath("/account/reservations");
}

export async function updateBooking(formData) {
  // authentication
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const guestBookings = await getBookings(session.user.guestId);

  const guestBookingIds = guestBookings.map((booking) => booking.id);

  const bookingId = Number(formData.get("bookingId"));

  // authorization
  if (!guestBookingIds.includes(bookingId))
    throw new Error("You are not allowed to update this booking");

  // building update data
  const numGuests = formData.get("numGuests");
  const observations = formData.get("observations");
  const updatedFields = { numGuests, observations };

  // update data
  const { data, error } = await supabase
    .from("bookings")
    .update(updatedFields)
    .eq("id", bookingId)
    .select()
    .single();

  if (error) {
    throw new Error("Booking could not be updated");
  }

  // revalidation the cache
  revalidatePath(`/account/reservations/edit/${bookingId}`);
  revalidatePath("/account/reservations");

  // redirect
  redirect("/account/reservations");
}

export async function createBooking(bookingData, formatData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const newBooking = {
    ...bookingData,
    guestId: session.user.guestId,
    numGuests: Number(formatData.get("numGuests")),
    observations: formatData.get("observations"),
    extrasPrice: 0,
    totalPrice: bookingData.cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
  };

  const { data, error } = await supabase
    .from("bookings")
    .insert([newBooking])
    // So that the newly created object gets returned!
    .select()
    .single();

  if (error) {
    throw new Error("Booking could not be created");
  }

  revalidatePath(`/cabins/${bookingData.cabinId}`);
  redirect("/cabins/thankyou");
}

export async function paymentSuccessful({ bookingId }) {
  if (!bookingId) throw new Error("Booking Id not found");

  // authentication
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const guestBookings = await getBookings(session.user.guestId);

  const guestBookingIds = guestBookings.map((booking) => booking.id);

  // authorization
  if (!guestBookingIds.includes(bookingId))
    throw new Error("You are not allowed to update this booking");

  // update data
  const { data, error } = await supabase
    .from("bookings")
    .update({ isPaid: true, status: "confirmed" })
    .eq("id", bookingId)
    .select(
      "id, startDate, endDate, guestId, guests(id,email,fullName),cabinId, cabins(name)"
    )
    .single();

  if (error) {
    throw new Error("Booking could not be updated");
  }

  const readableStartDate = format(parseISO(data.startDate), "MMMM dd, yyyy");
  const readableEndDate = format(parseISO(data.endDate), "MMMM dd, yyyy");
  const to = data.guests.email;
  const subject = `Booking Confirmation: Wild Oasis ${data.cabins.name}`;

  const text = `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="color: #2a9d8f; text-align: center;">Booking Confirmation</h2>
    <p style="font-size: 16px;">
      Dear ${data.guests.fullName},
    </p>
    <p style="font-size: 16px;">
      Congratulations on your booking with us! We are delighted to confirm your reservation at <strong>${data.cabins.name}</strong>. Here are the details of your stay:
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Check-in Date:</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd;">${readableStartDate}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Check-out Date:</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd;">${readableEndDate}</td>
      </tr>
    </table>
    <p style="font-size: 16px;">
      We are thrilled to host you and ensure you have a memorable stay. Should you have any questions or need further assistance, please do not hesitate to contact us.
    </p>
    <p style="font-size: 16px;">
      Best regards,<br>
      <strong>Wild Oasis</strong>
    </p>
    <p style="font-size: 14px; color: #555; text-align: center; margin-top: 20px;">
      This is an automated confirmation. Please do not reply to this email.
    </p>
  </div>
`;

  await sendEmail({ to, subject, text });

  return data;
}
