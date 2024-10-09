export const COMMANDS = {
  CLICK: "CLICK",
  SCROLL: "SCROLL",
  INPUT: "INPUT",
  URL: "URL",
  LOCAL_STORAGE: "LOCAL_STORAGE",
};

export type LeaderType = "all-client" | "client" | "leader";

export type CommandType = keyof typeof COMMANDS;

export type DataIgnoreType = Exclude<CommandType, "URL">;

export const VERSIONS = {
  V1: "V1",
};

export type VersionType = keyof typeof VERSIONS;

export const CURRENT_VERSION: VersionType = "V1";

export const TXTPLACEHOLDER = "TXT::";
export const JSONPLACEHOLDER = "JSON::";

export const FOLLOWME = `FOLLOWME`;
export const UNFOLLOWME = `UNFOLLOWME`;

export const WS_LOCAL_STORAGE_UPDATE = "ws_local_storage_update";

export const BLACKLISTED_LOCAL_STORAGE_KEYS = ["aly-cache"];

export const ALLOWED_LOCAL_STORAGE_KEYS = ["hello"];
