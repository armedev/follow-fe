import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  CommandType,
  FOLLOWME,
  VersionType,
  TXTPLACEHOLDER,
  UNFOLLOWME,
  WS_LOCAL_STORAGE_UPDATE,
} from "./constants";
import {
  JSONFollowMessageGenerator,
  TXTFollowMessageGenerator,
} from "./message";
import { triggerInputChange } from "./common";

export const sendFollowMe = (
  sendMessage: (
    data: string | ArrayBufferLike | Blob | ArrayBufferView,
  ) => void,
) => {
  sendMessage(`${TXTPLACEHOLDER}${FOLLOWME}`);
};

export const sendUnFollowMe = (
  sendMessage: (
    data: string | ArrayBufferLike | Blob | ArrayBufferView,
  ) => void,
) => {
  sendMessage(`${TXTPLACEHOLDER}${UNFOLLOWME}`);
};

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
      SCROLL: this.scrollHandler.bind(this),
      INPUT: this.inputHandler.bind(this),
      URL: this.urlChangeHandler.bind(this),
      LOCAL_STORAGE: this.localStorageHandler.bind(this),
    };
  }

  clickHandler(data: string | Record<string, unknown>) {
    const selector =
      typeof data === "string" ? data : (data.selector as string);
    if (selector == null) return;
    const elem = document.querySelector(selector) as HTMLElement;
    if (elem == null) return;
    elem.click();
  }

  scrollHandler(data: string | Record<string, unknown>) {
    if (typeof data === "string") return;

    const selector = data.selector as string;
    if (selector == null) return;

    const elem = document.querySelector(selector) as HTMLElement;

    if (elem == null) return;

    elem.scrollTo({
      top: data.top as number | undefined,
      left: data.left as number | undefined,
    });
  }

  inputHandler(data: string | Record<string, unknown>) {
    if (typeof data === "string") return;

    const selector = data.selector as string;
    if (selector == null) return;

    const elem = document.querySelector(selector) as HTMLInputElement;

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

    window.dispatchEvent(new CustomEvent(WS_LOCAL_STORAGE_UPDATE));
  }

  run(command: CommandType, data: string | Record<string, unknown>): void {
    this.mapper[command](data);
  }
}

interface CommandSender {
  send<T extends CommandType>(
    command: T,
    data: T extends "SCROLL"
      ? Record<string, unknown>
      : string | Record<string, unknown>,
    sendMessage: (
      data: string | ArrayBufferLike | Blob | ArrayBufferView,
    ) => void,
  ): void;
}

class CommandSenderV1 implements CommandSender {
  version: VersionType = "V1";
  constructor() {}

  send<T extends CommandType>(
    command: T,
    data: T extends "SCROLL"
      ? Record<string, unknown>
      : string | Record<string, unknown>,
    sendMessage: (
      data: string | ArrayBufferLike | Blob | ArrayBufferView,
    ) => void,
  ): void {
    const builder =
      typeof data === "string"
        ? new TXTFollowMessageGenerator(data)
        : new JSONFollowMessageGenerator(data);
    sendMessage(builder.encryptMessageWith(this.version, command));
  }
}

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

const VERSION_TO_SENDER_FACTORY_MAPPER: Record<VersionType, CommandSender> = {
  V1: new CommandSenderV1(),
};

export const getSenderFromVersion = (version: VersionType) => {
  return VERSION_TO_SENDER_FACTORY_MAPPER[version];
};
