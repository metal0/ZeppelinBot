import { MessageOptions, Permissions, Snowflake, TextChannel, ThreadChannel, User } from "discord.js";
import * as t from "io-ts";
import { savedMessageToTemplateSafeSavedMessage, userToTemplateSafeUser } from "../../../utils/templateSafeObjects";
import { renderTemplate, TemplateSafeValueContainer } from "../../../templateFormatter";
import {
  convertDelayStringToMS,
  noop,
  renderRecursively,
  tDelayString,
  tMessageContent,
  tNullable,
  unique,
  validateAndParseMessageContent,
  verboseChannelMention,
} from "../../../utils";
import { hasDiscordPermissions } from "../../../utils/hasDiscordPermissions";
import { automodAction } from "../helpers";
import { AutomodContext } from "../types";
import { LogsPlugin } from "../../Logs/LogsPlugin";
import { messageIsEmpty } from "../../../utils/messageIsEmpty";

export const ReplyAction = automodAction({
  configType: t.union([
    t.string,
    t.type({
      text: tMessageContent,
      auto_delete: tNullable(t.union([tDelayString, t.number])),
      inline: tNullable(t.boolean),
    }),
  ]),

  defaultConfig: {},

  async apply({ pluginData, contexts, actionConfig, ruleName }) {
    const contextsWithTextChannels = contexts
      .filter((c) => c.channel?.id || c.message?.channel_id)
      .filter((c) => {
        const channel = pluginData.guild.channels.cache.get(c.message!.channel_id as Snowflake);
        return channel?.isText();
      });

    const message = contexts.find((c) => c.message)?.message;
    const contextsByChannelId = contextsWithTextChannels.reduce((map: Map<string, AutomodContext[]>, context) => {
      const chId = context.channel?.id ?? context.message!.channel_id;
      if (!map.has(chId)) {
        map.set(chId, []);
      }

      map.get(chId)!.push(context);
      return map;
    }, new Map());

    for (const [channelId, _contexts] of contextsByChannelId.entries()) {
      const users = unique(Array.from(new Set(_contexts.map((c) => c.user).filter(Boolean)))) as User[];
      const user = users[0];

      const renderReplyText = async (str: string) =>
        renderTemplate(
          str,
          new TemplateSafeValueContainer({
            user: userToTemplateSafeUser(user),
            message: message ? savedMessageToTemplateSafeSavedMessage(message) : null,
          }),
        );

      const formatted =
        typeof actionConfig === "string"
          ? await renderReplyText(actionConfig)
          : ((await renderRecursively(actionConfig.text, renderReplyText)) as MessageOptions);

      if (formatted) {
        const channel = pluginData.guild.channels.cache.get(channelId as Snowflake) as TextChannel;

        // Check for basic Send Messages and View Channel permissions
        if (
          !hasDiscordPermissions(
            channel.permissionsFor(pluginData.client.user!.id),
            Permissions.FLAGS.SEND_MESSAGES | Permissions.FLAGS.VIEW_CHANNEL,
          )
        ) {
          pluginData.getPlugin(LogsPlugin).logBotAlert({
            body: `Missing permissions to reply in ${verboseChannelMention(channel)} in Automod rule \`${ruleName}\``,
          });
          continue;
        }

        // If the message is an embed, check for embed permissions
        if (
          typeof formatted !== "string" &&
          !hasDiscordPermissions(channel.permissionsFor(pluginData.client.user!.id), Permissions.FLAGS.EMBED_LINKS)
        ) {
          pluginData.getPlugin(LogsPlugin).logBotAlert({
            body: `Missing permissions to reply **with an embed** in ${verboseChannelMention(
              channel,
            )} in Automod rule \`${ruleName}\``,
          });
          continue;
        }

        const messageContent = validateAndParseMessageContent(formatted);

        const messageOpts: MessageOptions = {
          ...messageContent,
          allowedMentions: {
            users: [user.id],
          },
        };

        if (typeof actionConfig !== "string" && actionConfig.inline && _contexts[0].message) {
          messageOpts.reply = {
            failIfNotExists: false,
            messageReference: _contexts[0].message!.id,
          };
        }

        if (messageIsEmpty(messageOpts)) {
          return;
        }

        const replyMsg = await channel.send(messageOpts);

        if (typeof actionConfig === "object" && actionConfig.auto_delete) {
          const delay = convertDelayStringToMS(String(actionConfig.auto_delete))!;
          setTimeout(() => !replyMsg.deleted && replyMsg.delete().catch(noop), delay);
        }
      }
    }
  },
});
