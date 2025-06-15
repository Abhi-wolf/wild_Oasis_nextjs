import { auth } from "@/app/_lib/auth";
import { getBookings, getCabins } from "@/app/_lib/data-service";
import { getEmbeddings } from "@/app/_lib/geminiAi";
import { notesIndex } from "@/app/_lib/pinecone";
import { supabase } from "@/app/_lib/supabase";
import { google } from "@ai-sdk/google";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { streamText } from "ai";
import { format } from "date-fns";
import { NextResponse } from "next/server";

const relevantBookings = [
  {
    id: 155,
    created_at: "2024-07-31T06:49:51.093568+00:00",
    startDate: "2024-08-20T18:30:00",
    endDate: "2024-08-24T18:30:00",
    isPaid: true,
    numNights: 4,
    numGuests: 2,
    totalPrice: 2000,
    guestId: 96,
    cabinId: 35,
    cabins: {
      name: "001",
      image:
        "https://dhfnfkmczkfwfaezwcci.supabase.co/storage/v1/object/public/cabin-images/cabin-001.jpg",
    },
  },
  {
    id: 156,
    created_at: "2024-12-02T08:30:03.555043+00:00",
    startDate: "2024-12-11T18:30:00",
    endDate: "2024-12-23T18:30:00",
    isPaid: true,
    numNights: 12,
    numGuests: 2,
    totalPrice: 3900,
    guestId: 96,
    cabinId: 36,
    cabins: {
      name: "002",
      image:
        "https://dhfnfkmczkfwfaezwcci.supabase.co/storage/v1/object/public/cabin-images/cabin-002.jpg",
    },
  },
  {
    id: 161,
    created_at: "2025-01-26T05:21:04.879457+00:00",
    startDate: "2025-02-01T18:30:00",
    endDate: "2025-02-09T18:30:00",
    isPaid: false,
    numNights: 8,
    numGuests: 2,
    totalPrice: 2000,
    guestId: 96,
    cabinId: 35,
    cabins: {
      name: "001",
      image:
        "https://dhfnfkmczkfwfaezwcci.supabase.co/storage/v1/object/public/cabin-images/cabin-001.jpg",
    },
  },
];

const cabins = [
  {
    id: 35,
    name: "001",
    maxCapacity: 2,
    regularPrice: 250,
    discount: 0,
    image:
      "https://dhfnfkmczkfwfaezwcci.supabase.co/storage/v1/object/public/cabin-images/cabin-001.jpg",
  },
  {
    id: 36,
    name: "002",
    maxCapacity: 2,
    regularPrice: 350,
    discount: 25,
    image:
      "https://dhfnfkmczkfwfaezwcci.supabase.co/storage/v1/object/public/cabin-images/cabin-002.jpg",
  },
  {
    id: 37,
    name: "003",
    maxCapacity: 4,
    regularPrice: 300,
    discount: 0,
    image:
      "https://dhfnfkmczkfwfaezwcci.supabase.co/storage/v1/object/public/cabin-images/cabin-003.jpg",
  },
  {
    id: 38,
    name: "004",
    maxCapacity: 4,
    regularPrice: 500,
    discount: 50,
    image:
      "https://dhfnfkmczkfwfaezwcci.supabase.co/storage/v1/object/public/cabin-images/cabin-004.jpg",
  },
  {
    id: 39,
    name: "005",
    maxCapacity: 6,
    regularPrice: 350,
    discount: 0,
    image:
      "https://dhfnfkmczkfwfaezwcci.supabase.co/storage/v1/object/public/cabin-images/cabin-005.jpg",
  },
  {
    id: 40,
    name: "006",
    maxCapacity: 6,
    regularPrice: 800,
    discount: 100,
    image:
      "https://dhfnfkmczkfwfaezwcci.supabase.co/storage/v1/object/public/cabin-images/cabin-006.jpg",
  },
  {
    id: 41,
    name: "007",
    maxCapacity: 8,
    regularPrice: 600,
    discount: 100,
    image:
      "https://dhfnfkmczkfwfaezwcci.supabase.co/storage/v1/object/public/cabin-images/cabin-007.jpg",
  },
  {
    id: 42,
    name: "008",
    maxCapacity: 10,
    regularPrice: 1400,
    discount: 0,
    image:
      "https://dhfnfkmczkfwfaezwcci.supabase.co/storage/v1/object/public/cabin-images/cabin-008.jpg",
  },
];

// export async function POST(req) {
//   const { messages } = await req.json();

//   const session = await auth();
//   const guestId = session.user?.guestId;

//   if (!guestId) {
//     return NextResponse.json(
//       { messages: "Unauthorized user" },
//       { status: 404 }
//     );
//   }

//   const messagesTruncated = messages.slice(-6);

//   console.log("messagesTruncated =", messagesTruncated);

//   console.log("guestId = ", guestId);

//   // const relevantBookings = await getBookings(guestId);
//   // const cabins = await getCabins();

//   // console.log("Relevant notes = ", relevantBookings);
//   // console.log("cabins = ", cabins);

//   // const model = google("models/gemini-1.5-flash");
//   const model = google("models/gemini-2.0-flash-exp");

//   //   const context = `You are an intelligent assistant for a cabin booking application. You answer the user's questions based on their existing booking data.
//   //           Check your knowledgebase before answering any questions. If no relevant information is found, respond:
//   //           "Sorry, I don't know. I can only answer based on the booking data on your account."

//   //           Greet the user at the beginning of the chat.

//   //           Today's date is ${format(
//   //             new Date(),
//   //             "EEE, MMM dd yyyy"
//   //           )} and the Name of the user is ${
//   //     session?.user?.fullName || "Unknown User"
//   //   }.

//   //           The relevant bookings for this query are:
//   //           ${relevantBookings
//   //             .map(
//   //               (booking) => `
//   //             Booking ID: ${booking.id}
//   //                 Start Date of Stay: ${format(
//   //                   new Date(booking.startDate),
//   //                   "EEE, MMM dd yyyy"
//   //                 )}
//   //                 End Date of Stay: ${format(
//   //                   new Date(booking.endDate),
//   //                   "EEE, MMM dd yyyy"
//   //                 )}
//   //                 Guest ID: ${booking.guestId}
//   //                 Cabin ID: ${booking.cabinId}
//   //                 Number of Guests: ${booking.numGuests}
//   //                 Observations: ${booking.observations || ""}
//   //                 Extras Price: Rs.${booking.extrasPrice || ""}
//   //                 Total Price: Rs.${booking.totalPrice}
//   //                 Paid: ${booking.isPaid ? "Yes" : "No"}
//   //                 Breakfast Included: ${booking.hasBreakfast ? "Yes" : "No"}
//   //                 Status: ${booking.status || ""}
//   // `
//   //             )
//   //             .join("\n\n")}
//   // `;

//   const formattedBookings = relevantBookings
//     .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
//     .map((booking) => {
//       return `
//         Booking ID: ${booking.id}
//         Start Date of Stay: ${format(
//           new Date(booking.startDate),
//           "EEE, MMM dd yyyy"
//         )}
//         End Date of Stay: ${format(
//           new Date(booking.endDate),
//           "EEE, MMM dd yyyy"
//         )}
//         Guest ID: ${booking.guestId}
//         Cabin ID: ${booking.cabinId}
//         Number of Guests: ${booking.numGuests}
//         Observations: ${booking.observations || ""}
//         Extras Price: Rs.${booking.extrasPrice || ""}
//         Total Price: Rs.${booking.totalPrice}
//         Paid: ${booking.isPaid ? "Yes" : "No"}
//         Breakfast Included: ${booking.hasBreakfast ? "Yes" : "No"}
//         Status: ${booking.status || ""}
//         \n
//     `;
//     })
//     .join("\n");

//   // const context = `
//   //   You are an intelligent assistant for a cabin booking application. You answer the user's questions based on their existing booking data.
//   //   Check your knowledgebase before answering any questions. If no relevant information is found, respond:
//   //   "Sorry, I don't know. I can only answer based on the booking data on your account."

//   //   Greet the user at the beginning of the chat with their full name. For example, "Hello Abhijeet Kumar, how can I help you?".

//   //   Today's date is ${format(new Date(), "EEE, MMM dd yyyy")}
//   //   and the Name of the user is Abhijeet.

//   //   The relevant bookings for this query are:
//   //   ${formattedBookings}

//   //    If the user asks "what are my bookings?" or similar, then show all details of the most recent booking using the format below and do not repeat any information.
//   //       Booking ID: [booking id]
//   //       Start Date of Stay: [start date]
//   //       End Date of Stay: [end date]
//   //       Guest ID: [guest id]
//   //       Cabin ID: [cabin id]
//   //       Number of Guests: [number of guests]
//   //       Observations: [observations]
//   //       Extras Price: Rs.[extras price]
//   //       Total Price: Rs.[total price]
//   //       Paid: [yes/no]
//   //       Breakfast Included: [yes/no]
//   //       Status: [status]

//   //    If the user asks "previous bookings?", show all the bookings other than the most recent booking, using the same format as above. If there are no previous bookings, respond with "You have no previous bookings.".

//   //   If the user asks "all bookings", then display all bookings using the same format as above, but display one after the other with an empty line between two bookings.

//   //   If the user asks "total cost of all bookings", calculate the sum of total price from all the bookings and reply with the total cost in rupees.

//   //   If the user asks for any details about a specific booking, provide the details, else try your best to answer the query.

//   //   Example conversation:
//   //   User: Hello
//   //   Assistant: Hello Abhijeet Kumar, how can I help you?
//   //   User: what are my bookings?
//   //   Assistant:  Booking ID: 161
//   //               Start Date of Stay: Sat, Feb 01 2025
//   //               End Date of Stay: Sun, Feb 09 2025
//   //               Guest ID: 96
//   //               Cabin ID: 35
//   //               Number of Guests: 2
//   //               Observations:
//   //               Extras Price: Rs.
//   //               Total Price: Rs.2000
//   //               Paid: No
//   //               Breakfast Included: No
//   //               Status:
//   //   User: previous bookings?
//   //   Assistant:  Booking ID: 156
//   //               Start Date of Stay: Wed, Dec 11 2024
//   //               End Date of Stay: Mon, Dec 23 2024
//   //               Guest ID: 96
//   //               Cabin ID: 36
//   //               Number of Guests: 2
//   //               Observations:
//   //               Extras Price: Rs.
//   //               Total Price: Rs.3900
//   //               Paid: Yes
//   //               Breakfast Included: No
//   //               Status:

//   //               Booking ID: 155
//   //               Start Date of Stay: Tue, Aug 20 2024
//   //               End Date of Stay: Sat, Aug 24 2024
//   //               Guest ID: 96
//   //               Cabin ID: 35
//   //               Number of Guests: 2
//   //               Observations:
//   //               Extras Price: Rs.
//   //               Total Price: Rs.1000
//   //               Paid: Yes
//   //               Breakfast Included: No
//   //               Status:
//   //   User: all bookings
//   //   Assistant:   Booking ID: 161
//   //               Start Date of Stay: Sat, Feb 01 2025
//   //               End Date of Stay: Sun, Feb 09 2025
//   //               Guest ID: 96
//   //               Cabin ID: 35
//   //               Number of Guests: 2
//   //               Observations:
//   //               Extras Price: Rs.
//   //               Total Price: Rs.2000
//   //               Paid: No
//   //               Breakfast Included: No
//   //               Status:

//   //               Booking ID: 156
//   //               Start Date of Stay: Wed, Dec 11 2024
//   //               End Date of Stay: Mon, Dec 23 2024
//   //               Guest ID: 96
//   //               Cabin ID: 36
//   //               Number of Guests: 2
//   //               Observations:
//   //               Extras Price: Rs.
//   //               Total Price: Rs.3900
//   //               Paid: Yes
//   //               Breakfast Included: No
//   //               Status:

//   //               Booking ID: 155
//   //               Start Date of Stay: Tue, Aug 20 2024
//   //               End Date of Stay: Sat, Aug 24 2024
//   //               Guest ID: 96
//   //               Cabin ID: 35
//   //               Number of Guests: 2
//   //               Observations:
//   //               Extras Price: Rs.
//   //               Total Price: Rs.1000
//   //               Paid: Yes
//   //               Breakfast Included: No
//   //               Status:
//   //   User: total cost of all bookings
//   //   Assistant: The total cost of all bookings is Rs. 6900

//   //   `;

//   const context = `You are an intelligent assistant for a cabin booking application. You answer the user's questions based on their existing booking data.
//     Check your knowledgebase before answering any questions. If no relevant information is found, respond:
//     "Sorry, I don't know. I can only answer based on the booking data on your account."

//     Greet the user at the beginning of the chat with their full name. For example, "Hello Abhijeet Kumar, how can I help you?".

//     Today's date is ${format(new Date(), "EEE, MMM dd yyyy")}
//     and the Name of the user is Abhijeet.

//     The relevant bookings for this query are:
//     ${formattedBookings}

//     If the user asks "what are my latest bookings?" or similar, then show all details of the most recent booking using the format below and do not repeat any information.
//         Booking ID: [booking id]
//         Start Date of Stay: [start date]
//         End Date of Stay: [end date]
//         Guest ID: [guest id]
//         Cabin ID: [cabin id]
//         Number of Guests: [number of guests]
//         Observations: [observations]
//         Extras Price: Rs.[extras price]
//         Total Price: Rs.[total price]
//         Paid: [yes/no]
//         Breakfast Included: [yes/no]
//         Status: [status]

//     If the user asks "previous bookings?" , then show all details of all the bookings other than the most recent booking using the format below. If there are no previous bookings, respond with "You have no previous bookings.".
//         Booking ID: [booking id]
//         Start Date of Stay: [start date]
//         End Date of Stay: [end date]
//         Guest ID: [guest id]
//         Cabin ID: [cabin id]
//         Number of Guests: [number of guests]
//         Observations: [observations]
//         Extras Price: Rs.[extras price]
//         Total Price: Rs.[total price]
//         Paid: [yes/no]
//         Breakfast Included: [yes/no]
//         Status: [status]

//     If the user asks "all bookings", then display all bookings using the same format as above, but display one after the other with an empty line between two bookings.

//      If the user asks "when was my last booking?", respond with the end date of the latest booking.

//      If the user asks "when does my latest booking starts?" or "from when does my booking starts?", respond with the start date of the latest booking.

//     If the user asks "total cost of all bookings", calculate the sum of total price from all the bookings and reply with the total cost in rupees.

//      If the user asks "cost of latest booking", respond with the total cost of latest booking.

//      If the user asks "is breakfast included in my latest booking?", then respond with the whether breakfast is included in the most recent booking or not.

//     If the user asks "show me full detail of my latest booking" then respond with all the details of the most recent booking using the format below:
//         Booking ID: [booking id]
//         Start Date of Stay: [start date]
//         End Date of Stay: [end date]
//         Guest ID: [guest id]
//         Cabin ID: [cabin id]
//         Number of Guests: [number of guests]
//         Observations: [observations]
//         Extras Price: Rs.[extras price]
//         Total Price: Rs.[total price]
//         Paid: [yes/no]
//         Breakfast Included: [yes/no]
//         Status: [status]

//     If the user asks for any details about a specific booking, provide the details, else try your best to answer the query.

//     Example conversation:
//         User: Hello
//         Assistant: Hello Abhijeet Kumar, how can I help you?
//         User: what are my bookings?
//         Assistant:  Booking ID: 161
//                     Start Date of Stay: Sat, Feb 01 2025
//                     End Date of Stay: Sun, Feb 09 2025
//                     Guest ID: 96
//                     Cabin ID: 35
//                     Number of Guests: 2
//                     Observations:
//                     Extras Price: Rs.
//                     Total Price: Rs.2000
//                     Paid: No
//                     Breakfast Included: No
//                     Status:
//         User: previous bookings?
//         Assistant: Booking ID: 156
//                     Start Date of Stay: Wed, Dec 11 2024
//                     End Date of Stay: Mon, Dec 23 2024
//                     Guest ID: 96
//                     Cabin ID: 36
//                     Number of Guests: 2
//                     Observations:
//                     Extras Price: Rs.
//                     Total Price: Rs.3900
//                     Paid: Yes
//                     Breakfast Included: No
//                     Status:

//                     Booking ID: 155
//                     Start Date of Stay: Tue, Aug 20 2024
//                     End Date of Stay: Sat, Aug 24 2024
//                     Guest ID: 96
//                     Cabin ID: 35
//                     Number of Guests: 2
//                     Observations:
//                     Extras Price: Rs.
//                     Total Price: Rs.1000
//                     Paid: Yes
//                     Breakfast Included: No
//                     Status:
//         User: all bookings
//         Assistant:   Booking ID: 161
//                     Start Date of Stay: Sat, Feb 01 2025
//                     End Date of Stay: Sun, Feb 09 2025
//                     Guest ID: 96
//                     Cabin ID: 35
//                     Number of Guests: 2
//                     Observations:
//                     Extras Price: Rs.
//                     Total Price: Rs.2000
//                     Paid: No
//                     Breakfast Included: No
//                     Status:

//                     Booking ID: 156
//                     Start Date of Stay: Wed, Dec 11 2024
//                     End Date of Stay: Mon, Dec 23 2024
//                     Guest ID: 96
//                     Cabin ID: 36
//                     Number of Guests: 2
//                     Observations:
//                     Extras Price: Rs.
//                     Total Price: Rs.3900
//                     Paid: Yes
//                     Breakfast Included: No
//                     Status:

//                     Booking ID: 155
//                     Start Date of Stay: Tue, Aug 20 2024
//                     End Date of Stay: Sat, Aug 24 2024
//                     Guest ID: 96
//                     Cabin ID: 35
//                     Number of Guests: 2
//                     Observations:
//                     Extras Price: Rs.
//                     Total Price: Rs.1000
//                     Paid: Yes
//                     Breakfast Included: No
//                     Status:
//         User: total cost of all bookings
//         Assistant: The total cost of all bookings is Rs. 6900
//          User: when was my last booking?
//         Assistant: Sun, Feb 09 2025
//         User: when does my latest booking starts?
//         Assistant: Sat, Feb 01 2025
//         User: cost of latest booking
//         Assistant: The cost of your latest booking is Rs. 2000
//         User: is brealfast include in my latest booking?
//         Assistant: No, breakfast is not included in your latest booking.
//         User: show me full detail of my latest booking
//         Assistant: Booking ID: 161
//                     Start Date of Stay: Sat, Feb 01 2025
//                     End Date of Stay: Sun, Feb 09 2025
//                     Guest ID: 96
//                     Cabin ID: 35
//                     Number of Guests: 2
//                     Observations:
//                     Extras Price: Rs.
//                     Total Price: Rs.2000
//                     Paid: No
//                     Breakfast Included: No
//                     Status:
//     `;
//   console.log("CONTEXT = ", context);

//   const result = await streamText({
//     model,
//     system: context,
//     messages,
//     maxTokens: 4096,
//     temperature: 0.5,
//     topP: 0.6,
//   });

//   return result.toAIStreamResponse();
// }

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const generationConfig = {
  stopSequences: ["red"],
  maxOutputTokens: 500,
  temperature: 0.7,
  topP: 0.6,
  topK: 16,
};
const model = genAI.getGenerativeModel({
  model: "gemini-pro",
  generationConfig,
});

const formattedBookings = relevantBookings
  .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
  .map((booking) => {
    return `
        Booking ID: ${booking.id}
        Start Date of Stay: ${format(
          new Date(booking.startDate),
          "EEE, MMM dd yyyy"
        )}
        End Date of Stay: ${format(
          new Date(booking.endDate),
          "EEE, MMM dd yyyy"
        )}
        Guest ID: ${booking.guestId}
        Cabin ID: ${booking.cabinId}
        Number of Guests: ${booking.numGuests}
        Observations: ${booking.observations || ""}
        Extras Price: Rs.${booking.extrasPrice || ""}
        Total Price: Rs.${booking.totalPrice}
        Paid: ${booking.isPaid ? "Yes" : "No"}
        Breakfast Included: ${booking.hasBreakfast ? "Yes" : "No"}
        Status: ${booking.status || ""}
        \n
    `;
  })
  .join("\n");

const formattedCabins = cabins
  .map((cabin) => {
    return `
      Name: ${cabin.name},
      Maximum capacity: ${cabin.maxCapacity},
      Regular price: ${cabin.regularPrice},
      Discount: ${cabin.discount}
    `;
  })
  .join("\n");

const context = `You are an intelligent assistant for a cabin booking application. You answer the user's questions based on their existing booking data and cabin options avaliable for bookings.
    Check your knowledgebase before answering any questions. If no relevant information is found, respond:
    "Sorry, I don't know. I can only answer based on the booking data on your account."

    Today's date is ${format(new Date(), "EEE, MMM dd yyyy")}
    and the Name of the user is Abhijeet Kumar.

   The various cabins avaiable for bookings are:
    ${formattedCabins}

    The relevant bookings for this query are:
    ${formattedBookings}

    If the user asks "what are my latest bookings?" or similar, then show all details of the most recent booking using the format below and do not repeat any information.
        Booking ID: [booking id]
        Start Date of Stay: [start date]
        End Date of Stay: [end date]
        Guest ID: [guest id]
        Cabin ID: [cabin id]
        Number of Guests: [number of guests]
        Observations: [observations]
        Extras Price: Rs.[extras price]
        Total Price: Rs.[total price]
        Paid: [yes/no]
        Breakfast Included: [yes/no]
        Status: [status]

    If the user asks "previous bookings?" , then show all details of all the bookings other than the most recent booking using the format below. If there are no previous bookings, respond with "You have no previous bookings.".
        Booking ID: [booking id]
        Start Date of Stay: [start date]
        End Date of Stay: [end date]
        Guest ID: [guest id]
        Cabin ID: [cabin id]
        Number of Guests: [number of guests]
        Observations: [observations]
        Extras Price: Rs.[extras price]
        Total Price: Rs.[total price]
        Paid: [yes/no]
        Breakfast Included: [yes/no]
        Status: [status]

    If the user asks "all bookings", then display all bookings using the same format as above, but display one after the other with an empty line between two bookings.

     If the user asks "when was my last booking?", respond with the end date of the latest booking.

     If the user asks "when does my latest booking starts?" or "from when does my booking starts?", respond with the start date of the latest booking.

    If the user asks "total cost of all bookings", calculate the sum of total price from all the bookings and reply with the total cost in rupees.

     If the user asks "cost of latest booking", respond with the total cost of latest booking.

     If the user asks "is breakfast included in my latest booking?", then respond with the whether breakfast is included in the most recent booking or not.

    If the user asks "show me full detail of my latest booking" then respond with all the details of the most recent booking using the format below:
        Booking ID: [booking id]
        Start Date of Stay: [start date]
        End Date of Stay: [end date]
        Guest ID: [guest id]
        Cabin ID: [cabin id]
        Number of Guests: [number of guests]
        Observations: [observations]
        Extras Price: Rs.[extras price]
        Total Price: Rs.[total price]
        Paid: [yes/no]
        Breakfast Included: [yes/no]
        Status: [status]

     If the user ask for "cabin options available" or "cabin options avaiable for booking" shows cabins available in the form
        Name: [name],
        Maximum capacity: [maxCapacity],
        Regular price: [regularPrice],
        Discount: [discount],

    If the user asks "How many person can stay in my latest booking?" then respond with the number of guests in the latest booking.

    If the user asks for any details about a specific booking, provide the details, else try your best to answer the query.

    `;

export async function POST(req) {
  const { messages } = await req.json();
  // console.log("MESSAGE = ", messages);
  let prompt = messages[messages.length - 1].content + context;

  const res = await model.generateContent(prompt);

  // console.log("RESULT = ", res.response.text());

  return NextResponse.json(res.response.text(), { status: 200 });
}
