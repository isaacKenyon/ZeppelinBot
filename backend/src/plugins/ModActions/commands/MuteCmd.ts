import { modActionsCmd } from "../types";
import { commandTypeHelpers as ct } from "../../../commandTypes";
import { canActOn, sendErrorMessage } from "../../../pluginUtils";
import { noop, resolveMember, resolveUser } from "../../../utils";
import { isBanned } from "../functions/isBanned";

import { actualMuteUserCmd } from "../functions/actualMuteUserCmd";

const opts = {
  mod: ct.member({ option: true }),
  notify: ct.string({ option: true }),
  "notify-channel": ct.textChannel({ option: true }),
};

export const MuteCmd = modActionsCmd({
  trigger: "mute",
  permission: "can_mute",
  description: "Mute the specified member",

  signature: [
    {
      user: ct.string(),
      time: ct.delay(),
      reason: ct.string({ required: false, catchAll: true }),

      ...opts,
    },
    {
      user: ct.string(),
      reason: ct.string({ required: false, catchAll: true }),

      ...opts,
    },
  ],

  async run({ pluginData, message: msg, args }) {
    const user = await resolveUser(pluginData.client, args.user);
    if (!user.id) {
      sendErrorMessage(pluginData, msg.channel, `User not found`);
      return;
    }

    const memberToMute = await resolveMember(pluginData.client, pluginData.guild, user.id);

    if (!memberToMute) {
      const _isBanned = await isBanned(pluginData, user.id);
      const prefix = pluginData.fullConfig.prefix;
      if (_isBanned) {
        sendErrorMessage(
          pluginData,
          msg.channel,
          `User is banned. Use \`${prefix}forcemute\` if you want to mute them anyway.`,
        );
        return;
      } else {
        // Ask the mod if we should upgrade to a forcemute as the user is not on the server
        const notOnServerMsg = await msg.channel.send("User not found on the server, forcemute instead?");
        const reply = false; // await waitForReaction(pluginData.client, notOnServerMsg, ["✅", "❌"], msg.author.id); FIXME waiting on waitForButton

        notOnServerMsg.delete().catch(noop);
        if (!reply /*|| reply.name === "❌"*/) {
          sendErrorMessage(pluginData, msg.channel, "User not on server, mute cancelled by moderator");
          return;
        }
      }
    }

    // Make sure we're allowed to mute this member
    if (memberToMute && !canActOn(pluginData, msg.member, memberToMute)) {
      sendErrorMessage(pluginData, msg.channel, "Cannot mute: insufficient permissions");
      return;
    }

    actualMuteUserCmd(pluginData, user, msg, args);
  },
});
