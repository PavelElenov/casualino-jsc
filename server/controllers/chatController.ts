import { IConversation, IConversationMoreInfo, IConversationWithoutId, IMessage } from "../../shared/interfaces/conversation";
import { createNewConversation, addLike, deleteChatById, deleteMessage, getAllChats, getConversationById, getLastMessagesOfConversation } from "../services/chatService";
import { Router } from "express";

export const router = Router();
router.get("/", (req, res) => {
  const chats: IConversationMoreInfo[] = getAllChats();
  res.json(chats);
});

router.get("/:id", (req, res) => {
  try {
    const conversation:IConversation | Error = getConversationById(parseInt(req.params.id));
    res.status(200).json(conversation);
  } catch (error: any) {
    res.status(404);
    res.json(error.message);
  }
});

router.get("/:id/lastMessages", (req, res) => {
  const lastMessages: IMessage[] | null = getLastMessagesOfConversation(parseInt(req.params.id));

  if(lastMessages){
    res.status(200).json(lastMessages);
  }else{
    res.status(204).json();
  }
  
})

router.delete("/:id", (req, res) => {
  const conversationId = parseInt(req.params.id);
  deleteChatById(conversationId);
  res.status(204).json();
});

router.delete("/:conversationId/messages/:messageId", (req, res) => {
  const {conversationId, messageId} = req.params;
  deleteMessage(parseInt(conversationId), parseInt(messageId));
  res.status(204).json();
});

router.post("/", (req, res) => {
  const newChat: IConversationWithoutId = req.body.chat;
  const conversation: IConversation = createNewConversation(newChat);
  res.status(200).json(conversation);
});

router.post("/:name/like", (req, res) => {
  const {name} = req.params;
  addLike(name);
  res.status(204).json();
})
