import { Express } from "express";
import { router as loginController } from "../controllers/loginController";
import { router as chatController } from "../controllers/chatController";
import { router as userController } from "../controllers/userController";
import { checkForAuthToken } from "../middlewares/checkAuthToken";

export const routesConfig = (app: Express): void => {
  app.use("/login", loginController);
  app.use("/conversations", checkForAuthToken(), chatController);
  app.use("/user", checkForAuthToken(), userController);
};
