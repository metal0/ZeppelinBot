import { ApiPermissions } from "@shared/apiPermissions";
import { GlobalPluginData } from "knub";
import { ApiPermissionTypes } from "src/data/ApiPermissionAssignments";
import { GuildAccessMonitorPluginType } from "../types";

export async function checkGuildOwnerPermissions(
  pluginData: GlobalPluginData<GuildAccessMonitorPluginType>,
  guildId: string,
  ownerId: string,
) {
  /*
  const ownerPerms = await pluginData.state.apiPermissionAssignments.getByGuildAndUserId(guildId, ownerId);
  if (!ownerPerms || !ownerPerms.permissions.includes(ApiPermissions.Owner)) {
    if (!ownerPerms) {
      await pluginData.state.apiPermissionAssignments.addUser(guildId, ownerId, [ApiPermissions.Owner]);
    } else {
      await pluginData.state.apiPermissionAssignments.updateUser(guildId, ownerId, {
        ...ownerPerms,
        permissions: [...ownerPerms.permissions, ApiPermissions.Owner],
      });
    }
  }
  const otherOwners = (await pluginData.state.apiPermissionAssignments.getByGuildId(guildId)).filter(
    p => p.target_id !== ownerId && p.type === ApiPermissionTypes.User && p.permissions.includes(ApiPermissions.Owner),
  );
  if (otherOwners.length > 0) {
    for (const otherOwner of otherOwners) {
      const newPerms = otherOwner.permissions.filter(p => p !== ApiPermissions.Owner);
      if (newPerms.length === 0) {
        await pluginData.state.apiPermissionAssignments.removeUser(guildId, otherOwner.target_id);
        continue;
      }
      await pluginData.state.apiPermissionAssignments.updateUser(guildId, otherOwner.target_id, {
        ...otherOwner,
        permissions: newPerms,
      });
    }
  }
  */
}
