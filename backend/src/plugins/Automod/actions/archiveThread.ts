import { ThreadChannel } from "discord.js";
import * as t from "io-ts";
import { noop } from "../../../utils";
import { automodAction } from "../helpers";

export const ArchiveThreadAction = automodAction({
  configType: t.type({}),
  defaultConfig: {},

  async apply({ pluginData, contexts }) {
    const threads = contexts
      .filter(c => c.thread?.id)
      .map(c => pluginData.guild.channels.cache.get(c.thread!.id))
      .filter((c): c is ThreadChannel => (c?.isThread() && !c.archived) ?? false);

    for (const thread of threads) {
      await thread.setArchived().catch(noop);
    }
  },
});
