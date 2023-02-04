import { GuildChannel, ThreadChannel } from "discord.js";
import * as t from "io-ts";
import { noop, tNullable } from "../../../utils";
import { automodAction } from "../helpers";

export const ArchiveThreadAction = automodAction({
  configType: t.type({
    lock: tNullable(t.boolean),
  }),
  defaultConfig: {
    lock: false,
  },

  async apply({ pluginData, contexts, actionConfig }) {
    const threads = await Promise.all(
      contexts
        .filter((c) => c.channel?.id)
        .map(
          async (c) => pluginData.guild.channels.fetch(c.channel!.id) as Promise<GuildChannel | ThreadChannel | null>,
        ),
    );
    const filtered: ThreadChannel[] = threads.filter((c): c is ThreadChannel => c?.isThread() ?? false);

    for (const thread of filtered) {
      if (actionConfig.lock && !thread.locked) {
        await thread.setLocked().catch(noop);
      }
      if (thread.archived) continue;
      await thread.setArchived().catch(noop);
    }
  },
});
