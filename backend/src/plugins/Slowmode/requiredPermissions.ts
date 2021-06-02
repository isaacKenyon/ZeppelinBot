import { Permissions } from "discord.js";

const p = Permissions.FLAGS;

export const NATIVE_SLOWMODE_PERMISSIONS = p.VIEW_CHANNEL | p.MANAGE_CHANNELS;
export const BOT_SLOWMODE_PERMISSIONS = p.VIEW_CHANNEL | p.MANAGE_ROLES | p.MANAGE_MESSAGES;
export const BOT_SLOWMODE_CLEAR_PERMISSIONS = p.VIEW_CHANNEL | p.MANAGE_ROLES;
export const BOT_SLOWMODE_DISABLE_PERMISSIONS = p.VIEW_CHANNEL | p.MANAGE_ROLES;
