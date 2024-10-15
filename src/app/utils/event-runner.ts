import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  CommandType,
  FOLLOWME,
  VersionType,
  UNFOLLOWME,
  LOCAL_STORAGE_CUSTOM_EVENT_WS,
  LeaderType,
} from "./constants";
import {
  getFromBase64,
  JSONFollowMessageDecryptor,
  TXTFollowMessageDecryptor,
} from "./message";
import { triggerInputChange } from "./common";
import { Dispatch, SetStateAction } from "react";

interface CommandRunner {
  run(command: CommandType, data: string | Record<string, unknown>): void;
}

type CommandHandlerType = (data: string | Record<string, unknown>) => void;

class CommandRunnerV1 implements CommandRunner {
  version: VersionType = "V1";
  router: AppRouterInstance;
  mapper: Record<CommandType, CommandHandlerType>;

  constructor(router: AppRouterInstance) {
    this.router = router;
    this.mapper = {
      CLICK: this.clickHandler.bind(this),
      HOVER: this.hoverHandler.bind(this),
      MOUSE_DOWN: this.mouseDownHandler.bind(this),
      MOUSE_ENTER: this.mouseEnterHandler.bind(this),
      MOUSE_LEAVE: this.mouseLeaveHandler.bind(this),
      SCROLL: this.scrollHandler.bind(this),
      INPUT: this.inputHandler.bind(this),
      URL: this.urlChangeHandler.bind(this),
      LOCAL_STORAGE: this.localStorageHandler.bind(this),
    };
  }

  getSelector(data: string | Record<string, unknown>) {
    const selector =
      typeof data === "string" ? data : (data.selector as string);
    if (selector == null) return null;
    const elem = document.querySelector(selector) as HTMLElement | null;

    return elem;
  }

  hoverHandler(data: string | Record<string, unknown>) {
    const elem = this.getSelector(data);
    if (elem == null) return;

    elem.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
  }

  mouseDownHandler(data: string | Record<string, unknown>) {
    const elem = this.getSelector(data);
    if (elem == null) return;

    elem.dispatchEvent(new Event("mousedown", { bubbles: true }));
  }

  mouseLeaveHandler(data: string | Record<string, unknown>) {
    const elem = this.getSelector(data);
    if (elem == null) return;

    // elem.dispatchEvent(new Event('mouseleave', { bubbles: true }));
  }

  mouseEnterHandler(data: string | Record<string, unknown>) {
    const elem = this.getSelector(data);
    if (elem == null) return;

    // elem.dispatchEvent(new Event('mouseenter', { bubbles: true }));
  }

  clickHandler(data: string | Record<string, unknown>) {
    const elem = this.getSelector(data);
    if (elem == null) return;

    (document.activeElement as HTMLElement).blur();
    elem.dispatchEvent(new Event("click", { bubbles: true }));
    elem.focus();
  }

  scrollHandler(data: string | Record<string, unknown>) {
    if (typeof data === "string") return;

    const elem = this.getSelector(data);
    if (elem == null) return;

    elem.scrollTo({
      top: data.top as number | undefined,
      left: data.left as number | undefined,
    });
  }

  inputHandler(data: string | Record<string, unknown>) {
    if (typeof data === "string") return;

    const elem = this.getSelector(data);
    if (elem == null) return;

    triggerInputChange(elem, data.value as string);
  }

  urlChangeHandler(data: string | Record<string, unknown>) {
    if (typeof data === "string") {
      this.router.push(data);
    } else {
      this.router.push(data.path as string);
    }
  }

  localStorageHandler(data: string | Record<string, unknown>) {
    if (typeof data === "string") return;

    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });

    window.dispatchEvent(new CustomEvent(LOCAL_STORAGE_CUSTOM_EVENT_WS));
  }

  run(command: CommandType, data: string | Record<string, unknown>): void {
    this.mapper[command](data);
  }
}

export const handleIncomingEvent = (
  rawData: string,
  router: AppRouterInstance,
  setLeader: Dispatch<SetStateAction<LeaderType>>,
) => {
  const splittedRawData = rawData.split("\n");
  splittedRawData.forEach((parsableRawData) => {
    const parsedVal = getFromBase64(parsableRawData);

    if (parsedVal == null) return;

    if (
      typeof parsedVal === "string" &&
      [FOLLOWME, UNFOLLOWME].includes(parsedVal)
    ) {
      setLeader(parsedVal === FOLLOWME ? "client" : "all-client");
      return;
    }

    const encrypted =
      typeof parsedVal === "string"
        ? new TXTFollowMessageDecryptor(parsedVal)
        : new JSONFollowMessageDecryptor(parsedVal);

    const { command, data, version } = encrypted.decryptMessage();
    getRunnerFromVersion(version, router).run(command, data);
  });
};

const VERSION_TO_RUNNER_FACTORY_MAPPER: Record<
  VersionType,
  (router: AppRouterInstance) => CommandRunner
> = {
  V1: (router) => new CommandRunnerV1(router),
};

export const getRunnerFromVersion = (
  version: VersionType,
  router: AppRouterInstance,
) => {
  return VERSION_TO_RUNNER_FACTORY_MAPPER[version](router);
};
