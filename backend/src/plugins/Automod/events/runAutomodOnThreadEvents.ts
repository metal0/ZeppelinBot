import { typedGuildEventListener } from "knub";
import { RecentActionType } from "../constants";
import { runAutomod } from "../functions/runAutomod";
import { AutomodContext, AutomodPluginType } from "../types";

export const RunAutomodOnThreadCreate = typedGuildEventListener<AutomodPluginType>()({
  event: "threadCreate",
  async listener({ pluginData, args: { thread } }) {
    const user = thread.ownerId ? await pluginData.client.users.fetch(thread.ownerId).catch(() => void 0) : void 0;
    const context: AutomodContext = {
      timestamp: Date.now(),
      threadChange: {
        created: thread,
      },
      user,
    };
    const sourceChannel = pluginData.client.channels.cache.find((c) => c.id === thread.parentId);
    if (sourceChannel?.isText()) {
      const sourceMessage = sourceChannel.messages.cache.find(
        (m) => m.thread?.id === thread.id || m.reference?.channelId === thread.id,
      );
      if (sourceMessage) {
        const message = await pluginData.state.savedMessages.find(sourceMessage.id);
        if (message) {
          message.channel_id = thread.id;
          context.message = message;
        }
      }
    }

    pluginData.state.queue.add(() => {
      pluginData.state.recentActions.push({
        type: RecentActionType.ThreadCreate,
        context,
        count: 1,
        identifier: null,
      });

      runAutomod(pluginData, context);
    });
  },
});

export const RunAutomodOnThreadDelete = typedGuildEventListener<AutomodPluginType>()({
  event: "threadDelete",
  async listener({ pluginData, args: { thread } }) {
    const user = thread.ownerId ? await pluginData.client.users.fetch(thread.ownerId).catch(() => void 0) : void 0;

    const context: AutomodContext = {
      timestamp: Date.now(),
      threadChange: {
        deleted: thread,
      },
      user,
    };

    pluginData.state.queue.add(() => {
      runAutomod(pluginData, context);
    });
  },
});
