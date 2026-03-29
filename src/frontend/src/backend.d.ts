import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;

export interface PublicUser {
    id: bigint;
    name: string;
    username: string;
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

export interface ConversationInfo {
    chatId: string;
    otherUserId: bigint;
    otherUserName: string;
    otherUserUsername: string;
    otherUserAvatar: string;
    lastMessage: string;
    lastTimestamp: bigint;
}

export type LoginResult = 
    | { ok: { token: string; user: PublicUser } }
    | { err: string };

export type RegisterResult = 
    | { ok: { userId: bigint; token: string } }
    | { err: string };

export type OtpResult =
    | { ok: string }
    | { err: string };

export type SetUsernameResult =
    | { ok: null }
    | { err: string };

export interface AdminStats {
    userCount: bigint;
    users: PublicUser[];
}

export interface backendInterface {
    requestOtp(phone: string): Promise<OtpResult>;
    verifyOtp(phone: string, otp: string): Promise<boolean>;
    isPhoneRegistered(phone: string): Promise<boolean>;
    registerWithOtp(phone: string, otp: string, name: string, pin: string): Promise<RegisterResult>;
    loginWithOtp(phone: string, otp: string): Promise<LoginResult>;
    register(phone: string, pin: string, name: string): Promise<RegisterResult>;
    login(phone: string, pin: string): Promise<LoginResult>;
    logout(token: string): Promise<boolean>;
    getMyProfile(token: string): Promise<[] | [PublicUser]>;
    updateProfile(token: string, name: string, about: string, avatarUrl: string): Promise<boolean>;
    getUserById(userId: bigint): Promise<[] | [PublicUser]>;
    getUserByUsername(username: string): Promise<[] | [PublicUser]>;
    isUsernameAvailablePublic(username: string): Promise<boolean>;
    setUsername(token: string, username: string): Promise<SetUsernameResult>;
    getAllUsers(): Promise<PublicUser[]>;
    sendMessage(token: string, chatId: string, text: string, imageUrl: string): Promise<[] | [bigint]>;
    getMessages(chatId: string): Promise<Message[]>;
    getUserConversations(token: string): Promise<ConversationInfo[]>;
    adminGetStats(token: string): Promise<[] | [AdminStats]>;
    setApiKey(token: string, apiKey: string): Promise<boolean>;
    isSmsConfigured(): Promise<boolean>;
    registerWithPassword(username: string, password: string, name: string): Promise<RegisterResult>;
    loginWithPassword(username: string, password: string): Promise<LoginResult>;
    heartbeat(token: string): Promise<boolean>;
    isUserOnline(userId: bigint): Promise<boolean>;
    setChatWallpaper(token: string, chatId: string, wallpaper: string): Promise<boolean>;
    getChatWallpaper(chatId: string): Promise<string>;
}
