import { Message, MessageOptions, NewsChannel, TextChannel, ThreadChannel, WebhookClient } from "discord.js";
import { GuildPluginData } from "knub";
import { InternalPosterPluginType } from "../types";
import { getOrCreateWebhookForChannel } from "./getOrCreateWebhookForChannel";
import { APIMessage } from "discord-api-types";
import { isDiscordAPIError } from "../../../utils";
import { getOrCreateWebhookClientForChannel } from "./getOrCreateWebhookClientForChannel";
import { ChannelTypeStrings } from "../../../types";

export type InternalPosterMessageResult = {
  id: string;
  channelId: string;
};

async function sendDirectly(
  channel: TextChannel | NewsChannel | ThreadChannel,
  content: MessageOptions,
): Promise<InternalPosterMessageResult | null> {
  return channel.send(content).then((message) => ({
    id: message.id,
    channelId: message.channelId,
  }));
}

/**
 * Sends a message using a webhook or direct API requests, preferring webhooks when possible.
 */
export async function sendMessage(
  pluginData: GuildPluginData<InternalPosterPluginType>,
  channel: TextChannel | NewsChannel | ThreadChannel,
  content: MessageOptions,
): Promise<InternalPosterMessageResult | null> {
  return pluginData.state.queue.add(async () => {
    const webhookClient = await getOrCreateWebhookClientForChannel(pluginData, channel);
    if (!webhookClient || channel.type === ChannelTypeStrings.PRIVATE_THREAD) {
      return sendDirectly(channel, content);
    }

    return webhookClient
      .send({
        ...content,
        ...(pluginData.client.user && {
          username: pluginData.client.user.username,
          avatarURL: pluginData.client.user.avatarURL() || pluginData.client.user.defaultAvatarURL,
          threadId: channel instanceof ThreadChannel ? channel.id : undefined,
        }),
      })
      .then((apiMessage) => ({
        id: apiMessage.id,
        channelId: apiMessage.channel_id,
      }))
      .catch(async (err) => {
        // Unknown Webhook
        if (isDiscordAPIError(err) && err.code === 10015) {
          await pluginData.state.webhooks.delete(webhookClient.id);
          pluginData.state.webhookClientCache.delete(channel.id);

          // Fallback to regular message for this log message
          return sendDirectly(channel, content);
        }

        throw err;
      });
  });
}
