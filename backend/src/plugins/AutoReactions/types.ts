import * as t from "io-ts";
import { BasePluginType, typedGuildCommand, typedGuildEventListener } from "knub";
import { GuildAutoReactions } from "../../data/GuildAutoReactions";
import { GuildLogs } from "../../data/GuildLogs";
import { GuildSavedMessages } from "../../data/GuildSavedMessages";
import { AutoReaction } from "../../data/entities/AutoReaction";

export const ConfigSchema = t.type({
  can_manage: t.boolean,
});
export type TConfigSchema = t.TypeOf<typeof ConfigSchema>;

export interface AutoReactionsPluginType extends BasePluginType {
  config: TConfigSchema;
  state: {
    logs: GuildLogs;
    savedMessages: GuildSavedMessages;
    autoReactions: GuildAutoReactions;
    cache: Map<string, AutoReaction | null>;
  };
}

export const autoReactionsCmd = typedGuildCommand<AutoReactionsPluginType>();
export const autoReactionsEvt = typedGuildEventListener<AutoReactionsPluginType>();
