import UpcomingReservationCard from "./UpcomingReservationCard";

export default function UpcomingReservationList({ bookings, user }) {
  return (
    <ul className="space-y-6 overflow-y-scroll max-h-[670px]">
      {bookings?.map((booking) => (
        <UpcomingReservationCard
          booking={booking}
          key={booking.id}
          user={user}
        />
      ))}
    </ul>
  );
}
