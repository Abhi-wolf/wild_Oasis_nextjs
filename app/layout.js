import { Josefin_Sans } from "next/font/google";
import "@/app/_styles/global.css";
import Header from "./_components/Header";
import { ReservationProvider } from "./_components/ReservationContext";
import Script from "next/script";
import { Toaster } from "react-hot-toast";
import AIChatBoxButton from "./_components/AIChatBotButton";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    template: "%s / The Wild Oasis",
    default: "Welcome / The Wild Oasis",
  },
  description:
    "Luxurious cabin hotel, located in the heart of the Italian Dolomites surrounded by beautiful mountains and dark forests",
};

export default function RootLayout({ children }) {
  return (
    <>
      <html lang="en">
        <body
          className={`${josefin.className} bg-primary-950 text-primary-100 min-h-screen flex flex-col `}
        >
          <Header />
          <div className="flex-1 px-2 md:px-8 py-12 grid">
            <main className="max-w-7xl mx-auto  w-full ">
              <Toaster position="top-center" />
              <ReservationProvider>{children}</ReservationProvider>
            </main>
            <AIChatBoxButton />
          </div>
        </body>
      </html>

      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
    </>
  );
}
