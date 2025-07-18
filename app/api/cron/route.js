// import { getEmails } from "@/app/_lib/data-service";
// import sendEmail from "@/app/_lib/emailService";
// import { format, parseISO } from "date-fns";

// export async function GET() {
//   const result = await fetch(
//     "http://worldtimeapi.org/api/timezone/Asia/Kolkata",
//     {
//       cache: "no-store",
//     }
//   );
//   const data = await result.json();

//   const bookings = await getEmails();

//   for (const booking of bookings) {
//     try {
//       const to = booking?.guests?.email;
//       const subject = "Reminder: Upcoming Cabin Reservation";
//       const startDate = booking?.startDate;
//       const endDate = booking?.endDate;
//       const parsedStartDate = parseISO(startDate);
//       const parsedEndDate = parseISO(endDate);
//       const readableStartDate = format(parsedStartDate, "MMMM dd, yyyy");
//       const readableEndDate = format(parsedEndDate, "MMMM dd, yyyy");

//       const text = `
//   <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
//     <h2 style="color: #2a9d8f; text-align: center;">Reminder: Upcoming Cabin Reservation</h2>
//     <p style="font-size: 16px;">
//       Dear ${booking.guests.fullName},
//     </p>
//     <p style="font-size: 16px;">
//       This is a friendly reminder that your reservation at Wild Oasis cabin no : <strong>${booking.cabins.name}</strong> is approaching. Here are the details of your stay:
//     </p>
//     <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
//       <tr>
//         <td style="padding: 10px; border: 1px solid #ddd;"><strong>Check-in Date:</strong></td>
//         <td style="padding: 10px; border: 1px solid #ddd;">${readableStartDate}</td>
//       </tr>
//       <tr>
//         <td style="padding: 10px; border: 1px solid #ddd;"><strong>Check-out Date:</strong></td>
//         <td style="padding: 10px; border: 1px solid #ddd;">${readableEndDate}</td>
//       </tr>
//     </table>
//     <p style="font-size: 16px;">
//       We are excited to host you and ensure you have a wonderful stay. Should you have any questions or need further assistance, please do not hesitate to contact us.
//     </p>
//     <p style="font-size: 16px;">
//       Best regards,<br>
//       <strong>Your Cabin Booking Team</strong>
//     </p>
//     <p style="font-size: 14px; color: #555; text-align: center; margin-top: 20px;">
//       This is an automated reminder. Please do not reply to this email.
//     </p>
//   </div>
// `;

//       await sendEmail({ to, subject, text });
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   }

//   return Response.json({ datetime: data.datetime });
// }

import { getEmails } from "@/app/_lib/data-service";
import sendEmail from "@/app/_lib/emailService";
import { format, parseISO } from "date-fns";

// This forces the route to be dynamic and prevents prerendering
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Use JavaScript Date instead of external API
    const currentDateTime = new Date().toISOString();
    const bookings = await getEmails();

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const booking of bookings) {
      try {
        const to = booking?.guests?.email;

        if (!to) {
          console.warn(`No email found for booking ${booking.id}`);
          continue;
        }

        const subject = "Reminder: Upcoming Cabin Reservation";
        const startDate = booking?.startDate;
        const endDate = booking?.endDate;
        const parsedStartDate = parseISO(startDate);
        const parsedEndDate = parseISO(endDate);
        const readableStartDate = format(parsedStartDate, "MMMM dd, yyyy");
        const readableEndDate = format(parsedEndDate, "MMMM dd, yyyy");

        const text = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #2a9d8f; text-align: center;">Reminder: Upcoming Cabin Reservation</h2>
      <p style="font-size: 16px;">
        Dear ${booking.guests.fullName},
      </p>
      <p style="font-size: 16px;">
        This is a friendly reminder that your reservation at Wild Oasis cabin no : <strong>${booking.cabins.name}</strong> is approaching. Here are the details of your stay:
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
        We are excited to host you and ensure you have a wonderful stay. Should you have any questions or need further assistance, please do not hesitate to contact us.
      </p>
      <p style="font-size: 16px;">
        Best regards,<br>
        <strong>Your Cabin Booking Team</strong>
      </p>
      <p style="font-size: 14px; color: #555; text-align: center; margin-top: 20px;">
        This is an automated reminder. Please do not reply to this email.
      </p>
    </div>
  `;

        await sendEmail({ to, subject, text });
        emailsSent++;
      } catch (error) {
        console.error(
          `Failed to send email to ${booking?.guests?.email}:`,
          error.message
        );
        emailsFailed++;
      }
    }

    return Response.json({
      success: true,
      datetime: currentDateTime,
      emailsSent,
      emailsFailed,
      totalBookings: bookings.length,
    });
  } catch (error) {
    console.error("Cron job failed:", error.message);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
