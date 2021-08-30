import { BasePluginType } from "knub";
import { AllowedGuilds } from "src/data/AllowedGuilds";
import { ApiPermissionAssignments } from "src/data/ApiPermissionAssignments";
import { Configs } from "src/data/Configs";

export interface GuildAccessMonitorPluginType extends BasePluginType {
  config: {};
  state: {
    allowedGuilds: AllowedGuilds;
    apiPermissionAssignments: ApiPermissionAssignments;
    configs: Configs;
  };
}
