import { GuildPluginData } from "knub";
import { LogsPluginType } from "../types";
import { LogType } from "../../../data/LogType";
import { log } from "../util/log";
import { createTypedTemplateSafeValueContainer } from "../../../templateFormatter";
import { User } from "discord.js";
import { userToTemplateSafeUser } from "../../../utils/templateSafeObjects";

interface LogMassWarnData {
  mod: User;
  count: number;
  reason: string;
}

export function logMassWarn(pluginData: GuildPluginData<LogsPluginType>, data: LogMassWarnData) {
  return log(
    pluginData,
    LogType.MASSWARN,
    createTypedTemplateSafeValueContainer({
      mod: userToTemplateSafeUser(data.mod),
      count: data.count,
      reason: data.reason,
    }),
    {},
  );
}
