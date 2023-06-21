import express, { Express } from "express";
import { addCorsHeaders, addUserToRequest } from "../middlewares/corsMiddleware";

export const expressConfig = (app: Express): void => {
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(addCorsHeaders());
    app.use(addUserToRequest());
}