import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useRef,
  useState,
} from "react";
import useWs from "../hooks/ws";
import { useIncomingEvents, useSubscribeToDomEvents } from "../hooks/domEvent";
import { LeaderType } from "../utils/constants";

type FollowContextType = {
  sendMessage?: (
    data: string | ArrayBufferLike | Blob | ArrayBufferView,
  ) => void;
  client: WebSocket | null;
  isConnected: boolean;
  recentEvent: MessageEvent<unknown> | null;
  leader: LeaderType;
  setLeader: Dispatch<SetStateAction<LeaderType>>;
};

export const FollowContext = createContext<FollowContextType>({
  client: null,
  isConnected: false,
  recentEvent: null,
  leader: "all-client",
  setLeader: () => {},
});

export const useFollow = () => useContext(FollowContext);

export default function FollowProvider({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null!);
  const value = useWs("ws://192.168.68.7:8000/follow");

  const [leader, setLeader] = useState<LeaderType>("all-client");

  //handles incoming events from ws
  useIncomingEvents(value.recentEvent, setLeader);

  //listens for events from dom and sends it through ws
  useSubscribeToDomEvents(
    ref.current,
    leader === "leader",
    value.sendMessage,
    value.isConnected,
  );

  return (
    <FollowContext.Provider value={{ ...value, leader, setLeader }}>
      <div ref={ref} id="follow-context">
        {children}
      </div>
    </FollowContext.Provider>
  );
}
