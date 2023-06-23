import jwt from "jsonwebtoken";
import { IJsonWebToken } from "../../interfaces/user";

const key = "fjdakf1i312313"

export function createToken(data: any){
    return jwt.sign(data, key);
}

export function verifyToken(token: string): IJsonWebToken{
    return jwt.verify(token, key) as IJsonWebToken;

}