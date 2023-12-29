import { PermissionsBitField } from "discord.js";
import { GuildPluginData } from "knub";
import { ERRORS, RecoverablePluginError } from "../../../RecoverablePluginError";
import { HOURS, noop } from "../../../utils.js";
import { GuildBanSyncPluginType } from "../types";

const BANS_PER_PAGE = 1000;

export async function sync(pluginData: GuildPluginData<GuildBanSyncPluginType>): Promise<number | null> {
  if (pluginData.state.initialized) return null;
  const count = await pluginData.state.bans.count();

  pluginData.state.initialized = true; // We don't want the section below this to run again

  // First, check that we have permission to fetch bans
  await pluginData.guild.members.fetchMe();
  if (!pluginData.guild.members.me?.permissions.has(PermissionsBitField.Flags.BanMembers)) {
    throw new RecoverablePluginError(ERRORS.MISSING_BAN_PERMS);
  }

  // Grab a lock
  const lock = await pluginData.locks.acquire(`initialSync`, 1 * HOURS);
  try {
    let previousId: string | undefined;
    // grab previous user ID safely
    if (count > 0) {
      const page = Math.floor(count / BANS_PER_PAGE);
      const offset = BANS_PER_PAGE * page;
      const data = await pluginData.state.bans.getMany(offset, BANS_PER_PAGE);
      // We need to double-check that the user is actually banned, otherwise the guild bans fetch might fail
      for (let i = 0; i < data.length; i++) {
        const isBanned = await pluginData.guild.bans.fetch({ user: data[i].user_id }).catch(noop);
        if (isBanned?.user) {
          previousId = isBanned.user.id;
          break;
        }
      }
      // We use the first (earliest) ban in this page because we want to check
      //  as "late" as possible if any bans got changed within this oldest page while the bot died
      //  without having to do any more dapi requests for fetching bans.
      // Not 100% reliable but, it is what it is.
    }

    // FIXME: will this lock the thread?
    let counter = 0;
    let firstRun = true;
    while (true) {
      console.log(`previousId: ${previousId}`);
      const pageBans = await pluginData.guild.bans
        .fetch({
          after: previousId ?? undefined,
          limit: BANS_PER_PAGE,
          cache: false,
        })
        .catch(noop);

      if (!pageBans) break;

      if (count > 0 && firstRun && previousId) {
        // TODO: Check changed entries
        const prev = (await pluginData.state.bans.find(previousId))!;
        //const dbData = pluginData.state.bans.getMany
      } else {
        // FIXME: Insert in batches instead !!!!!!! (important)
        await Promise.allSettled(
          [...pageBans.values()].map((ban) => pluginData.state.bans.create({ user_id: ban.user.id })),
        );
        counter += pageBans.size;
      }

      firstRun = false;

      if (pageBans.size < BANS_PER_PAGE) break;
      previousId = pageBans.last()!.user.id;
    }
    console.info(`Synced ${counter} bans for guild ${pluginData.guild.id} - "${pluginData.guild.name}"`);
    return counter;
  } finally {
    lock.unlock();
  }
}
