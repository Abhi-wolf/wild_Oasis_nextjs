"use client";

import { ChatBubbleBottomCenterIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import AIChatBox from "./AIChatBox";

export default function AIChatButton() {
  const [chatBoxOpen, setChatBoxOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setChatBoxOpen(true)}
        className="fixed bottom-2 right-8"
      >
        <ChatBubbleBottomCenterIcon className="h-8 w-8 text-primary-600" />
        Ask Ai
      </button>

      <AIChatBox open={chatBoxOpen} onClose={() => setChatBoxOpen(false)} />
    </>
  );
}
