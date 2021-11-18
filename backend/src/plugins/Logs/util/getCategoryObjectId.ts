import { TypedTemplateSafeValueContainer } from "../../../templateFormatter";
import {
  TemplateSafeChannel,
  TemplateSafeMember,
  TemplateSafeRole,
  TemplateSafeUnknownMember,
  TemplateSafeUnknownUser,
  TemplateSafeUser,
} from "../../../utils/templateSafeObjects";
import { ILogTypeData } from "../types";

export function validateCategoryData<TLogType extends keyof ILogTypeData>(
  type: string,
  data: TypedTemplateSafeValueContainer<ILogTypeData[TLogType]>,
): boolean {
  if (
    type === "member" &&
    !(data.member instanceof TemplateSafeMember) &&
    !(data.user instanceof TemplateSafeUser) &&
    !(data.user instanceof TemplateSafeUnknownUser) &&
    !(data.member instanceof TemplateSafeUnknownMember) &&
    !data.userId
  ) {
    return false;
  } else if (
    type === "role" &&
    !(data.role instanceof TemplateSafeRole) &&
    !(data.oldRole instanceof TemplateSafeRole) &&
    !(data.newRole instanceof TemplateSafeRole)
  ) {
    return false;
  } else if (
    type === "channel" &&
    !(data.channel instanceof TemplateSafeChannel) &&
    !(data.oldChannel instanceof TemplateSafeChannel) &&
    !(data.newChannel instanceof TemplateSafeChannel)
  ) {
    return false;
  } else if (
    type === "mod" &&
    !(data.mod instanceof TemplateSafeMember) &&
    !(data.mod instanceof TemplateSafeUser) &&
    !(data.mod instanceof TemplateSafeUnknownUser) &&
    !(data.mod instanceof TemplateSafeUnknownMember) &&
    !(data.author instanceof TemplateSafeUser)
  ) {
    return false;
  } else if (
    type === "thread" &&
    !(data.thread instanceof TemplateSafeChannel) &&
    !(data.oldThread instanceof TemplateSafeChannel) &&
    !(data.newThread instanceof TemplateSafeChannel)
  ) {
    return false;
  }
  return true;
}

export function getObjectId<TLogType extends keyof ILogTypeData>(
  type: string,
  data: TypedTemplateSafeValueContainer<ILogTypeData[TLogType]>,
): string | null {
  let objectId: string | null = null;
  switch (type) {
    case "member":
      if (data.member instanceof TemplateSafeMember || data.member instanceof TemplateSafeUnknownMember) {
        objectId = data.member.id;
      }
      if (data.user instanceof TemplateSafeUser || data.user instanceof TemplateSafeUnknownUser) {
        objectId = data.user.id;
      }
      if (data.userId) {
        objectId = data.userId.toString();
      }
      break;
    case "mod":
      if (
        data.mod instanceof TemplateSafeMember ||
        data.mod instanceof TemplateSafeUnknownMember ||
        data.mod instanceof TemplateSafeUser ||
        data.mod instanceof TemplateSafeUnknownUser
      ) {
        objectId = data.mod.id;
      }
      if (data.author instanceof TemplateSafeUser) objectId = data.author.id;
      break;
    case "role":
      if (data.role instanceof TemplateSafeRole) objectId = data.role.id;
      if (data.oldRole instanceof TemplateSafeRole) objectId = data.oldRole.id;
      if (data.newRole instanceof TemplateSafeRole) objectId = data.newRole.id;
      break;
    case "channel":
      if (data.channel instanceof TemplateSafeChannel) objectId = data.channel.id;
      if (data.oldChannel instanceof TemplateSafeChannel) objectId = data.oldChannel.id;
      if (data.newChannel instanceof TemplateSafeChannel) objectId = data.newChannel.id;
      break;
    case "thread":
      if (data.thread instanceof TemplateSafeChannel) objectId = data.thread.id;
      if (data.oldThread instanceof TemplateSafeChannel) objectId = data.oldThread.id;
      if (data.newThread instanceof TemplateSafeChannel) objectId = data.newThread.id;
      break;
  }
  return objectId;
}
