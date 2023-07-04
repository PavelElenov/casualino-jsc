import { IConversation } from "../../shared/interfaces/conversation";
import { deleteChatByName, deleteMessage, getAllChats, getConversationByName } from "../services/chatService";
import { Router } from "express";

export const router = Router();

router.get("/", (req, res) => {
  const chats: IConversation[] = getAllChats();
  res.json(chats);
});

router.get("/:name", (req, res) => {
  try {
    const conversation:IConversation | Error = getConversationByName(req.params.name);
    res.status(200).json(conversation);
  } catch (error: any) {
    res.status(404);
    res.json(error.message);
  }
});

router.delete("/:name", (req, res) => {
  const chatName = req.params.name;
  console.log(chatName);
  
  deleteChatByName(chatName);
  res.status(204).json();
});
//conversations/1/messages/hi
router.delete("/:name/messages/:messageText", (req, res) => {
  const {name, messageText} = req.params;
  console.log(name, messageText);
  
  deleteMessage(name, messageText);
  res.status(204);
})
