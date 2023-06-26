import {Request, Response, NextFunction} from "express";
import { verifyToken } from "../utils/createJsonToken";

export const checkForAuthToken = () => (req: Request, res: Response, next: NextFunction) => {
	if(req.headers.authorization){
		const user = verifyToken(req.headers.authorization);
		req.body['user'] = user;
		next();
	}else{
		res.status(401).json('User is not authenticate');
	}
};