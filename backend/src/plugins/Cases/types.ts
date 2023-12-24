import * as t from "io-ts";
import { BasePluginType } from "knub";
import { CaseNameToType, CaseTypes } from "../../data/CaseTypes";
import { GuildArchives } from "../../data/GuildArchives";
import { GuildCases } from "../../data/GuildCases";
import { GuildLogs } from "../../data/GuildLogs";
import { GuildSavedMessages } from "../../data/GuildSavedMessages";
import { tDelayString, tNullable, tPartialDictionary } from "../../utils";
import { tColor } from "../../utils/tColor";

export const ConfigSchema = t.type({
  log_automatic_actions: t.boolean,
  case_log_channel: tNullable(t.string),
  show_relative_times: t.boolean,
  relative_time_cutoff: tDelayString,
  guild_aliases: tNullable(t.record(t.string, t.string)),
  case_colors: tNullable(tPartialDictionary(t.keyof(CaseNameToType), tColor)),
  case_icons: tNullable(tPartialDictionary(t.keyof(CaseNameToType), t.string)),
  log_each_massban_case: t.boolean,
  log_each_massunban_case: t.boolean,
  embed_colour: t.number,
  embed_color: t.number,
});
export type TConfigSchema = t.TypeOf<typeof ConfigSchema>;

export interface CasesPluginType extends BasePluginType {
  config: TConfigSchema;
  state: {
    logs: GuildLogs;
    cases: GuildCases;
    archives: GuildArchives;
    savedMessages: GuildSavedMessages;
  };
}

/**
 * Can also be used as a config object for functions that create cases
 */
export type CaseArgs = {
  userId: string;
  modId: string;
  ppId?: string;
  type: CaseTypes;
  auditLogId?: string;
  reason?: string;
  automatic?: boolean;
  postInCaseLogOverride?: boolean;
  noteDetails?: string[];
  extraNotes?: string[];
  hide?: boolean;
};

export type CaseNoteArgs = {
  caseId: number;
  modId: string;
  body: string;
  automatic?: boolean;
  postInCaseLogOverride?: boolean;
  noteDetails?: string[];
};
