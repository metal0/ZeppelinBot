import { GuildChannel, GuildMember, User } from "discord.js";
import { guildPluginMessageCommand, parseSignature } from "knub";
import { commandTypes } from "../../commandTypes";
import { createTypedTemplateSafeValueContainer, TemplateSafeValueContainer } from "../../templateFormatter";
import { UnknownUser } from "../../utils";
import { isScalar } from "../../utils/isScalar";
import {
  channelToTemplateSafeChannel,
  memberToTemplateSafeMember,
  messageToTemplateSafeMessage,
  userToTemplateSafeUser,
} from "../../utils/templateSafeObjects";
import { zeppelinGuildPlugin } from "../ZeppelinPluginBlueprint";
import { runEvent } from "./functions/runEvent";
import { ConfigSchema, CustomEventsPluginType } from "./types";

const defaultOptions = {
  config: {
    events: {},
  },
};

export const CustomEventsPlugin = zeppelinGuildPlugin<CustomEventsPluginType>()({
  name: "custom_events",
  showInDocs: false,

  configSchema: ConfigSchema,
  defaultOptions,

  afterLoad(pluginData) {
    const config = pluginData.config.get();
    for (const [key, event] of Object.entries(config.events)) {
      if (event.trigger.type === "command") {
        const signature = event.trigger.params ? parseSignature(event.trigger.params, commandTypes) : {};
        const eventCommand = guildPluginMessageCommand({
          trigger: event.trigger.name,
          permission: `events.${key}.trigger.can_use`,
          signature,
          run({ message, args }) {
            const safeArgs = new TemplateSafeValueContainer();
            for (const [argKey, argValue] of Object.entries(args as Record<string, unknown>)) {
              if (argValue instanceof User || argValue instanceof UnknownUser) {
                safeArgs[argKey] = userToTemplateSafeUser(argValue);
              } else if (argValue instanceof GuildMember) {
                safeArgs[argKey] = memberToTemplateSafeMember(argValue);
              } else if (argValue instanceof GuildChannel && argValue.isTextBased()) {
                safeArgs[argKey] = channelToTemplateSafeChannel(argValue);
              } else if (isScalar(argValue)) {
                safeArgs[argKey] = argValue;
              }
            }

            const values = createTypedTemplateSafeValueContainer({
              ...safeArgs,
              msg: messageToTemplateSafeMessage(message),
            });

            runEvent(pluginData, event, { msg: message, args }, values);
          },
        });
        // FIXME: Typings
        // pluginData.messageCommands.add(eventCommand);
      }
    }
  },

  beforeUnload() {
    // TODO: Run clearTriggers() once we actually have something there
  },

  // FIXME: Proper inherittance from ZeppelinPluginBlueprint
  configParser: (o: any) => o,
});
