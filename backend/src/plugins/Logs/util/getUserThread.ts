import { ThreadAutoArchiveDuration } from "discord-api-types";
import { NewsChannel, TextChannel, ThreadChannel } from "discord.js";
import { GuildPluginData } from "knub";
import { HOURS, noop } from "../../../utils";
import { LogsPluginType } from "../types";

async function refreshThreadCache(pluginData: GuildPluginData<LogsPluginType>, channel: TextChannel | NewsChannel) {
  if (!pluginData.state.fetchedUserLogsThreads) {
    await channel.threads.fetchActive(true);
    await channel.threads.fetchArchived({ type: "public" }, true);
    pluginData.state.fetchedUserLogsThreads = Date.now();
  } else {
    const timeSinceFetch = Date.now() - pluginData.state.fetchedUserLogsThreads;
    if (timeSinceFetch > HOURS) {
      await channel.threads.fetchActive(true);
      await channel.threads.fetchArchived({ type: "public" }, true);
      pluginData.state.fetchedUserLogsThreads = Date.now();
    }
  }
}

export async function getUserThread(
  pluginData: GuildPluginData<LogsPluginType>,
  channel: TextChannel | NewsChannel,
  userId: string,
): Promise<ThreadChannel | void> {
  await refreshThreadCache(pluginData, channel);
  const userThread = channel.threads.cache.find((tr) => tr.name === userId);
  if (!userThread) {
    return channel.threads
      .create({
        name: userId,
        autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
      })
      .catch(noop);
  }
  return userThread;
}
