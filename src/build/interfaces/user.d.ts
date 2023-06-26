import { JwtPayload } from "jsonwebtoken";
export type IUser = {
    email: string;
    username: string;
    password: string;
};
export type IJsonWebToken = {
    username: string;
    email: string;
} & JwtPayload;
