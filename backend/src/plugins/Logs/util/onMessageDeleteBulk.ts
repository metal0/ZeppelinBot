import { BaseGuildTextChannel, GuildTextBasedChannel, Snowflake, ThreadChannel } from "discord.js";
import { GuildPluginData } from "knub";
import { SavedMessage } from "../../../data/entities/SavedMessage";
import { LogType } from "../../../data/LogType";
import { getBaseUrl } from "../../../pluginUtils";
import { LogsPluginType } from "../types";
import { logMessageDeleteBulk } from "../logFunctions/logMessageDeleteBulk";
import { isLogIgnored } from "./isLogIgnored";
import { noop } from "../../../utils.js";

export async function onMessageDeleteBulk(pluginData: GuildPluginData<LogsPluginType>, savedMessages: SavedMessage[]) {
  if (isLogIgnored(pluginData, LogType.MESSAGE_DELETE, savedMessages[0].id)) {
    return;
  }

  const channel = (await pluginData.guild.channels
    .fetch(savedMessages[0].channel_id as Snowflake)
    .catch(noop)) as GuildTextBasedChannel;
  const archiveId = await pluginData.state.archives.createFromSavedMessages(savedMessages, pluginData.guild);
  const archiveUrl = pluginData.state.archives.getUrl(getBaseUrl(pluginData), archiveId);
  const authorIds = Array.from(new Set(savedMessages.map((item) => `\`${item.user_id}\``)));

  logMessageDeleteBulk(pluginData, {
    count: savedMessages.length,
    authorIds,
    channel,
    archiveUrl,
  });
}
