import {Request, Response, NextFunction} from "express";

export const addCorsHeaders = () => (req: Request, res: Response, next: NextFunction) => {
	res.setHeader("Access-Control-Allow-Origin", "*");

	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");

	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
	console.log("In cors middleware");
	

	next();
};