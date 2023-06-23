import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/createJsonToken';

export const addCorsHeaders = () => (req: Request, res: Response, next: NextFunction) => {
	res.setHeader('Access-Control-Allow-Origin', '*');

	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');

	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	next();
};

export const checkForAuthToken = () => (req: Request, res: Response, next: NextFunction) => {
	if(req.headers.authorization){
		const user = verifyToken(req.headers.authorization);
		req.body['user'] = user;
		next();
	}else{
		res.status(401).json('User is not authenticate');
	}
	
};