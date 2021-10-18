import { MessageType } from "discord-api-types";
import { GuildChannel, Permissions } from "discord.js";
import { LogType } from "../../../data/LogType";
import { isDiscordAPIError } from "../../../utils";
import { getMissingChannelPermissions } from "../../../utils/getMissingChannelPermissions";
import { missingPermissionError } from "../../../utils/missingPermissionError";
import { readChannelPermissions } from "../../../utils/readChannelPermissions";
import { LogsPlugin } from "../../Logs/LogsPlugin";
import { autoReactionsEvt } from "../types";

const p = Permissions.FLAGS;

export const AddReactionsEvt = autoReactionsEvt({
  event: "messageCreate",
  allowBots: true,
  allowSelf: true,

  async listener({ pluginData, args: { message } }) {
    const autoReaction = await pluginData.state.autoReactions.getForChannel(message.channel.id);
    if (!autoReaction) return;

    const me = pluginData.guild.me ?? (await pluginData.guild.members.fetch(pluginData.client.user!.id)!);
    if (me) {
      const missingPermissions = getMissingChannelPermissions(
        me,
        message.channel as GuildChannel,
        readChannelPermissions | p.ADD_REACTIONS,
      );
      if (missingPermissions) {
        const logs = pluginData.getPlugin(LogsPlugin);
        logs.logBotAlert({
          body: `Cannot apply auto-reactions in <#${message.channel.id}>. ${missingPermissionError(
            missingPermissions,
          )}`,
        });
        return;
      }
    }

    if (message.type !== "DEFAULT" || message.author.id === me.id) return;

    for (const reaction of autoReaction.reactions) {
      try {
        await message.react(reaction);
      } catch (e) {
        if (isDiscordAPIError(e)) {
          const logs = pluginData.getPlugin(LogsPlugin);
          if (e.code === 10008) {
            logs.logBotAlert({
              body: `Could not apply auto-reactions in <#${message.channel.id}> for message \`${message.id}\`. Make sure nothing is deleting the message before the reactions are applied.`,
            });
          } else {
            logs.logBotAlert({
              body: `Could not apply auto-reactions in <#${message.channel.id}> for message \`${message.id}\`. Error code ${e.code}.`,
            });
          }

          break;
        } else {
          throw e;
        }
      }
    }
  },
});
