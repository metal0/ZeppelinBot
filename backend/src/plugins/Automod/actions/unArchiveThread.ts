import { GuildChannel, ThreadChannel } from "discord.js";
import * as t from "io-ts";
import { noop, tNullable } from "../../../utils";
import { automodAction } from "../helpers";

export const UnArchiveThreadAction = automodAction({
  configType: t.type({
    unlock: tNullable(t.boolean),
  }),
  defaultConfig: {
    unlock: false,
  },

  async apply({ pluginData, contexts, actionConfig }) {
    const threads = await Promise.all(
      contexts
        .filter((c) => c.channel?.id)
        .map(
          async (c) =>
            pluginData.guild.channels.fetch(c.channel!.id).catch(noop) as Promise<GuildChannel | ThreadChannel | null>,
        ),
    );
    const filtered: ThreadChannel[] = threads.filter((c): c is ThreadChannel => c?.isThread() ?? false);

    for (const thread of filtered) {
      if (actionConfig.unlock && thread.locked) {
        await thread.setLocked(false).catch(noop);
      }
      if (!thread.archived) continue;
      await thread.setArchived(false).catch(noop);
    }
  },
});
