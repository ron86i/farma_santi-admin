export interface UserRequest {
    username: string
    password: string
}

export interface AuthResponse {
    message: string
    token: string
}