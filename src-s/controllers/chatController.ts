import { IConversation } from "../../interfaces/conversation";
import { getAllChats, getConversationByName } from "../services/chatService";
import { Router } from "express";

export const router = Router();

router.get("/", (req, res) => {
  const chats: IConversation[] = getAllChats();
  res.json(chats);
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
