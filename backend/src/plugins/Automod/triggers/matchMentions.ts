import * as t from "io-ts";
import { tNullable } from "../../../utils";
import { getTextMatchPartialSummary } from "../functions/getTextMatchPartialSummary";
import { automodTrigger } from "../helpers";

interface MatchResultType {
  reason: "everyone" | "repliedUser" | "users" | "roles";
}

const summaryType: Record<MatchResultType["reason"], string> = {
  everyone: "everyone",
  repliedUser: "replied user",
  users: "user",
  roles: "role",
};

export const MatchMentionsTrigger = automodTrigger<MatchResultType>()({
  configType: t.type({
    everyone: tNullable(t.boolean),
    replied_user: tNullable(t.boolean),
    roles: tNullable(t.array(t.string)),
    users: tNullable(t.array(t.string)),
  }),

  defaultConfig: {
    everyone: false,
    replied_user: false,
    roles: [],
    users: [],
  },

  async match({ pluginData, context, triggerConfig }) {
    if (!context.message) return;

    const channel = pluginData.client.channels.resolve(context.message.channel_id);
    if (!channel || !channel?.isText()) return;
    const message = channel.messages.resolve(context.message.id);
    if (!message) return;

    if (triggerConfig.everyone && message.mentions.everyone) {
      return {
        extra: {
          reason: "everyone",
        },
      };
    }

    /* tslint:disable-next-line */
    repliedUserBlock: if (triggerConfig.replied_user && message.mentions.repliedUser) {
      if (triggerConfig.users && !triggerConfig.users.includes(message.mentions.repliedUser.id)) {
        break repliedUserBlock;
      }
      return {
        extra: {
          reason: "repliedUser",
        },
      };
    }

    const mentionedUsers = [...message.mentions.users.values()];
    if (triggerConfig.users?.length) {
      const matchedUsers = mentionedUsers.filter(u => triggerConfig.users!.includes(u.id));
      if (matchedUsers.length) {
        return {
          extra: {
            reason: "users",
          },
        };
      }
    }

    const mentionedRoles = [...message.mentions.roles.values()];
    if (triggerConfig.roles?.length) {
      const matchedRoles = mentionedRoles.filter(r => triggerConfig.roles!.includes(r.id));
      if (matchedRoles.length) {
        return {
          extra: {
            reason: "roles",
          },
        };
      }
    }

    return null;
  },

  renderMatchInformation({ pluginData, contexts, matchResult }) {
    const partialSummary = getTextMatchPartialSummary(pluginData, "message", contexts[0]);
    return `Matched ${summaryType[matchResult.extra.reason]} mention in ${partialSummary}`;
  },
});
