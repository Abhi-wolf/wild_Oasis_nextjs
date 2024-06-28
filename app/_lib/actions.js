"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";
import { getBookings } from "./data-service";
import { redirect } from "next/navigation";

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

  console.log("new booking = ", newBooking);

  // const { data, error } = await supabase
  //   .from("bookings")
  //   .insert([newBooking])
  //   // So that the newly created object gets returned!
  //   .select()
  //   .single();

  // if (error) {
  //   throw new Error("Booking could not be created");
  // }

  // revalidatePath(`/cabins/${bookingData.cabinId}`);
  // redirect("/cabins/thankyou");
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
    .update({ isPaid: true })
    .eq("id", bookingId)
    .select()
    .single();

  if (error) {
    throw new Error("Booking could not be updated");
  }

  return data;
}
