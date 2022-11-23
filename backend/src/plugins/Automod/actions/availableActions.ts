import * as t from "io-ts";
import { AutomodActionBlueprint } from "../helpers";
import { AddRolesAction } from "./addRoles";
import { AddToCounterAction } from "./addToCounter";
import { AlertAction } from "./alert";
import { ArchiveThreadAction } from "./archiveThread";
import { BanAction } from "./ban";
import { ChangeNicknameAction } from "./changeNickname";
import { ChangePermsAction } from "./changePerms";
import { ChangeRolesAction } from "./changeRoles";
import { CleanAction } from "./clean";
import { CrosspostMessageAction } from "./crosspostMessage";
import { KickAction } from "./kick";
import { LogAction } from "./log";
import { MuteAction } from "./mute";
import { RemoveRolesAction } from "./removeRoles";
import { ReplyAction } from "./reply";
import { SetAntiraidLevelAction } from "./setAntiraidLevel";
import { SetCounterAction } from "./setCounter";
import { SetSlowmodeAction } from "./setSlowmode";
import { StartThreadAction } from "./startThread";
import { UnArchiveThreadAction } from "./unArchiveThread";
import { WarnAction } from "./warn";

export const availableActions: Record<string, AutomodActionBlueprint<any>> = {
  clean: CleanAction,
  warn: WarnAction,
  mute: MuteAction,
  kick: KickAction,
  ban: BanAction,
  alert: AlertAction,
  change_nickname: ChangeNicknameAction,
  log: LogAction,
  add_roles: AddRolesAction,
  remove_roles: RemoveRolesAction,
  set_antiraid_level: SetAntiraidLevelAction,
  reply: ReplyAction,
  add_to_counter: AddToCounterAction,
  set_counter: SetCounterAction,
  set_slowmode: SetSlowmodeAction,
  start_thread: StartThreadAction,
  archive_thread: ArchiveThreadAction,
  crosspost_message: CrosspostMessageAction,
  change_roles: ChangeRolesAction,
  unarchive_thread: UnArchiveThreadAction,
  change_perms: ChangePermsAction,
};

export const AvailableActions = t.type({
  clean: CleanAction.configType,
  warn: WarnAction.configType,
  mute: MuteAction.configType,
  kick: KickAction.configType,
  ban: BanAction.configType,
  alert: AlertAction.configType,
  change_nickname: ChangeNicknameAction.configType,
  log: LogAction.configType,
  add_roles: AddRolesAction.configType,
  remove_roles: RemoveRolesAction.configType,
  set_antiraid_level: SetAntiraidLevelAction.configType,
  reply: ReplyAction.configType,
  add_to_counter: AddToCounterAction.configType,
  set_counter: SetCounterAction.configType,
  set_slowmode: SetSlowmodeAction.configType,
  start_thread: StartThreadAction.configType,
  archive_thread: ArchiveThreadAction.configType,
  crosspost_message: CrosspostMessageAction.configType,
  change_roles: ChangeRolesAction.configType,
  unarchive_thread: UnArchiveThreadAction.configType,
  change_perms: ChangePermsAction.configType,
});
