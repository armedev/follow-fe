"use client";

import { useEffect, useState } from "react";
import useWs from "../hooks/ws";
import { getFromBase64 } from "../utils/message";

const format = (message: string) => {
  const value = getFromBase64(message);
  if (typeof value === "string") return value;
  return JSON.stringify(value);
};

const Message = () => {
  const { isConnected, recentEvent, sendMessage } = useWs(
    "ws://192.168.0.229:8000/follow",
  );

  const [recMessages, setRecMessages] = useState<string[]>([]);

  const [sentMessages, setSentMessages] = useState<string[]>([]);

  const [input, setInput] = useState("");

  useEffect(() => {
    if (!recentEvent?.data) return;
    setRecMessages((prev) => [...prev, recentEvent.data as string]);
  }, [recentEvent]);

  if (!isConnected) return <span>Loading...</span>;

  return (
    <div>
      <div>
        <input onChange={(e) => setInput(e.target.value)} value={input} />
        <button
          onClick={() => {
            setSentMessages((pre) => [...pre, input]);
            sendMessage(input);
          }}
        >
          submit
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        Messages
        {recMessages.map((msg, idx) => (
          <span key={idx} style={{ alignSelf: "flex-start" }}>
            {format(msg)}
          </span>
        ))}
        {sentMessages.map((msg, idx) => (
          <span key={idx} style={{ alignSelf: "flex-end" }}>
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Message;
