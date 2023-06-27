import { JwtPayload } from "jsonwebtoken";


export type IUser = {
    email: string,
    username: string,
    password: string,
    level: number,
    img: string,
}

export interface IUserSomeInfo{
    username:string,
    level: number,
    img: string
}

export type IJsonWebToken = {
    username: string,
    email: string,
} & JwtPayload