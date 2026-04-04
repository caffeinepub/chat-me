/* eslint-disable */
// @ts-nocheck

import type { Principal } from '@icp-sdk/core/principal';
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';

export interface PublicUser {
  id: bigint;
  username: string;
  name: string;
  about: string;
  avatarUrl: string;
  phone: string;
  joinedAt: bigint;
  isAdmin: boolean;
}

export interface Message {
  id: bigint;
  chatId: string;
  senderId: bigint;
  senderName: string;
  text: string;
  imageUrl: string;
  timestamp: bigint;
}

export type LoginResult = { ok: { token: string; user: PublicUser } } | { err: string };
export type RegisterResult = { ok: { userId: bigint; token: string } } | { err: string };
export type OtpResult = { ok: string } | { err: string };
export type SetUsernameResult = { ok: null } | { err: string };
export type AddFriendResult = { ok: null } | { err: string };

export interface AdminStats {
  userCount: bigint;
  users: Array<PublicUser>;
}

export interface _SERVICE {
  registerWithPassword: ActorMethod<[string, string, string], RegisterResult>;
  loginWithPassword: ActorMethod<[string, string], LoginResult>;
  isUsernameAvailablePublic: ActorMethod<[string], boolean>;
  getUserByUsername: ActorMethod<[string], [] | [PublicUser]>;
  setUsername: ActorMethod<[string, string], SetUsernameResult>;
  getMyProfile: ActorMethod<[string], [] | [PublicUser]>;
  updateProfile: ActorMethod<[string, string, string, string], boolean>;
  logout: ActorMethod<[string], boolean>;
  sendMessage: ActorMethod<[string, string, string, string], [] | [bigint]>;
  getMessages: ActorMethod<[string], Array<Message>>;
  setChatWallpaper: ActorMethod<[string, string, string], boolean>;
  getChatWallpaper: ActorMethod<[string], string>;
  adminGetStats: ActorMethod<[string], [] | [AdminStats]>;
  getAllUsers: ActorMethod<[], Array<PublicUser>>;
  getUserById: ActorMethod<[bigint], [] | [PublicUser]>;
  setApiKey: ActorMethod<[string, string], boolean>;
  isSmsConfigured: ActorMethod<[], boolean>;
  requestOtp: ActorMethod<[string], OtpResult>;
  verifyOtp: ActorMethod<[string, string], boolean>;
  isPhoneRegistered: ActorMethod<[string], boolean>;
  registerWithOtp: ActorMethod<[string, string, string, string], RegisterResult>;
  loginWithOtp: ActorMethod<[string, string], LoginResult>;
  register: ActorMethod<[string, string, string], RegisterResult>;
  login: ActorMethod<[string, string], LoginResult>;
  heartbeat: ActorMethod<[string], boolean>;
  isUserOnline: ActorMethod<[bigint], boolean>;
  getUserConversations: ActorMethod<[string], Array<any>>;
  addFriend: ActorMethod<[string, bigint], AddFriendResult>;
  getMyFriends: ActorMethod<[string], Array<PublicUser>>;
  areFriends: ActorMethod<[bigint, bigint], boolean>;
  forceResetPassword: ActorMethod<[string, string], string>;
  resetAdminPassword: ActorMethod<[string, string, string], string>;
}

export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
