/* eslint-disable */
// @ts-nocheck

import { Actor, HttpAgent, type HttpAgentOptions, type ActorConfig, type Agent, type ActorSubclass } from "@icp-sdk/core/agent";
import type { Principal } from "@icp-sdk/core/principal";
import { idlFactory, type _SERVICE } from "./declarations/backend.did";

export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;

export class ExternalBlob {
    _blob?: Uint8Array<ArrayBuffer> | null;
    directURL: string;
    onProgress?: (percentage: number) => void = undefined;
    private constructor(directURL: string, blob: Uint8Array<ArrayBuffer> | null){
        if (blob) { this._blob = blob; }
        this.directURL = directURL;
    }
    static fromURL(url: string): ExternalBlob {
        return new ExternalBlob(url, null);
    }
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob {
        const url = URL.createObjectURL(new Blob([new Uint8Array(blob)], { type: 'application/octet-stream' }));
        return new ExternalBlob(url, blob);
    }
    public async getBytes(): Promise<Uint8Array<ArrayBuffer>> {
        if (this._blob) { return this._blob; }
        const response = await fetch(this.directURL);
        const blob = await response.blob();
        this._blob = new Uint8Array(await blob.arrayBuffer());
        return this._blob;
    }
    public getDirectURL(): string { return this.directURL; }
    public withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob {
        this.onProgress = onProgress;
        return this;
    }
}

export interface backendInterface {
    registerWithPassword(username: string, password: string, name: string): Promise<any>;
    loginWithPassword(username: string, password: string): Promise<any>;
    isUsernameAvailablePublic(username: string): Promise<boolean>;
    getUserByUsername(username: string): Promise<any>;
    setUsername(token: string, username: string): Promise<any>;
    getMyProfile(token: string): Promise<any>;
    updateProfile(token: string, name: string, about: string, avatarUrl: string): Promise<boolean>;
    logout(token: string): Promise<boolean>;
    sendMessage(token: string, chatId: string, text: string, imageUrl: string): Promise<any>;
    getMessages(chatId: string): Promise<any[]>;
    setChatWallpaper(token: string, chatId: string, wallpaper: string): Promise<boolean>;
    getChatWallpaper(chatId: string): Promise<string>;
    adminGetStats(token: string): Promise<any>;
    getAllUsers(): Promise<any[]>;
    getUserById(userId: bigint): Promise<any>;
    setApiKey(token: string, apiKey: string): Promise<boolean>;
    isSmsConfigured(): Promise<boolean>;
    requestOtp(phone: string): Promise<any>;
    verifyOtp(phone: string, otp: string): Promise<boolean>;
    isPhoneRegistered(phone: string): Promise<boolean>;
    registerWithOtp(phone: string, otp: string, name: string, pin: string): Promise<any>;
    loginWithOtp(phone: string, otp: string): Promise<any>;
    register(phone: string, pin: string, name: string): Promise<any>;
    login(phone: string, pin: string): Promise<any>;
}

export class Backend implements backendInterface {
    constructor(
        private actor: ActorSubclass<_SERVICE>,
        private _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
        private _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
        private processError?: (error: unknown) => never
    ){}

    async registerWithPassword(username: string, password: string, name: string) {
        return this.actor.registerWithPassword(username, password, name);
    }
    async loginWithPassword(username: string, password: string) {
        return this.actor.loginWithPassword(username, password);
    }
    async isUsernameAvailablePublic(username: string) {
        return this.actor.isUsernameAvailablePublic(username);
    }
    async getUserByUsername(username: string) {
        return this.actor.getUserByUsername(username);
    }
    async setUsername(token: string, username: string) {
        return this.actor.setUsername(token, username);
    }
    async getMyProfile(token: string) {
        return this.actor.getMyProfile(token);
    }
    async updateProfile(token: string, name: string, about: string, avatarUrl: string) {
        return this.actor.updateProfile(token, name, about, avatarUrl);
    }
    async logout(token: string) {
        return this.actor.logout(token);
    }
    async sendMessage(token: string, chatId: string, text: string, imageUrl: string) {
        return this.actor.sendMessage(token, chatId, text, imageUrl);
    }
    async getMessages(chatId: string) {
        return this.actor.getMessages(chatId);
    }
    async setChatWallpaper(token: string, chatId: string, wallpaper: string) {
        return this.actor.setChatWallpaper(token, chatId, wallpaper);
    }
    async getChatWallpaper(chatId: string) {
        return this.actor.getChatWallpaper(chatId);
    }
    async adminGetStats(token: string) {
        return this.actor.adminGetStats(token);
    }
    async getAllUsers() {
        return this.actor.getAllUsers();
    }
    async getUserById(userId: bigint) {
        return this.actor.getUserById(userId);
    }
    async setApiKey(token: string, apiKey: string) {
        return this.actor.setApiKey(token, apiKey);
    }
    async isSmsConfigured() {
        return this.actor.isSmsConfigured();
    }
    async requestOtp(phone: string) {
        return this.actor.requestOtp(phone);
    }
    async verifyOtp(phone: string, otp: string) {
        return this.actor.verifyOtp(phone, otp);
    }
    async isPhoneRegistered(phone: string) {
        return this.actor.isPhoneRegistered(phone);
    }
    async registerWithOtp(phone: string, otp: string, name: string, pin: string) {
        return this.actor.registerWithOtp(phone, otp, name, pin);
    }
    async loginWithOtp(phone: string, otp: string) {
        return this.actor.loginWithOtp(phone, otp);
    }
    async register(phone: string, pin: string, name: string) {
        return this.actor.register(phone, pin, name);
    }
    async login(phone: string, pin: string) {
        return this.actor.login(phone, pin);
    }
    async addFriend(token: string, friendId: bigint) {
        return this.actor.addFriend(token, friendId);
    }
    async getMyFriends(token: string) {
        return this.actor.getMyFriends(token);
    }
    async areFriends(userId1: bigint, userId2: bigint) {
        return this.actor.areFriends(userId1, userId2);
    }
}

export interface CreateActorOptions {
    agent?: Agent;
    agentOptions?: HttpAgentOptions;
    actorOptions?: ActorConfig;
    processError?: (error: unknown) => never;
}

export function createActor(
    canisterId: string,
    _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
    _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
    options: CreateActorOptions = {}
): Backend {
    const agent = options.agent || HttpAgent.createSync({ ...options.agentOptions });
    if (options.agent && options.agentOptions) {
        console.warn("Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent.");
    }
    const actor = Actor.createActor<_SERVICE>(idlFactory, {
        agent,
        canisterId: canisterId,
        ...options.actorOptions
    });
    return new Backend(actor, _uploadFile, _downloadFile, options.processError);
}
