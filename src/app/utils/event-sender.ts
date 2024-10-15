import {
  CommandType,
  CURRENT_VERSION,
  FOLLOWME,
  TXTPLACEHOLDER,
  UNFOLLOWME,
  VersionType,
} from "./constants";
import {
  JSONFollowMessageGenerator,
  TXTFollowMessageGenerator,
} from "./message";
import { debounce, elemToSelector, getTargetBasedOnAttr } from "./common";

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

const VERSION_TO_SENDER_FACTORY_MAPPER: Record<VersionType, CommandSender> = {
  V1: new CommandSenderV1(),
};

export const getSenderFromVersion = (version: VersionType) => {
  return VERSION_TO_SENDER_FACTORY_MAPPER[version];
};

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

export const handleClick =
  (
    sendMessage: (
      data: string | ArrayBufferLike | Blob | ArrayBufferView,
    ) => void,
  ) =>
  (e: MouseEvent) => {
    const target = getTargetBasedOnAttr(e, "CLICK");
    if (target == null) return;

    const data = elemToSelector(target);
    const sender = getSenderFromVersion(CURRENT_VERSION);

    sender.send("CLICK", { selector: data }, sendMessage);
  };

export const handleMouseDown =
  (
    sendMessage: (
      data: string | ArrayBufferLike | Blob | ArrayBufferView,
    ) => void,
  ) =>
  (e: MouseEvent) => {
    const target = getTargetBasedOnAttr(e, "MOUSE_DOWN");
    if (target == null) return;

    const data = elemToSelector(target);
    const sender = getSenderFromVersion(CURRENT_VERSION);

    sender.send("MOUSE_DOWN", { selector: data }, sendMessage);
  };

export const handleScroll = (
  sendMessage: (
    data: string | ArrayBufferLike | Blob | ArrayBufferView,
  ) => void,
) =>
  debounce((e: Event) => {
    const target = getTargetBasedOnAttr(e, "SCROLL");
    if (target == null) return;

    const top = target.scrollTop;
    const left = target.scrollLeft;
    const sender = getSenderFromVersion(CURRENT_VERSION);
    debugger;

    sender.send(
      "SCROLL",
      { selector: elemToSelector(target), top, left },
      sendMessage,
    );
  });

export const handleInput = (
  sendMessage: (
    data: string | ArrayBufferLike | Blob | ArrayBufferView,
  ) => void,
) =>
  debounce((e: Event) => {
    const target = getTargetBasedOnAttr(e, "INPUT") as HTMLInputElement;
    if (target == null) return;

    const value = target.value;
    const sender = getSenderFromVersion(CURRENT_VERSION);

    sender.send(
      "INPUT",
      {
        selector: elemToSelector(e.target as HTMLInputElement),
        value,
      },
      sendMessage,
    );
  });

export const handleHover = (
  sendMessage: (
    data: string | ArrayBufferLike | Blob | ArrayBufferView,
  ) => void,
) =>
  debounce((e: MouseEvent) => {
    const target = getTargetBasedOnAttr(e, "HOVER");
    if (target == null) return;
    const sender = getSenderFromVersion(CURRENT_VERSION);

    sender.send("HOVER", { selector: elemToSelector(target) }, sendMessage);
  });

export const handleMouseEnter = (
  sendMessage: (
    data: string | ArrayBufferLike | Blob | ArrayBufferView,
  ) => void,
) =>
  debounce((e: MouseEvent) => {
    const target = getTargetBasedOnAttr(e, "MOUSE_ENTER");
    if (target == null) return;
    const sender = getSenderFromVersion(CURRENT_VERSION);

    sender.send(
      "MOUSE_ENTER",
      { selector: elemToSelector(target) },
      sendMessage,
    );
  });

export const handleMouseLeave = (
  sendMessage: (
    data: string | ArrayBufferLike | Blob | ArrayBufferView,
  ) => void,
) =>
  debounce((e: MouseEvent) => {
    const target = getTargetBasedOnAttr(e, "MOUSE_LEAVE");
    if (target == null) return;
    const sender = getSenderFromVersion(CURRENT_VERSION);

    sender.send(
      "MOUSE_LEAVE",
      { selector: elemToSelector(target) },
      sendMessage,
    );
  });
