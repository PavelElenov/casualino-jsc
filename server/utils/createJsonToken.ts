import * as jwt from "jsonwebtoken";
import { IJsonWebToken, IUserSomeInfo } from "../../shared/interfaces/user";
import { tokens } from "../services/tokenService";

const key = "fjdakf1i312313"

export function createToken(data: IUserSomeInfo){
    const userHaveToken = tokens.find(tokenInfo => tokenInfo.user == data.username);
    return userHaveToken ? userHaveToken.token : jwt.sign(data, key);
}

export function verifyToken(token: string): IJsonWebToken{
    return jwt.verify(token, key) as IJsonWebToken;
}