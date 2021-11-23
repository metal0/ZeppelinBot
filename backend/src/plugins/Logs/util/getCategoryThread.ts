import { ThreadAutoArchiveDuration } from "discord-api-types";
import { NewsChannel, TextChannel, ThreadChannel } from "discord.js";
import { GuildPluginData } from "knub";
import { noop } from "../../../utils";
import { logCategoryLock } from "../../../utils/lockNameHelpers";
import { LogsPluginType } from "../types";

async function refreshThreadCache(pluginData: GuildPluginData<LogsPluginType>, channel: TextChannel | NewsChannel) {
  if (pluginData.state.cachedCategories.includes(channel.id)) return;
  if (!pluginData.state.categorizedLogThreadMap[channel.id]) {
    pluginData.state.categorizedLogThreadMap[channel.id] = new Map();
  }
  const active = await channel.threads.fetchActive(false);
  const archived = await channel.threads.fetchArchived({ type: "public" }, false);

  for (const [key, opts] of active.threads.entries()) {
    if (!pluginData.state.categorizedLogThreadMap[channel.id].has(opts.name)) {
      pluginData.state.categorizedLogThreadMap[channel.id].set(opts.name, key);
    }
  }

  for (const [key, opts] of archived.threads.entries()) {
    if (!pluginData.state.categorizedLogThreadMap[channel.id].has(opts.name)) {
      pluginData.state.categorizedLogThreadMap[channel.id].set(opts.name, key);
    }
  }

  pluginData.state.cachedCategories.push(channel.id);
}

export async function getCategoryThread(
  pluginData: GuildPluginData<LogsPluginType>,
  channel: TextChannel | NewsChannel,
  objectId: string,
): Promise<ThreadChannel | void> {
  await refreshThreadCache(pluginData, channel);
  const objectThread = pluginData.state.categorizedLogThreadMap[channel.id].has(objectId)
    ? await channel.threads.fetch(pluginData.state.categorizedLogThreadMap[channel.id].get(objectId)!)
    : null;
  if (objectThread) {
    return objectThread;
  }

  const lock = await pluginData.locks.acquire(logCategoryLock({ id: channel.id }, { id: objectId }));

  // check again
  const objectThread2 = pluginData.state.categorizedLogThreadMap[channel.id].has(objectId)
    ? await channel.threads.fetch(pluginData.state.categorizedLogThreadMap[channel.id].get(objectId)!)
    : null;
  if (objectThread2) {
    lock.unlock();
    return objectThread2;
  }

  const newThread = await channel.threads
    .create({
      name: objectId,
      autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
    })
    .catch(noop);
  if (newThread) pluginData.state.categorizedLogThreadMap[channel.id].set(objectId, newThread.id);
  lock.unlock();
  return newThread;
}
