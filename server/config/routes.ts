const loginController = require("../controllers/loginController");
const usersController = require("../controllers/usersController");
const chatController = require("../controllers/chatController");

export const routesConfig = (app): void => {
    app.use("/login", loginController);
    app.use("/conversations", chatController);
    app.use("/", usersController);
}