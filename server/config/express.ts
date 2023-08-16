import * as express from "express";
import * as cors from "cors";

export const expressConfig = (app: express.Express): void => {
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cors());
}