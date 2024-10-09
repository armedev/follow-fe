"use client";
import { useFollow } from "@/app/contexts/follow";
import { sendFollowMe, sendUnFollowMe } from "@/app/utils/commands";

type PropsType = {
  leaderLabel: string;
  clientLabel: string;
};

export default function FollowButton({ leaderLabel, clientLabel }: PropsType) {
  const { setLeader, leader, sendMessage, isConnected } = useFollow();

  const handleClick = () => {
    if (sendMessage == null || !isConnected) return;
    if (leader === "leader") {
      sendUnFollowMe(sendMessage);
      setLeader("all-client");
    } else {
      sendFollowMe(sendMessage);
      setLeader("leader");
    }
  };

  return (
    <>
      <button data-ignore="CLICK" onClick={handleClick}>
        {leader === "leader" ? clientLabel : leaderLabel}
      </button>
      {leader === "leader"
        ? "I am the leader"
        : leader === "client"
          ? "I am following"
          : "no one is leader"}
    </>
  );
}
