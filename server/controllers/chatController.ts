import { IConversation } from "../interfaces/conversation";
import { getAllChats, getConversationByName } from "../services/chatService";
import express from "express";

export const router = express.Router();

router.get("/", (req, res) => {
  try {
    const chats: IConversation[] = getAllChats();
    res.json(chats);
  } catch (error: any) {
    res.status(401);
    res.json(error.message);
  }
});

router.get("/:name", (req, res) => {
  try {
    const conversation = getConversationByName(req.params.name);
    res.status(200).json(conversation);
  } catch (error: any) {
    res.status(404);
    res.json(error.message);
  }
});
