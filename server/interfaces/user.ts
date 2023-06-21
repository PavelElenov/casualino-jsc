import { JwtPayload } from "jsonwebtoken";


export interface IUser {
    email: string,
    username: string,
    password: string
}

export interface IJsonWebToken extends JwtPayload {
    username: string,
    email: string,
}