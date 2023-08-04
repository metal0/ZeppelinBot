import { Module } from "vuex";
import { get } from "../api";
import { ArchiveState, RootState } from "./types";

export const ArchiveStore: Module<ArchiveState, RootState> = {
  namespaced: true,

  state: {
    available: new Map(),
  },

  actions: {
    async loadArchive({ commit, state }, archiveId) {
      const archive = await get(`archives/${archiveId}.json`);
      if (archive.error) {
        return;
      }

      const messageRegex = /\[#([^\]]+)\] \[(\d+)\] \[([0-9 :-]+)\] (.{1,255}(#(\d{4}|0))): (.+)/gu;
      const messages = archive.body.split("\n");

      archive.heading = messages
        .shift()
        .replace(/(\(\d+\))/u, "")
        .replace("Server: ", "");
      archive.channels = [];
      messages.shift();

      messages.forEach((message) => {
        messageRegex.lastIndex = 0;

        const matches = messageRegex.exec(message);

        if (!matches) {
          return;
        }

        const [, channel, userId, postedAt, userTag, , , content] = matches;
        const messageData = { userId, postedAt, userTag, content };

        if (archive.channels.length < 1 || archive.channels[archive.channels.length - 1].name !== channel) {
          archive.channels.push({
            name: channel,
            messages: [],
          });
        }

        archive.channels[archive.channels.length - 1].messages.push(messageData);
      });

      commit("addArchive", archive);
    },
  },

  mutations: {
    addArchive(state: ArchiveState, archive) {
      state.available.set(archive.id, archive);
    },
  },
};
