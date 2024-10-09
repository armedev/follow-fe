import { Dispatch, SetStateAction, useEffect } from "react";
import { getSenderFromVersion } from "../utils/commands";
import {
  ALLOWED_LOCAL_STORAGE_KEYS,
  BLACKLISTED_LOCAL_STORAGE_KEYS,
  CURRENT_VERSION,
  DataIgnoreType,
  LeaderType,
} from "../utils/constants";
import { debounce, elemToSelector } from "../utils/common";
import { handleIncomingEvent } from "../utils/event";
import { usePathname, useRouter } from "next/navigation";

export const useSubscribeToDomEvents = (
  ref: HTMLElement,
  isLeader: boolean,
  sendMessage: (
    data: string | ArrayBufferLike | Blob | ArrayBufferView,
  ) => void,
  isConnected: boolean,
) => {
  const path = usePathname();

  useEffect(() => {
    if (sendMessage == null || !isConnected || !isLeader) return;

    const sender = getSenderFromVersion(CURRENT_VERSION);

    sender.send("URL", { path }, sendMessage);
  }, [path, sendMessage, isConnected, isLeader]);

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

    const sender = getSenderFromVersion(CURRENT_VERSION);
    const id = setTimeout(
      () => sender.send("LOCAL_STORAGE", wholeLocalStorage, sendMessage),
      300,
    );

    return () => clearTimeout(id);
  }, [sendMessage, isConnected, isLeader]);

  useEffect(() => {
    if (sendMessage == null || ref == null || !isLeader) return;

    const sender = getSenderFromVersion(CURRENT_VERSION);

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      const ignoreAttribute = target.getAttribute(
        "data-ignore",
      ) as DataIgnoreType;

      if (ignoreAttribute === "CLICK") return;

      sender.send("CLICK", { selector: elemToSelector(target) }, sendMessage);
    };

    const handleScroll = debounce((e: Event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const target = (e.target as any).scrollingElement as HTMLElement;
      const top = target.scrollTop;
      const left = target.scrollLeft;

      const ignoreAttribute = target.getAttribute(
        "data-ignore",
      ) as DataIgnoreType;

      if (ignoreAttribute === "SCROLL") return;

      sender.send(
        "SCROLL",
        { selector: elemToSelector(target), top, left },
        sendMessage,
      );
    });

    const handleInput = debounce((e: Event) => {
      const target = e.target as HTMLInputElement;

      const ignoreAttribute = target.getAttribute(
        "data-ignore",
      ) as DataIgnoreType;

      if (ignoreAttribute === "INPUT") return;

      const value = target.value;

      sender.send(
        "INPUT",
        { selector: elemToSelector(e.target as HTMLInputElement), value },
        sendMessage,
      );
    });

    ref.addEventListener("click", handleClick);
    window.addEventListener("scroll", handleScroll);

    const inputs = Array.from(document.querySelectorAll("input"));
    const textareas = Array.from(document.querySelectorAll("textarea"));
    const selects = Array.from(document.querySelectorAll("select"));

    inputs.forEach((input) => input.addEventListener("input", handleInput));
    textareas.forEach((input) => input.addEventListener("input", handleInput));
    selects.forEach((input) => input.addEventListener("input", handleInput));

    return () => {
      ref.removeEventListener("click", handleClick);
      window.removeEventListener("scroll", handleScroll);
      inputs.forEach((input) =>
        input.removeEventListener("input", handleInput),
      );
      textareas.forEach((input) =>
        input.removeEventListener("input", handleInput),
      );
      selects.forEach((input) =>
        input.removeEventListener("input", handleInput),
      );
    };
  }, [sendMessage, ref, isLeader]);
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
