import { GuildPluginData } from "knub";
import { StarboardPluginType, TStarboardOpts } from "../types";

import moment from "moment-timezone";
import { EmbedWith, EMPTY_CHAR, messageLink } from "../../../utils";
import path from "path";
import { createStarboardEmbedFromMessage } from "./createStarboardEmbedFromMessage";
import { createStarboardPseudoFooterForMessage } from "./createStarboardPseudoFooterForMessage";
import { Message, TextChannel } from "discord.js";

export async function saveMessageToStarboard(
  pluginData: GuildPluginData<StarboardPluginType>,
  msg: Message,
  starboard: TStarboardOpts,
) {
  const channel = pluginData.guild.channels.cache.get(starboard.channel_id);
  if (!channel) return;

  const starCount = (await pluginData.state.starboardReactions.getAllReactionsForMessageId(msg.id)).length;
  const embed = createStarboardEmbedFromMessage(msg, Boolean(starboard.copy_full_embed), starboard.color);
  embed.fields!.push(createStarboardPseudoFooterForMessage(starboard, msg, starboard.star_emoji![0], starCount));

  const starboardMessage = await (channel as TextChannel).send(embed);
  await pluginData.state.starboardMessages.createStarboardMessage(channel.id, msg.id, starboardMessage.id);
}
