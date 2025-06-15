"use client";

import { useOptimistic } from "react";
import ReservationCard from "./ReservationCard";
import { deleteBooking } from "../_lib/actions";
import toast from "react-hot-toast";

export default function ReservationList({ bookings, user }) {
  const [optimisticBookings, optimisticDelete] = useOptimistic(
    bookings,
    (currBookings, bookingId) => {
      return currBookings.filter((booking) => booking.id !== bookingId);
    }
  );

  async function handleDelete(bookingId) {
    optimisticDelete(bookingId);
    const { error } = await deleteBooking(bookingId);

    if (error) toast.error(error);
    else toast.success("Successfully deleted");
  }

  return (
    <ul className="space-y-6 overflow-y-scroll max-h-[670px]">
      {optimisticBookings?.map((booking) => (
        <ReservationCard
          booking={booking}
          key={booking.id}
          onDelete={handleDelete}
          user={user}
        />
      ))}
    </ul>
  );
}
