import { Snowflake, TextChannel } from "discord.js";
import { AllowedGuilds } from "../../data/AllowedGuilds";
import { ApiPermissionAssignments } from "../../data/ApiPermissionAssignments";
import { Configs } from "../../data/Configs";
import { GuildArchives } from "../../data/GuildArchives";
import { sendSuccessMessage } from "../../pluginUtils";
import { zeppelinGlobalPlugin } from "../ZeppelinPluginBlueprint";
import { getActiveReload, resetActiveReload } from "./activeReload";
import { AddDashboardUserCmd } from "./commands/AddDashboardUserCmd";
import { AllowServerCmd } from "./commands/AllowServerCmd";
import { DisallowServerCmd } from "./commands/DisallowServerCmd";
import { EligibleCmd } from "./commands/EligibleCmd";
import { LeaveServerCmd } from "./commands/LeaveServerCmd";
import { ListDashboardPermsCmd } from "./commands/ListDashboardPermsCmd";
import { ListDashboardUsersCmd } from "./commands/ListDashboardUsersCmd";
import { ReloadGlobalPluginsCmd } from "./commands/ReloadGlobalPluginsCmd";
import { ReloadServerCmd } from "./commands/ReloadServerCmd";
import { RemoveDashboardUserCmd } from "./commands/RemoveDashboardUserCmd";
import { ServersCmd } from "./commands/ServersCmd";
import { BotControlPluginType, ConfigSchema } from "./types";
import { ProfilerDataCmd } from "./commands/ProfilerDataCmd";
import { AddServerFromInviteCmd } from "./commands/AddServerFromInviteCmd";
import { ChannelToServerCmd } from "./commands/ChannelToServerCmd";
import { RestPerformanceCmd } from "./commands/RestPerformanceCmd";
import { RateLimitPerformanceCmd } from "./commands/RateLimitPerformanceCmd";
import { env } from "../../env.js";
import { noop } from "../../utils.js";

const defaultOptions = {
  config: {
    can_use: false,
    can_admin: false,
    can_eligible: false,
    can_performance: false,
    can_add_server_from_invite: false,
    can_list_dashboard_perms: false,
    update_cmd: null,
  },
  overrides: [
    {
      any: env.STAFF!.map((e) => {
        return { user: e };
      }),
      config: {
        can_admin: true,
        can_use: true,
        can_eligible: true,
        can_performance: true,
        can_add_server_from_invite: true,
        can_list_dashboard_perms: true,
      },
    },
  ],
};

export const BotControlPlugin = zeppelinGlobalPlugin<BotControlPluginType>()({
  name: "bot_control",
  info: {
    description: "Bot Control",
    longDescription: "Bot Control allows you to control the bot from within the guild.",
    prettyName: "Bot Control",
  },
  configSchema: ConfigSchema,
  defaultOptions,
  showInDocs: true,

  // prettier-ignore
  commands: [
    ReloadGlobalPluginsCmd,
    ServersCmd,
    LeaveServerCmd,
    ReloadServerCmd,
    AllowServerCmd,
    DisallowServerCmd,
    AddDashboardUserCmd,
    RemoveDashboardUserCmd,
    ListDashboardUsersCmd,
    ListDashboardPermsCmd,
    EligibleCmd,
    ProfilerDataCmd,
    RestPerformanceCmd,
    RateLimitPerformanceCmd,
    AddServerFromInviteCmd,
    ChannelToServerCmd,
  ],

  async afterLoad(pluginData) {
    pluginData.state.archives = new GuildArchives(0);
    pluginData.state.allowedGuilds = new AllowedGuilds();
    pluginData.state.configs = new Configs();
    pluginData.state.apiPermissionAssignments = new ApiPermissionAssignments();

    const activeReload = getActiveReload();
    if (activeReload) {
      const [guildId, channelId] = activeReload;
      resetActiveReload();

      const guild = await pluginData.client.guilds.fetch(guildId as Snowflake).catch(noop);
      if (guild) {
        const channel = await guild.channels.fetch(channelId as Snowflake).catch(noop);
        if (channel instanceof TextChannel) {
          sendSuccessMessage(pluginData, channel, "Global plugins reloaded!");
        }
      }
    }
  },
});
