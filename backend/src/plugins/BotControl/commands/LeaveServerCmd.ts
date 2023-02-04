import { Snowflake, TextChannel } from "discord.js";
import { commandTypeHelpers as ct } from "../../../commandTypes";
import { sendErrorMessage, sendSuccessMessage } from "../../../pluginUtils";
import { noop } from "../../../utils.js";
import { botControlCmd } from "../types";

export const LeaveServerCmd = botControlCmd({
  trigger: ["leave_server", "leave_guild"],
  permission: "can_admin",

  signature: {
    guildId: ct.string(),
  },

  async run({ pluginData, message: msg, args }) {
    if (!pluginData.client.guilds.cache.has(args.guildId as Snowflake)) {
      sendErrorMessage(pluginData, msg.channel as TextChannel, "I am not in that guild");
      return;
    }

    const guildToLeave = await pluginData.client.guilds.fetch(args.guildId as Snowflake).catch(noop);

    if (!guildToLeave) {
      sendErrorMessage(pluginData, msg.channel as TextChannel, `Couldn't fetch guild information`);
      return;
    }

    const guildName = guildToLeave.name;

    try {
      await pluginData.client.guilds.cache.get(args.guildId as Snowflake)?.leave();
    } catch (e) {
      sendErrorMessage(pluginData, msg.channel as TextChannel, `Failed to leave guild: ${e.message}`);
      return;
    }

    sendSuccessMessage(pluginData, msg.channel as TextChannel, `Left guild **${guildName}**`);
  },
});
