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

export type LoginResult = 
    | { ok: { token: string; user: PublicUser } }
    | { err: string };

export type RegisterResult = 
    | { ok: { userId: bigint; token: string } }
    | { err: string };

export type OtpResult =
    | { ok: string }
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
    getAllUsers(): Promise<PublicUser[]>;
    sendMessage(token: string, chatId: string, text: string, imageUrl: string): Promise<[] | [bigint]>;
    getMessages(chatId: string): Promise<Message[]>;
    adminGetStats(token: string): Promise<[] | [AdminStats]>;
    setApiKey(token: string, apiKey: string): Promise<boolean>;
    isSmsConfigured(): Promise<boolean>;
}
