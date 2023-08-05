import { Module } from "vuex";
import { get } from "../api";
import { ArchiveState, RootState } from "./types";

const defaultAvatar =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAMAAABrrFhUAAAAY1BMVEVYZfJib/OMlfahqPeWn/eBi/XLz/vq6/7////19f5tePTq7P22vPnV2Pyrsvirsvl3gvT09f7Axfp3gfRtePNsePPg4v22vPq2u/qCi/WhqPjf4/zf4v2Xn/essvjLzvuXnvdbidFTAAAETElEQVR4AezBgQAAAACAoP2pF6kCAAAAAAAAAAAAAAAAAAAAAIDZudMtV1UlDuCFRKlWIEJ6uOwbzXn/lzzzYc/GWiT6zya/79WrLeYSc5Vq9IFWa3Sr6JehWt0ZZn5RtFJvmHnodPsrPLx1/B9PKx1ziLOPnIRRO84EXaAP/CWnR3pArTWcybpA5G8NsX20pw+cSbpAngEeOQenY+Cf8KIZ4FuDfSV4Ko/7hS7wNjYH7W3MvNeHtn2jvxn+OXcgaP0x8KJo43vgnwqu85EXDfGVULWON9G1BOmDN/M/AnTgDSWC0xve0KAITeSsykFw4qzOQWB4YwNBOfLmPAHpeXsvr5XOgJkjGA3vIlU6A2bvOHvAnXwiCMrwTl5UpUtg5us7BAB2gcg78nXugaC6QORd+bo7AEAXiLwzX+8SANEFNHPdXcAwV90FDgxA037+zwAc7aZlCKnSNTDrADZBdU6DBwbha5wCAabBkWGkSqfAzFa6C8xeADYB9Y2ByEBsbSMAYAy0zHWPActQLPQuKBh3DiwiDRlwzwFOv9JfTpORh5x5rVfQc8CQiLLJiEMaA1oW6XgVq+grVh4yY56JA68x07fm8hCIhXCUPn823zgkG/HK4Rf6kYv8YBt5BQ03BQyv9CMq8M/JQ7IItw+e6cd8QQjKTqCX3OMTtOdCCNZOoCnqkrYgZEFD2/FF/08qDAE4Dji+TtHPKHknVmBboVB2i9HI9zIGahZUhaVqVxCyQEEVQ7rSBMj3QiPUUTCWJkC+8zrQVjzmELBYG2H5jDYUFqAiQDlMtAwKQgjr+nwoq9O2BSEQJQFVWKeNBSEQ6+BYeG3BFIUAHIfasmsLh7IQgLcjDZd0AWXEIZRDMDYCuuj73g95yJGxEuBLPmr6VBSyzMO9Fpzko3kqeA1r8W4GHOWNKQ/JIl4COL4SZf2lPAQhAY4lYrv860rlIVmHlYAsuBhjFwpCwO4LOkb0TMAzAc8EPBPwTMAGngl4JuCZgMig4jMB27AMykJUhCr4ekwzKI10T9hpwzcz6DNSUbRdORzThW/CJSKagd4LjKurof1suFCYVR54MDckpsBXDLk3pliQgxBTHneBrwiaNtOfeUUKCnMQYlKC32x2r7SlmSUpoOQdi5xtoqx1DNP8WW9kKSCVvAu8QnC2USR4/I2bP5vDmhS80pdOjXULw8dc7HSiL6ljYLTmz/ooKvJTdkqTt9G5s/mHczH6qXlV9I32Ehi0+QVfQbn7HryHhvY033V1Tuu3CRncOIj3rL3EV9pf7+53ced0bY+MIZm7ndEt9uNnkxN8OSWhAvjjZ8ktnIoKaMDHF0yH8S416C4Rpv7bU094pWJ9QFv4BJOBvnkFzjWKMvhu4G78IibMIz2EFM3KFUAwCEI+ID9MDia6kd/+enpFj+YE+af+aA8OZAAAAAAG+Vvf46sAAAAAAAAAAAAAAAAAAAAAAFYCeHSjWah9hFcAAAAASUVORK5CYII=";

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

      const messageRegex = /\[#([^\]]+)\] \[(\d+)\] \[([0-9 :-]+)\] (.{1,255}(#(\d{4}|0))?): (.+)/gu;
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
          const lastMessages = archive.channels[archive.channels.length - 1].messages;

          lastMessages[lastMessages.length - 1].content += `\n${message}`;

          return;
        }

        const [, channel, userId, postedAt, userTag, , , content] = matches;
        const userInfo = userId in archive.userInfo ? archive.userInfo[userId] : null;
        const avatarUrl = userInfo ? userInfo.avatar_url ?? defaultAvatar : defaultAvatar;
        const animatedAvatarUrl = userInfo ? userInfo.avatar_url_animated ?? avatarUrl : defaultAvatar;
        const messageData = {
          avatarUrl,
          animatedAvatarUrl,
          userId,
          postedAt,
          userTag,
          content,
        };

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
