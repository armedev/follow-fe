import { CommandType, VersionType } from "./constants";
import { JSONPLACEHOLDER, TXTPLACEHOLDER } from "./constants";

type EncryptedFollowMessage = string;

interface FollowMessageEncryptor {
  encryptMessageWith(
    version: VersionType,
    command: CommandType,
  ): EncryptedFollowMessage;
}

interface FollowMessageDecryptor<T extends string | Record<string, unknown>> {
  decryptMessage(): DecryptMessageType<T>;
}

export class TXTFollowMessageGenerator implements FollowMessageEncryptor {
  constructor(private data: string | null) {}

  encryptMessageWith(version: VersionType, command: CommandType) {
    const message: string[] = [version, command];
    if (this.data) {
      message.push(this.data);
    }
    return `${TXTPLACEHOLDER}${message.join("::")}` as EncryptedFollowMessage;
  }
}

export type DecryptMessageType<T extends string | Record<string, unknown>> = {
  placeholder: typeof TXTPLACEHOLDER | typeof JSONPLACEHOLDER;
  version: VersionType;
  command: CommandType;
  data: T;
};

export class TXTFollowMessageDecryptor
  implements FollowMessageDecryptor<string>
{
  constructor(private data: string) {}

  decryptMessage(): DecryptMessageType<string> {
    const [version, command, data] = this.data.split("::");

    return {
      placeholder: TXTPLACEHOLDER,
      version: version as VersionType,
      command: command as CommandType,
      data,
    };
  }
}

export class JSONFollowMessageGenerator implements FollowMessageEncryptor {
  constructor(private data: Record<string, unknown> | null) {}

  encryptMessageWith(version: VersionType, command: CommandType) {
    const message = { version, command } as {
      version: VersionType;
      command: CommandType;
      data?: Record<string, unknown>;
    };

    if (this.data != null) {
      message["data"] = this.data;
    }

    return `${JSONPLACEHOLDER}${JSON.stringify(message)}` as EncryptedFollowMessage;
  }
}

export class JSONFollowMessageDecryptor
  implements FollowMessageDecryptor<Record<string, unknown>>
{
  constructor(private data: Record<string, unknown>) {}

  decryptMessage(): DecryptMessageType<Record<string, unknown>> {
    const parsedJsonValue = this.data;

    const version = parsedJsonValue.version as VersionType;
    const command = parsedJsonValue.command as CommandType;
    const data = parsedJsonValue.data as Record<string, unknown>;

    return {
      placeholder: JSONPLACEHOLDER,
      version,
      command,
      data,
    };
  }
}

export const getFromBase64 = (
  data: string,
): string | Record<string, unknown> | null => {
  const convertedData = Buffer.from(data, "base64").toString();

  if (convertedData.includes(TXTPLACEHOLDER))
    return convertedData.replace(TXTPLACEHOLDER, "");
  else if (convertedData.includes(JSONPLACEHOLDER))
    return JSON.parse(convertedData.replace(JSONPLACEHOLDER, ""));

  return null;
};
