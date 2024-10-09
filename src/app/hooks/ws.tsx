import { useEffect, useRef, useState } from "react";

const useWs = (url: string) => {
  const sockerRef = useRef<WebSocket | null>(null);
  const [recentEvent, setRecentEvent] = useState<MessageEvent<unknown> | null>(
    null,
  );

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    sockerRef.current = new WebSocket(url);

    sockerRef.current.onopen = (ev) => {
      console.log("open", ev);
      setConnected(true);
    };

    sockerRef.current.onerror = (ev) => {
      console.log("error", ev);
    };

    sockerRef.current.onmessage = async (ev) => {
      setRecentEvent(ev);
    };

    return () => sockerRef.current?.close();
  }, [url]);

  const sendMessage = (
    data: string | ArrayBufferLike | Blob | ArrayBufferView,
  ) => {
    sockerRef.current?.send(data);
  };

  return {
    sendMessage,
    client: sockerRef.current,
    isConnected: connected,
    recentEvent,
  };
};

export default useWs;
