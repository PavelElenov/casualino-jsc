import { checkForAuthToken } from "../middlewares/corsMiddleware";
import { Express } from "express";
import {router as loginController} from "../controllers/loginController";
import {router as chatController} from "../controllers/chatController";

export const routesConfig = (app: Express): void => {
    app.use("/login", loginController);
    app.use("/conversations", checkForAuthToken(), chatController);
}