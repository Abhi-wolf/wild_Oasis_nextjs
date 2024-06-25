import { getBookedDatesByCabinId, getCabin } from "@/app/_lib/data-service";

export async function GET(request, { params }) {
  try {
    const { cabinid } = params;

    const [cabin, bookedDates] = await Promise.all([
      getCabin(cabinid),
      getBookedDatesByCabinId(cabinid),
    ]);

    return Response.json({ cabin, bookedDates });
  } catch (error) {
    return Response.json({ message: "Cabin not found" });
  }
}
