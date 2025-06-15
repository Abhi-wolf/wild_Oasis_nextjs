import { auth } from "../_lib/auth";
import AIChatButton from "./AIChatButton";

export default async function AIChatBoxButton() {
  const session = await auth();

  if (!session || !session.user) return null;

  return <AIChatButton />;
}
