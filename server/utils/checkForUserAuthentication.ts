import {Request} from "express";

export function checkUserAuthentication(req: Request): boolean | string {
    if (req.body['user']) {
        return true;
    } else {
        return 'User is not authenticate';
    }
}