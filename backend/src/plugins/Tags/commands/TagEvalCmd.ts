import { MessageCreateOptions } from "discord.js";
import { commandTypeHelpers as ct } from "../../../commandTypes";
import { sendErrorMessage } from "../../../pluginUtils";
import { TemplateParseError } from "../../../templateFormatter";
import { memberToTemplateSafeMember, userToTemplateSafeUser } from "../../../utils/templateSafeObjects";
import { tagsCmd } from "../types";
import { renderTagBody } from "../util/renderTagBody";
import { logger } from "../../../logger";

export const TagEvalCmd = tagsCmd({
  trigger: "tag eval",
  permission: "can_create",

  signature: {
    body: ct.string({ catchAll: true }),
  },

  async run({ message: msg, args, pluginData }) {
    try {
      const rendered = (await renderTagBody(
        pluginData,
        args.body,
        [],
        {
          member: memberToTemplateSafeMember(msg.member),
          user: userToTemplateSafeUser(msg.member.user),
        },
        { member: msg.member },
      )) as MessageCreateOptions;

      if (!rendered.content && !rendered.embeds?.length) {
        sendErrorMessage(pluginData, msg.channel, "Evaluation resulted in an empty text");
        return;
      }

      msg.channel.send(rendered);
    } catch (e) {
      const errorMessage = e instanceof TemplateParseError
        ? e.message
        : "Internal error";

      sendErrorMessage(pluginData, msg.channel, `Failed to render tag: ${errorMessage}`);

      if (! (e instanceof TemplateParseError)) {
        logger.warn(`Internal error evaluating tag in ${pluginData.guild.id}: ${e}`);
      }

      return;
    }
  },
});
