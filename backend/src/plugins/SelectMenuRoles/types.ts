import * as t from "io-ts";
import { BasePluginType, typedGuildCommand, typedGuildEventListener } from "knub";
import { GuildSelectRoles } from "src/data/GuildSelectRoles";
import { GuildSavedMessages } from "../../data/GuildSavedMessages";
import { Queue } from "../../Queue";
import { tNullable } from "../../utils";

const SelectMenuItem = t.type({
  label: t.string,
  role: t.string,
  description: tNullable(t.string),
  emoji: tNullable(t.string),
  default: tNullable(t.boolean),
});
export type TSelectMenuItemOpts = t.TypeOf<typeof SelectMenuItem>;

const SelectMenuOpts = t.type({
  items: t.array(SelectMenuItem),
  placeholder: tNullable(t.string),
  minValues: tNullable(t.number),
  maxValues: tNullable(t.number),
  disabled: tNullable(t.boolean),
});
export type TSelectMenuOpts = t.TypeOf<typeof SelectMenuOpts>;

const SelectMenuPairOpts = t.type({
  message: t.string,
  menus: t.record(t.string, SelectMenuOpts),
});
export type TSelectMenuPairOpts = t.TypeOf<typeof SelectMenuPairOpts>;

export const ConfigSchema = t.type({
  select_groups: t.record(t.string, SelectMenuPairOpts),
  can_manage: t.boolean,
});
export type TConfigSchema = t.TypeOf<typeof ConfigSchema>;

export type RoleChangeMode = "+" | "-";

export type PendingMemberRoleChanges = {
  timeout: NodeJS.Timeout | null;
  applyFn: () => void;
  changes: Array<{
    mode: RoleChangeMode;
    roleId: string;
  }>;
};

export interface SelectMenuRolesPluginType extends BasePluginType {
  config: TConfigSchema;
  state: {
    savedMessages: GuildSavedMessages;
    selectMenus: GuildSelectRoles;

    reactionRemoveQueue: Queue;
    roleChangeQueue: Queue;
    pendingRoleChanges: Map<string, PendingMemberRoleChanges>;
    pendingRefreshes: Set<string>;

    autoRefreshTimeout: NodeJS.Timeout;
  };
}

export const interactionEvt = typedGuildEventListener<SelectMenuRolesPluginType>();
export const selectRolesCmd = typedGuildCommand<SelectMenuRolesPluginType>();
