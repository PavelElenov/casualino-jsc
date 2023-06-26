import express, { Express } from "express";
import { addCorsHeaders } from "../middlewares/corsMiddleware";
import cors from "cors";

export const expressConfig = (app: Express): void => {
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cors());
}