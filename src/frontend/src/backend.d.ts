import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface ScoreEntry {
    player: Principal;
    score: bigint;
    timestamp: Time;
    playerName?: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllScores(): Promise<Array<ScoreEntry>>;
    getCallerScores(): Promise<Array<ScoreEntry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getScoreEntriesForPlayer(player: Principal): Promise<Array<ScoreEntry>>;
    getTopGlobalScores(count: bigint): Promise<Array<ScoreEntry>>;
    getTopScoresForPlayer(player: Principal, count: bigint): Promise<Array<ScoreEntry>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitScore(playerName: string | null, score: bigint): Promise<void>;
}
