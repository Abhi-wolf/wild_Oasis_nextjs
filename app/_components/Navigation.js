import Link from "next/link";
import { auth } from "../_lib/auth";

export default async function Navigation() {
  const session = await auth();

  return (
    <nav className="z-10 text-md md:text-xl">
      <ul className="flex gap-4 md:gap-16 items-center">
        <li>
          <Link
            href="/cabins"
            className="hover:text-accent-400 transition-colors"
          >
            Cabins
          </Link>
        </li>
        <li>
          <Link
            href="/about"
            className="hover:text-accent-400 transition-colors"
          >
            About
          </Link>
        </li>
        <li>
          {session?.user?.image ? (
            <Link
              href="/account"
              className="hover:text-accent-400 transition-colors flex flex-col md:flex-row justify-center items-center gap-2 md:gap-3"
            >
              <img
                src={session?.user?.image}
                className="h-8 rounded-full"
                alt="user image"
                referrerPolicy="no-referrer"
              />
              <span className="hidden md:block text-md pt-1">Guest Area</span>
            </Link>
          ) : (
            <Link
              href="/account"
              className=" hover:text-accent-400 transition-colors"
            >
              Guest area
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
}
