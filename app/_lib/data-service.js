import { addDays, eachDayOfInterval, format } from "date-fns";
import { supabase } from "./supabase";
import { notFound } from "next/navigation";

// GET
export async function getCabin(id) {
  const { data, error } = await supabase
    .from("cabins")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    // for manually calling notFound
    notFound();
  }

  return data;
}

export async function getCabinPrice(id) {
  const { data, error } = await supabase
    .from("cabins")
    .select("regularPrice, discount")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export const getCabins = async function () {
  const { data, error } = await supabase
    .from("cabins")
    .select("id, name, maxCapacity, regularPrice, discount, image")
    .order("name");

  // For testing
  // await new Promise((res) => setTimeout(res, 1000));

  if (error) {
    throw new Error("Cabins could not be loaded");
  }

  return data;
};

// Guests are uniquely identified by their email address
export async function getGuest(email) {
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("email", email)
    .single();

  // await new Promise((res) => setTimeout(res, 2000));

  // No error here! We handle the possibility of no guest in the sign in callback
  return data;
}

export async function getBooking(id) {
  const { data, error, count } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error("Booking could not get loaded");
  }

  return data;
}

export async function getBookings(guestId) {
  const { data, error, count } = await supabase
    .from("bookings")
    // We actually also need data on the cabins as well. But let's ONLY take the data that we actually need, in order to reduce downloaded data.
    .select(
      "id, created_at, startDate, endDate,isPaid, numNights, numGuests, totalPrice, guestId, cabinId, cabins(name, image)"
    )
    .eq("guestId", guestId)
    .order("startDate");

  if (error) {
    throw new Error("Bookings could not get loaded");
  }

  return data;
}

export async function getUpcomingAndPaidBookings(guestId) {
  const date = new Date();
  const dateOnly = format(date, "yyyy-MM-dd");

  const { data, error, count } = await supabase
    .from("bookings")
    .select(
      "id, created_at, startDate, endDate,isPaid, numNights, numGuests, totalPrice, guestId, cabinId, cabins(name, image)"
    )
    .eq("guestId", guestId)
    .eq("isPaid", true)
    .gte("startDate", dateOnly)
    .order("startDate");

  if (error) {
    throw new Error("Bookings could not get loaded");
  }

  return data;
}

export async function getEmails(guestId) {
  const date = new Date();
  const twoDaysAfter = addDays(date, 2);
  const fiveDaysAfter = addDays(date, 4);
  const date1 = format(twoDaysAfter, "yyyy-MM-dd");
  const date2 = format(fiveDaysAfter, "yyyy-MM-dd");

  const { data, error, count } = await supabase
    .from("bookings")
    .select(
      "id, startDate, endDate, guestId, guests(id,email,fullName),cabinId, cabins(name)"
    )
    .gte("startDate", date1)
    .lte("startDate", date2);
  if (error) {
    throw new Error("Bookings could not get loaded");
  }

  return data;
}

export async function getBookedDatesByCabinId(cabinId) {
  let today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  today = today.toISOString();

  // Getting all bookings
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("cabinId", cabinId)
    .or(`startDate.gte.${today},status.eq.checked-in`);

  await new Promise((res) => setTimeout(res, 3000));
  if (error) {
    throw new Error("Bookings could not get loaded");
  }

  // Converting to actual dates to be displayed in the date picker
  const bookedDates = data
    .map((booking) => {
      return eachDayOfInterval({
        start: new Date(booking.startDate),
        end: new Date(booking.endDate),
      });
    })
    .flat();

  return bookedDates;
}

export async function getSettings() {
  const { data, error } = await supabase.from("settings").select("*").single();

  if (error) {
    throw new Error("Settings could not be loaded");
  }

  return data;
}

export async function getCountries() {
  try {
    const res = await fetch(
      "https://restcountries.com/v2/all?fields=name,flag"
    );
    const countries = await res.json();
    return countries;
  } catch {
    throw new Error("Could not fetch countries");
  }
}

// CREATE
export async function createGuest(newGuest) {
  const { data, error } = await supabase.from("guests").insert([newGuest]);

  if (error) {
    throw new Error("Guest could not be created");
  }

  return data;
}
