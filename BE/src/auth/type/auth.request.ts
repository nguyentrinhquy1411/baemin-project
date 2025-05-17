export interface LoginRequest {
    account: string;
    password: string;
}

export interface RefreshTokenRequest {
    refresh_token: string;
}

export interface TokenPayload {
    sub: string;
    username: string;
    email: string;
    role: string;
    created_at: Date;
}
