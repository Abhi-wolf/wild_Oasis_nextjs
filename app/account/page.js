import UpcomingReservationList from "../_components/UpcomingReservationList";
import { auth } from "../_lib/auth";
import {
  getBookings,
  getEmails,
  getUpcomingAndPaidBookings,
} from "../_lib/data-service";

export const metadata = {
  title: "Guest Area",
};
export default async function Page() {
  const session = await auth();
  const bookings = await getUpcomingAndPaidBookings(session?.user?.guestId);

  const emails = await getEmails();

  const firstName = session?.user?.name.split(" ").at(0);

  return (
    <div className="">
      <h2 className="font-semibold text-2xl text-accent-400 mb-4">
        Welcome {firstName}
      </h2>

      <h4 className="font-semibold text-xl text-accent-200 mb-3">
        Your upcoming reservations
      </h4>

      <UpcomingReservationList bookings={bookings} user={session?.user} />
    </div>
  );
}
