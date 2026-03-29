/* eslint-disable */
// @ts-nocheck
// Manually written IDL to match main.mo actor

import { IDL } from '@icp-sdk/core/candid';

export const idlFactory = ({ IDL }) => {
  const PublicUser = IDL.Record({
    id: IDL.Nat,
    username: IDL.Text,
    name: IDL.Text,
    about: IDL.Text,
    avatarUrl: IDL.Text,
    phone: IDL.Text,
    joinedAt: IDL.Int,
    isAdmin: IDL.Bool,
  });

  const Message = IDL.Record({
    id: IDL.Nat,
    chatId: IDL.Text,
    senderId: IDL.Nat,
    senderName: IDL.Text,
    text: IDL.Text,
    imageUrl: IDL.Text,
    timestamp: IDL.Int,
  });

  const ConversationInfo = IDL.Record({
    chatId: IDL.Text,
    otherUserId: IDL.Nat,
    otherUserName: IDL.Text,
    otherUserUsername: IDL.Text,
    otherUserAvatar: IDL.Text,
    lastMessage: IDL.Text,
    lastTimestamp: IDL.Int,
  });

  const LoginResult = IDL.Variant({
    ok: IDL.Record({ token: IDL.Text, user: PublicUser }),
    err: IDL.Text,
  });

  const RegisterResult = IDL.Variant({
    ok: IDL.Record({ userId: IDL.Nat, token: IDL.Text }),
    err: IDL.Text,
  });

  const OtpResult = IDL.Variant({
    ok: IDL.Text,
    err: IDL.Text,
  });

  const SetUsernameResult = IDL.Variant({
    ok: IDL.Null,
    err: IDL.Text,
  });

  const AdminStats = IDL.Record({
    userCount: IDL.Nat,
    users: IDL.Vec(PublicUser),
  });

  return IDL.Service({
    registerWithPassword: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [RegisterResult], []),
    loginWithPassword: IDL.Func([IDL.Text, IDL.Text], [LoginResult], []),
    isUsernameAvailablePublic: IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    getUserByUsername: IDL.Func([IDL.Text], [IDL.Opt(PublicUser)], ['query']),
    setUsername: IDL.Func([IDL.Text, IDL.Text], [SetUsernameResult], []),
    getMyProfile: IDL.Func([IDL.Text], [IDL.Opt(PublicUser)], []),
    updateProfile: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text], [IDL.Bool], []),
    logout: IDL.Func([IDL.Text], [IDL.Bool], []),
    sendMessage: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text], [IDL.Opt(IDL.Nat)], []),
    getMessages: IDL.Func([IDL.Text], [IDL.Vec(Message)], ['query']),
    getUserConversations: IDL.Func([IDL.Text], [IDL.Vec(ConversationInfo)], []),
    setChatWallpaper: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Bool], []),
    getChatWallpaper: IDL.Func([IDL.Text], [IDL.Text], ['query']),
    heartbeat: IDL.Func([IDL.Text], [IDL.Bool], []),
    isUserOnline: IDL.Func([IDL.Nat], [IDL.Bool], ['query']),
    adminGetStats: IDL.Func([IDL.Text], [IDL.Opt(AdminStats)], []),
    getAllUsers: IDL.Func([], [IDL.Vec(PublicUser)], ['query']),
    getUserById: IDL.Func([IDL.Nat], [IDL.Opt(PublicUser)], ['query']),
    setApiKey: IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    isSmsConfigured: IDL.Func([], [IDL.Bool], ['query']),
    requestOtp: IDL.Func([IDL.Text], [OtpResult], []),
    verifyOtp: IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    isPhoneRegistered: IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    registerWithOtp: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text], [RegisterResult], []),
    loginWithOtp: IDL.Func([IDL.Text, IDL.Text], [LoginResult], []),
    register: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [RegisterResult], []),
    login: IDL.Func([IDL.Text, IDL.Text], [LoginResult], []),
  });
};

export const idlService = IDL.Service({});
export const idlInitArgs = [];
export const init = ({ IDL }) => { return []; };
