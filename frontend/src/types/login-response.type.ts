export type LoginResponseType = {
    error: boolean,
    message: string,
    tokens?: {
        accessToken: string,
        refreshToken: string,
    },
    user?: {
        name: string,
        lastName: string,
        id: number,
    },
}