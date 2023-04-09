import { PluginOptions } from "knub";
import { onGuildEvent } from "../../data/GuildEvents";
import { GuildVCAlerts } from "../../data/GuildVCAlerts";
import { makeIoTsConfigParser } from "../../pluginUtils";
import { trimPluginDescription } from "../../utils";
import { zeppelinGuildPlugin } from "../ZeppelinPluginBlueprint";
import { FollowCmd } from "./commands/FollowCmd";
import { DeleteFollowCmd, ListFollowCmd } from "./commands/ListFollowCmd";
import { WhereCmd } from "./commands/WhereCmd";
import { GuildBanRemoveAlertsEvt } from "./events/BanRemoveAlertsEvt";
import { VoiceStateUpdateAlertEvt } from "./events/SendAlertsEvts";
import { ConfigSchema, LocateUserPluginType } from "./types";
import { clearExpiredAlert } from "./utils/clearExpiredAlert";
import { fillActiveAlertsList } from "./utils/fillAlertsList";

const defaultOptions: PluginOptions<LocateUserPluginType> = {
  config: {
    can_where: false,
    can_alert: false,
  },
  overrides: [
    {
      level: ">=50",
      config: {
        can_where: true,
        can_alert: true,
      },
    },
  ],
};

export const LocateUserPlugin = zeppelinGuildPlugin<LocateUserPluginType>()({
  name: "locate_user",
  showInDocs: true,
  info: {
    prettyName: "Locate user",
    description: trimPluginDescription(`
      This plugin allows users with access to the commands the following:
      * Instantly receive an invite to the voice channel of a user
      * Be notified as soon as a user switches or joins a voice channel
    `),
    configSchema: ConfigSchema,
  },

  configParser: makeIoTsConfigParser(ConfigSchema),
  defaultOptions,

  // prettier-ignore
  messageCommands: [
    WhereCmd,
    FollowCmd,
    ListFollowCmd,
    DeleteFollowCmd,
  ],

  // prettier-ignore
  events: [
    VoiceStateUpdateAlertEvt,
    GuildBanRemoveAlertsEvt
  ],

  beforeLoad(pluginData) {
    const { state, guild } = pluginData;

    state.alerts = GuildVCAlerts.getGuildInstance(guild.id);
    state.usersWithAlerts = [];
  },

  afterLoad(pluginData) {
    const { state, guild } = pluginData;

    state.unregisterGuildEventListener = onGuildEvent(guild.id, "expiredVCAlert", (alert) =>
      clearExpiredAlert(pluginData, alert),
    );
    fillActiveAlertsList(pluginData);
  },

  beforeUnload(pluginData) {
    const { state, guild } = pluginData;

    state.unregisterGuildEventListener?.();
  },
});
