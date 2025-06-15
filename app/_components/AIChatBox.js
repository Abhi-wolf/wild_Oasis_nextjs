"use client";

import { useEffect, useRef } from "react";
import { useChat } from "ai/react";
import {
  ChatBubbleLeftIcon,
  TrashIcon,
  UserIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

export default function AIChatBox({ open, onClose }) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    isLoading,
    error,
  } = useChat();

  // console.log("message = ", messages);

  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const lastMessageIsUser = messages[messages.length - 1]?.role === "user";
  if (!open) return null;

  return (
    <div className="fixed bottom-0 right-0 z-10 w-full max-w-[500px] p-1 xl:right-8 rounded-md">
      <button onClick={onClose} className="mb-1 ms-auto block ">
        <XCircleIcon className="h-8 w-8 text-primary-600" />
      </button>

      <div className="flex h-[600px] flex-col rounded-xl border shadow-xl bg-[#0a0908] ">
        <div className="mt-3 h-full overflow-y-auto px-3 " ref={scrollRef}>
          {/* {messages.map((message) => (
            <ChatMessage message={message} key={message.id} />
          ))} */}

          {messages.map((m, index) => (
            <p className="whitespace-pre-line" key={index}>
              {m.content}
            </p>
          ))}

          {/* {isLoading && lastMessageIsUser && (
            <ChatMessage
              message={{ role: "assistant", content: "Thinking..." }}
            />
          )}

          {error && (
            <ChatMessage
              message={{
                role: "assistant",
                content: "Something went wrong. Please try again",
              }}
            />
          )} */}

          {!error && messages.length === 0 && (
            <div className="flex h-full w-full items-center justify-center gap-3">
              <div className="w-5 h-5 rounded-full border-1 border-gray-600">
                <ChatBubbleLeftIcon className="h-4 w-4 text-primary-600" />
              </div>
              Ask the AI questions about your bookings
            </div>
          )}
        </div>

        <form
          className="m-3 flex gap-2 justify-between "
          onSubmit={handleSubmit}
        >
          <button
            title="Clear chat"
            size="icon"
            className="shrink-0"
            type="button"
            onClick={() => setMessages([])}
          >
            <TrashIcon className="h-5 w-5 text-primary-600 " />
          </button>

          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask ...."
            ref={inputRef}
            className="w-[70%] px-2 py-1 rounded-sm text-red-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-slate-500 px-2 py-1 rounded-md self-end"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

function ChatMessage({ message: { role, content } }) {
  const isAiMessage = role === "assistant";

  return (
    <div
      className={`mb-3 flex items-center ${
        isAiMessage ? "me-5 justify-start" : "ms-5 justify-end"
      }`}
    >
      <div className="flex flex-col gap-2">
        {isAiMessage && (
          <div className="flex gap-2 ml-2 border-gray-600">
            <ChatBubbleLeftIcon className="h-5 w-5 text-primary-200 " />
            <p className="text-primary-500 font-bold">Assistant</p>
          </div>
        )}

        {!isAiMessage && (
          <div className="flex gap-2 self-end mr-2 border-gray-600">
            <UserIcon className="h-5 w-5 text-primary-200 " />
            <p className="text-green-500 font-bold">You</p>
          </div>
        )}
        <p
          className={`whitespace-pre-line rounded-md  p-4 ${
            isAiMessage ? "bg-primary-900" : "bg-primary-600 "
          }`}
        >
          {content}
        </p>
      </div>
    </div>
  );
}
