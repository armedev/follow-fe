import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { getRunnerFromVersion } from "./commands";
import { FOLLOWME, LeaderType, UNFOLLOWME } from "./constants";
import {
  JSONFollowMessageDecryptor,
  TXTFollowMessageDecryptor,
} from "./message";
import { getFromBase64 } from "./message";
import { Dispatch, SetStateAction } from "react";

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
