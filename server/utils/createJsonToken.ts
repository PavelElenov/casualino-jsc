import * as jwt from "jsonwebtoken";
import { IJsonWebToken, IUserSomeInfo } from "../../interfaces/user";

const key = "fjdakf1i312313"

export function createToken(data: IUserSomeInfo){
    return jwt.sign(data, key);
}

export function verifyToken(token: string): IJsonWebToken{
    return jwt.verify(token, key) as IJsonWebToken;
}