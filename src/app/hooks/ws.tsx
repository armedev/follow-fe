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
      console.log("helloopen", ev);
      setConnected(true);
    };

    sockerRef.current.onerror = (ev) => {
      console.log("hello error", ev);
      setConnected(false);
    };

    sockerRef.current.onmessage = async (ev) => {
      setRecentEvent(ev);
    };

    sockerRef.current.onclose = async (ev) => {
      debugger;
      console.log("hello close", ev);

      setConnected(false);
    };

    return () => {
      sockerRef.current?.close();
    };
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
