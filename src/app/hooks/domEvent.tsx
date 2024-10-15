import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ALLOWED_LOCAL_STORAGE_KEYS,
  BLACKLISTED_LOCAL_STORAGE_KEYS,
  CURRENT_VERSION,
  LeaderType,
} from "../utils/constants";
import {
  handleClick,
  handleHover,
  handleInput,
  handleMouseDown,
  handleMouseEnter,
  handleMouseLeave,
  handleScroll,
  getSenderFromVersion,
} from "../utils/event-sender";
import { handleIncomingEvent } from "../utils/event-runner";

export const useSubscribeToDomEvents = (
  ref: HTMLElement,
  isLeader: boolean,
  sendMessage: (
    data: string | ArrayBufferLike | Blob | ArrayBufferView,
  ) => void,
  isConnected: boolean,
) => {
  const path = usePathname();
  const searchQuery = useSearchParams();
  const url = useMemo(() => `${path}?${searchQuery}`, [path, searchQuery]);

  const [lastChanged, setLastChanged] = useState(Date.now());

  //tree change
  useEffect(() => {
    if (sendMessage == null || !isConnected || !isLeader) return;
    const observer = new MutationObserver(() => {
      debugger;
      setLastChanged(Date.now());
    });

    observer.observe(ref, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [ref, path, sendMessage, isConnected, isLeader]);

  //path
  useEffect(() => {
    if (sendMessage == null || !isConnected || !isLeader) return;

    const sender = getSenderFromVersion(CURRENT_VERSION);

    sender.send("URL", { path: url }, sendMessage);
  }, [url, sendMessage, isConnected, isLeader]);

  //localstorage
  useEffect(() => {
    if (sendMessage == null || !isConnected || !isLeader) return;

    if (!localStorage.length) return;

    const wholeLocalStorage = Object.entries(localStorage).reduce(
      (acc, [key, value]) => {
        try {
          if (
            BLACKLISTED_LOCAL_STORAGE_KEYS.includes(key) ||
            !ALLOWED_LOCAL_STORAGE_KEYS.includes(key)
          )
            throw new Error("key should be ignored");

          return { ...acc, [key]: JSON.parse(value) };
        } catch {
          return acc;
        }
      },
      {},
    );

    if (!Object.keys(wholeLocalStorage).length) return;

    const sender = getSenderFromVersion(CURRENT_VERSION);
    const id = setTimeout(
      () => sender.send("LOCAL_STORAGE", wholeLocalStorage, sendMessage),
      300,
    );

    return () => clearTimeout(id);
  }, [sendMessage, isConnected, isLeader]);

  // events
  useEffect(() => {
    if (sendMessage == null || ref == null || !isLeader) return;

    const inputs = Array.from(ref.querySelectorAll("input"));
    const textareas = Array.from(ref.querySelectorAll("textarea"));
    const selects = Array.from(ref.querySelectorAll("select"));

    const handleClickEvent = handleClick(sendMessage);
    const handleMouseDownEvent = handleMouseDown(sendMessage);
    const handleHoverEvent = handleHover(sendMessage);
    const handleScrollEvent = handleScroll(sendMessage);
    const handleInputEvent = handleInput(sendMessage);
    const handleMouseEnterEvent = handleMouseEnter(sendMessage);
    const handleMouseLeaveEvent = handleMouseLeave(sendMessage);

    ref.addEventListener("click", handleClickEvent);
    ref.addEventListener("mousedown", handleMouseDownEvent);
    ref.addEventListener("mouseover", handleHoverEvent);
    ref.addEventListener("mouseenter", handleMouseEnterEvent);
    ref.addEventListener("mouseleave", handleMouseLeaveEvent);
    window.addEventListener("scroll", handleScrollEvent, true);
    inputs.forEach((input) =>
      input.addEventListener("input", handleInputEvent),
    );
    textareas.forEach((input) =>
      input.addEventListener("input", handleInputEvent),
    );
    selects.forEach((input) =>
      input.addEventListener("input", handleInputEvent),
    );

    return () => {
      ref.removeEventListener("click", handleClickEvent);
      ref.removeEventListener("mousedown", handleMouseDownEvent);
      ref.removeEventListener("mouseover", handleHoverEvent);
      ref.removeEventListener("mouseenter", handleMouseEnterEvent);
      ref.removeEventListener("mouseleave", handleMouseLeaveEvent);
      window.removeEventListener("scroll", handleScrollEvent);
      inputs.forEach((input) =>
        input.removeEventListener("input", handleInputEvent),
      );
      textareas.forEach((input) =>
        input.removeEventListener("input", handleInputEvent),
      );
      selects.forEach((input) =>
        input.removeEventListener("input", handleInputEvent),
      );
    };
  }, [sendMessage, ref, isLeader, lastChanged]);
};

export const useIncomingEvents = (
  event: MessageEvent<unknown> | null,
  setLeader: Dispatch<SetStateAction<LeaderType>>,
) => {
  const router = useRouter();
  useEffect(() => {
    if (event == null || router == null) return;
    handleIncomingEvent(event.data as string, router, setLeader);
  }, [event, router, setLeader]);
};
