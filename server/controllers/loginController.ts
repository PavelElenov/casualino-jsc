import {Router} from "express";
import { addToken } from "../services/tokenService";
import { login } from "../services/userService";
import { createToken } from "../utils/createJsonToken";

export const router = Router();

router.post("/", (req, res) => {
  try {
    const user: {username: string, email:string} = login(req.body.email, req.body.password);
    const token = createToken(user);
    addToken({user: user.username, token})
    res.status(200);
    res.json({ user, token });
  } catch (error: any) {
    res.status(400);
    res.json(error.message);
  }
});
