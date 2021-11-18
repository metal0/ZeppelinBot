import * as t from "io-ts";
import { MessageEmbedOptions, MessageMentionTypes, Snowflake, TextChannel } from "discord.js";
import { GuildPluginData } from "knub";
import { allowTimeout } from "../../../RegExpRunner";
import { ILogTypeData, LogsPluginType, TLogChannel, TLogChannelMap } from "../types";
import { getLogMessage } from "./getLogMessage";
import { TypedTemplateSafeValueContainer } from "../../../templateFormatter";
import { LogType } from "../../../data/LogType";
import { MessageBuffer } from "../../../utils/MessageBuffer";
import { createChunkedMessage, isDiscordAPIError, MINUTES } from "../../../utils";
import { InternalPosterPlugin } from "../../InternalPoster/InternalPosterPlugin";
import { getCategoryThread } from "./getCategoryThread";
import {
  TemplateSafeChannel,
  TemplateSafeMember,
  TemplateSafeRole,
  TemplateSafeUnknownMember,
  TemplateSafeUnknownUser,
  TemplateSafeUser,
} from "../../../utils/templateSafeObjects";

const excludedUserProps = ["user", "member", "mod"];
const excludedRoleProps = ["message.member.roles", "member.roles"];

function isRoleArray(value: any): value is string[] {
  return Array.isArray(value);
}

interface ExclusionData {
  userId?: Snowflake | null;
  bot?: boolean | null;
  roles?: Snowflake[] | null;
  channel?: Snowflake | null;
  category?: Snowflake | null;
  messageTextContent?: string | null;
}

const DEFAULT_BATCH_TIME = 1000;
const MIN_BATCH_TIME = 250;
const MAX_BATCH_TIME = 5000;

async function shouldExclude(
  pluginData: GuildPluginData<LogsPluginType>,
  opts: TLogChannel,
  exclusionData: ExclusionData,
): Promise<boolean> {
  if (opts.excluded_users && exclusionData.userId && opts.excluded_users.includes(exclusionData.userId)) {
    return true;
  }

  if (opts.exclude_bots && exclusionData.bot) {
    return true;
  }

  if (opts.excluded_roles && exclusionData.roles) {
    for (const role of exclusionData.roles) {
      if (opts.excluded_roles.includes(role)) {
        return true;
      }
    }
  }

  if (opts.excluded_channels && exclusionData.channel && opts.excluded_channels.includes(exclusionData.channel)) {
    return true;
  }

  if (opts.excluded_categories && exclusionData.category && opts.excluded_categories.includes(exclusionData.category)) {
    return true;
  }

  if (opts.excluded_message_regexes && exclusionData.messageTextContent) {
    for (const regex of opts.excluded_message_regexes) {
      const matches = await pluginData.state.regexRunner
        .exec(regex, exclusionData.messageTextContent)
        .catch(allowTimeout);
      if (matches) {
        return true;
      }
    }
  }

  return false;
}

async function sendLogMessage<TLogType extends keyof ILogTypeData>(
  pluginData: GuildPluginData<LogsPluginType>,
  opts: TLogChannel,
  channelId: string,
  type: TLogType,
  data: TypedTemplateSafeValueContainer<ILogTypeData[TLogType]>,
  exclusionData: ExclusionData = {},
) {
  const typeStr = LogType[type];
  const channel = pluginData.guild.channels.cache.get(channelId as Snowflake);
  if (!channel || (!channel.isText() && !channel.isThread())) return;
  if (pluginData.state.channelCooldowns.isOnCooldown(channelId)) return;
  if (opts.include?.length && !opts.include.includes(typeStr)) return;
  if (opts.exclude && opts.exclude.includes(typeStr)) return;
  if (await shouldExclude(pluginData, opts, exclusionData)) return;

  const message = await getLogMessage(pluginData, type, data, {
    format: opts.format,
    include_embed_timestamp: opts.include_embed_timestamp,
    timestamp_format: opts.timestamp_format,
  });
  if (!message) return;

  // Initialize message buffer for this channel
  if (!pluginData.state.buffers.has(channelId)) {
    const batchTime = Math.min(Math.max(opts.batch_time ?? DEFAULT_BATCH_TIME, MIN_BATCH_TIME), MAX_BATCH_TIME);
    const internalPosterPlugin = pluginData.getPlugin(InternalPosterPlugin);
    pluginData.state.buffers.set(
      channelId,
      new MessageBuffer({
        timeout: batchTime,
        textSeparator: "\n",
        consume: (part) => {
          const parse: MessageMentionTypes[] = pluginData.config.get().allow_user_mentions ? ["users"] : [];
          internalPosterPlugin
            .sendMessage(channel, {
              ...part,
              allowedMentions: { parse },
            })
            .catch((err) => {
              if (isDiscordAPIError(err)) {
                // Missing Access / Missing Permissions
                // TODO: Show/log this somewhere
                if (err.code === 50001 || err.code === 50013) {
                  pluginData.state.channelCooldowns.setCooldown(channelId, 2 * MINUTES);
                  return;
                }
              }

              // tslint:disable-next-line:no-console
              console.warn(`Error while sending ${typeStr} log to ${pluginData.guild.id}/${channelId}: ${err.message}`);
            });
        },
      }),
    );
  }

  // Add log message to buffer
  const buffer = pluginData.state.buffers.get(channelId)!;
  buffer.push({
    content: typeof message === "string" ? message : message.content || "",
    embeds: typeof message === "string" ? [] : ((message.embeds || []) as MessageEmbedOptions[]),
  });
}

export async function log<TLogType extends keyof ILogTypeData>(
  pluginData: GuildPluginData<LogsPluginType>,
  type: TLogType,
  data: TypedTemplateSafeValueContainer<ILogTypeData[TLogType]>,
  exclusionData: ExclusionData = {},
) {
  const logChannels: TLogChannelMap = pluginData.config.get().channels;

  logChannelLoop: for (const [channelId, opts] of Object.entries(logChannels)) {
    if (opts.categorize) {
      const channel = pluginData.guild.channels.cache.get(channelId as Snowflake);
      if (!channel || !channel.isText() || channel.isThread()) continue;
      // check object types for current log
      if (
        opts.categorize === "member" &&
        !(data.member instanceof TemplateSafeMember) &&
        !(data.user instanceof TemplateSafeUser) &&
        !(data.user instanceof TemplateSafeUnknownUser) &&
        !(data.member instanceof TemplateSafeUnknownMember) &&
        !data.userId
      ) {
        continue;
      } else if (opts.categorize === "role" && !(data.role instanceof TemplateSafeRole)) {
        continue;
      } else if (opts.categorize === "channel" && !(data.channel instanceof TemplateSafeChannel)) {
        continue;
      } else if (
        opts.categorize === "mod" &&
        !(data.mod instanceof TemplateSafeMember) &&
        !(data.mod instanceof TemplateSafeUser) &&
        !(data.mod instanceof TemplateSafeUnknownUser) &&
        !(data.mod instanceof TemplateSafeUnknownMember)
      ) {
        continue;
      }
      let objectId: string | null = null;
      switch (opts.categorize) {
        case "member":
          if (data.member instanceof TemplateSafeMember || data.member instanceof TemplateSafeUnknownMember) {
            objectId = data.member.id;
          }
          if (data.user instanceof TemplateSafeUser || data.user instanceof TemplateSafeUnknownUser) {
            objectId = data.user.id;
          }
          if (data.userId) {
            objectId = data.userId.toString();
          }
          break;
        case "mod":
          if (
            data.mod instanceof TemplateSafeMember ||
            data.mod instanceof TemplateSafeUnknownMember ||
            data.mod instanceof TemplateSafeUser ||
            data.mod instanceof TemplateSafeUnknownUser
          ) {
            objectId = data.mod.id;
          }
          break;
        case "role":
          if (data.role instanceof TemplateSafeRole) objectId = data.role.id;
          break;
        case "channel":
          if (data.channel instanceof TemplateSafeChannel) objectId = data.channel.id;
          break;
      }
      if (!objectId) continue;
      const catThread = await getCategoryThread(pluginData, channel, objectId);
      if (!catThread) {
        continue;
      }
      await sendLogMessage(pluginData, opts, catThread.id, type, data, exclusionData);

      continue;
    }
    await sendLogMessage(pluginData, opts, channelId, type, data, exclusionData);
  }
}
