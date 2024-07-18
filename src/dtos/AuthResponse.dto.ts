import { TokenResponse } from "./TokenResponse.dto"
import { UserResponse } from "./UserResponse.dto"

export type AuthResponse = {
    user: UserResponse,
    token?: TokenResponse
}