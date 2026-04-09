import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type UserId = bigint;
export type RegisterResult = {
    __kind__: "ok";
    ok: {
        token: string;
        userId: UserId;
    };
} | {
    __kind__: "err";
    err: string;
};
export interface HttpResponsePayload {
    status: bigint;
    body: Uint8Array;
    headers: Array<{
        value: string;
        name: string;
    }>;
}
export interface ConversationInfo {
    otherUserName: string;
    otherUserId: UserId;
    lastMessage: string;
    otherUserAvatar: string;
    lastTimestamp: bigint;
    chatId: string;
    otherUserUsername: string;
}
export interface Message {
    id: bigint;
    text: string;
    imageUrl: string;
    timestamp: bigint;
    senderName: string;
    chatId: string;
    senderId: UserId;
}
export type LoginResult = {
    __kind__: "ok";
    ok: {
        token: string;
        user: PublicUser;
    };
} | {
    __kind__: "err";
    err: string;
};
export interface PublicUser {
    id: UserId;
    about: string;
    username: string;
    name: string;
    joinedAt: bigint;
    avatarUrl: string;
    isAdmin: boolean;
    phone: string;
}
export type OtpResult = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "err";
    err: string;
};
export interface TransformArgs {
    context: Uint8Array;
    response: HttpResponsePayload;
}
export interface backendInterface {
    aanyaReply(adminToken: string, targetUserId: bigint, replyText: string): Promise<bigint | null>;
    addFriend(token: string, friendId: UserId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminGetStats(token: string): Promise<{
        users: Array<PublicUser>;
        userCount: bigint;
    } | null>;
    areFriends(userId1: UserId, userId2: UserId): Promise<boolean>;
    checkUserExists(uname: string): Promise<boolean>;
    forceResetPassword(targetUsername: string, newPassword: string): Promise<string>;
    getAanyaConversations(adminToken: string): Promise<Array<ConversationInfo>>;
    getAanyaProfile(): Promise<PublicUser | null>;
    getAanyaUserId(): Promise<bigint>;
    getAllUsers(): Promise<Array<PublicUser>>;
    getChatWallpaper(chatId: string): Promise<string>;
    getMessages(chatId: string): Promise<Array<Message>>;
    getMyFriends(token: string): Promise<Array<PublicUser>>;
    getMyProfile(token: string): Promise<PublicUser | null>;
    getUserById(userId: UserId): Promise<PublicUser | null>;
    getUserByUsername(uname: string): Promise<PublicUser | null>;
    getUserConversations(token: string): Promise<Array<ConversationInfo>>;
    heartbeat(token: string): Promise<boolean>;
    isPhoneRegistered(phone: string): Promise<boolean>;
    isSmsConfigured(): Promise<boolean>;
    isUserOnline(userId: UserId): Promise<boolean>;
    isUsernameAvailablePublic(uname: string): Promise<boolean>;
    login(phone: string, pin: string): Promise<LoginResult>;
    loginWithOtp(phone: string, otp: string): Promise<LoginResult>;
    loginWithPassword(username: string, password: string): Promise<LoginResult>;
    logout(token: string): Promise<boolean>;
    register(phone: string, pin: string, name: string): Promise<RegisterResult>;
    registerWithOtp(phone: string, otp: string, name: string, pin: string): Promise<RegisterResult>;
    registerWithPassword(username: string, password: string, name: string): Promise<RegisterResult>;
    requestOtp(phone: string): Promise<OtpResult>;
    resetAdminPassword(targetUsername: string, newPassword: string, recoveryKey: string): Promise<string>;
    sendAanyaProactive(targetUserId: bigint, text: string): Promise<bigint | null>;
    sendAanyaWelcome(newUserId: bigint): Promise<void>;
    sendMessage(token: string, chatId: string, text: string, imageUrl: string): Promise<bigint | null>;
    sendMessageAsBot(adminToken: string, targetUserId: bigint, text: string): Promise<bigint | null>;
    setApiKey(token: string, apiKey: string): Promise<boolean>;
    setChatWallpaper(token: string, chatId: string, wallpaper: string): Promise<boolean>;
    setUsername(token: string, uname: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    transformHttpResponse(args: TransformArgs): Promise<HttpResponsePayload>;
    updateProfile(token: string, name: string, about: string, avatarUrl: string): Promise<boolean>;
    verifyOtp(phone: string, otp: string): Promise<boolean>;
}
