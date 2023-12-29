import { guildPluginMessageCommand } from "knub";
import { isStaffPreFilter, sendErrorMessage, sendSuccessMessage } from "../../../pluginUtils";
import { sync } from "../functions/sync";
import { GuildBanSyncPluginType } from "../types";

export const SyncBansCmd = guildPluginMessageCommand<GuildBanSyncPluginType>()({
  trigger: ["sync_bans", "ban_sync"],
  permission: null,
  config: {
    preFilters: [isStaffPreFilter],
  },

  signature: {},

  async run({ pluginData, message: msg }) {
    try {
      const res = await sync(pluginData);
      if (res === null) {
        sendErrorMessage(pluginData, msg.channel, `Failed to sync bans! (Already initialized?)`);
        return;
      }
      if (res === 0) {
        sendErrorMessage(pluginData, msg.channel, `No bans needing sync were found`);
        return;
      }
      sendSuccessMessage(pluginData, msg.channel, `Synced ${res} guild bans!`);
    } catch (err) {
      sendErrorMessage(pluginData, msg.channel, `Error while syncing bans: \`\`\`\n${err.stack}\n\`\`\``);
    }
  },
});
