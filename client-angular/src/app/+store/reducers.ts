import { state } from '@angular/animations';
import {
  createEntityAdapter,
  EntityAdapter,
  EntityState,
  Update,
} from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { IConversation, IMessage } from '../shared/interfaces/message';
import { IUser } from '../shared/interfaces/user';
import {
  addChat,
  addLastMessages,
  addMessage,
  addMessageToChatByChatId,
  addMessageToOldestMessages,
  addNewMessage,
  addOldestMessages,
  clearChat,
  clearChats,
  clearNewMessages,
  clearUser,
  deleteChat,
  deleteMessage,
  likeChat,
  replaceMessageById,
  setChats,
  setError,
  setLastPageEqualsToTrue,
  setMessageError,
  setMessageSendingStatus,
  setMessagesPerPage,
  setUser,
  setWaitingForMessages,
  substractOneNewMessage,
} from './actions';

export interface IChats {
  chats: IConversation[];
}

export interface ICurrentChatInfo {
  id: string;
  lastMessagesIdsRead: string[];
  oldestMessagesIdsRead: string[];
  newMessagesCount: number;
  messagesPerPage: number;
  lastPage: boolean;
  waitingForNewMessages: boolean;
  messageError: string | null;
}

export interface IUserState {
  user: IUser;
}

export interface IError {
  error: string;
}

export interface IChatsEntity extends EntityState<ICurrentChatInfo> {}

export const chatsAdapter: EntityAdapter<ICurrentChatInfo> =
  createEntityAdapter<ICurrentChatInfo>();

const chatsEntityState: IChatsEntity = chatsAdapter.getInitialState();

export const messagesAdapter: EntityAdapter<IMessage> = createEntityAdapter<IMessage>();
const messagesEntityState = messagesAdapter.getInitialState();

const chatsState: IChats = {
  chats: [],
};

const userState: IUserState = {
  user: {
    username: '',
    email: '',
    img: '',
    level: 0,
  },
};

const errorState: IError = {
  error: '',
};

export const messagesEntityReducer = createReducer(
  messagesEntityState,
  on(addMessageToChatByChatId, (state, data: {chatId: string, message: IMessage}) => {
    return messagesAdapter.addOne(data.message, state);
  }),
  on(setMessageSendingStatus, (state, data:{chatId:string, messageId: string, status: boolean}) => {
    const updatedState: Update<IMessage> = {
      id: data.messageId,
      changes: {
        sending: data.status
      }
    };
    return messagesAdapter.updateOne(updatedState, state);
  }),
  on(replaceMessageById, (state, data:{chatId: string, messageId: string, message: IMessage}) => {
    const updatedState: Update<IMessage> = {
      id: data.messageId,
      changes: {
        id: data.message.id
      }
    };
    return messagesAdapter.updateOne(updatedState, state);
  }),
  on(deleteMessage, (state, data:{chatId: string, messageId: string}) => {
    return messagesAdapter.removeOne(data.messageId, state);
  }),
  on(addLastMessages, (state, data: {lastMessages: IMessage[]}) => {
    return messagesAdapter.addMany(data.lastMessages, state);
  }),
  on(addOldestMessages, (state, data:{messages: IMessage[]}) => {
    return messagesAdapter.addMany(data.messages, state);
  })
)

export const chatsReducer = createReducer(
  chatsState,
  on(addChat, (state, { chat }) => ({
    ...state,
    chats: [...state.chats, chat],
  })),
  on(setChats, (state, { chats }) => ({ ...state, chats })),
  on(deleteChat, (state, { id }) => ({
    ...state,
    chats: state.chats.filter((c) => c.id !== id),
  })),
  on(clearChats, () => ({ chats: [] })),
  on(likeChat, (state, { chat }) => ({
    ...state,
    chats: state.chats.map<IConversation>((c: IConversation) => {
      if (c.name == chat.name) {
        return chat;
      }
      return c;
    }),
  }))
);

export const chatsEntityReducer = createReducer(
  chatsEntityState,
  on(setChats, (state, { chats }) => {
    return chatsAdapter.addMany(
      chats.map((chat) => {
        return {
          id: chat.id!,
          lastMessagesIdsRead: [],
          oldestMessagesIdsRead: [],
          allMessages: [],
          newMessagesCount: 0,
          messagesPerPage: 0,
          lastPage: false,
          waitingForNewMessages: false,
          messageError: null,
        };
      }),
      state
    );
  }),
  on(addChat, (state, { chat }) => {
    return chatsAdapter.addOne(
      {
        id: chat.id!,
        lastMessagesIdsRead: [],
        oldestMessagesIdsRead: [],
        newMessagesCount: 0,
        messagesPerPage: 0,
        lastPage: false,
        waitingForNewMessages: false,
        messageError: null,
      },
      state
    );
  }),
  on(
    addMessageToChatByChatId,
    (state, data: { chatId: string; message: IMessage }) => {
      const chat: ICurrentChatInfo = state.entities[data.chatId]!;
      const updatedChat: Update<ICurrentChatInfo> = {
        id: data.chatId,
        changes: {
          lastMessagesIdsRead: [...chat.lastMessagesIdsRead, data.message.id],
        },
      };
      return chatsAdapter.updateOne(updatedChat, state);
    }
  ),
  on(
    addLastMessages,
    (
      state,
      data: { chatId: string; lastMessages: IMessage[]; lastMessageId?: string }
    ) => {
      const currentChat: ICurrentChatInfo = state.entities[data.chatId]!;
      let updatedChat: Update<ICurrentChatInfo> = {
        id: currentChat.id!,
        changes: {
          lastMessagesIdsRead: [
            ...data.lastMessages.map((m) => {
              return m.id;
            }),
            ...currentChat.lastMessagesIdsRead
          ],
        },
      };

      return chatsAdapter.updateOne(updatedChat, state);
    }
  ),
  on(
    addOldestMessages,
    (
      state,
      data: { chatId: string; lastMessageId: string; messages: IMessage[] }
    ) => {
      const currentChat = state.entities[data.chatId]!;
      const updatedChat: Update<ICurrentChatInfo> = {
        id: currentChat.id!,
        changes: {
          oldestMessagesIdsRead: [
            ...currentChat.oldestMessagesIdsRead,
            ...data.messages.map((m) => m.id),
          ],
        },
      };
      return chatsAdapter.updateOne(updatedChat, state);
    }
  ),
  on(deleteMessage, (state, data: { chatId: string; messageId: string }) => {
    const currentChat: ICurrentChatInfo = state.entities[data.chatId]!;
    let updatedChat: Update<ICurrentChatInfo> = {
      id: currentChat.id!,
      changes: {
        lastMessagesIdsRead: currentChat.lastMessagesIdsRead.filter(id => id !== data.messageId)
      },
    };

    if (currentChat.lastMessagesIdsRead.includes(data.messageId)) {
      const index = currentChat.lastMessagesIdsRead.findIndex(id => id === data.messageId);
      updatedChat.changes.lastMessagesIdsRead?.splice(index, 1);
    } else {
      const index = currentChat.oldestMessagesIdsRead.findIndex(id => id === data.messageId);
      updatedChat.changes.oldestMessagesIdsRead?.splice(index, 1);
    }

    return chatsAdapter.updateOne(updatedChat, state);
  }),
  on(addNewMessage, (state, data: { chatId: string }) => {
    const currentChat: ICurrentChatInfo = state.entities[data.chatId]!;
    const updatedChat: Update<ICurrentChatInfo> = {
      id: currentChat.id!,
      changes: {
        newMessagesCount: currentChat.newMessagesCount + 1,
      },
    };
    return chatsAdapter.updateOne(updatedChat, state);
  }),
  on(clearNewMessages, (state, data: { chatId: string }) => {
    const currentChat: ICurrentChatInfo = state.entities[data.chatId]!;
    const updatedChat: Update<ICurrentChatInfo> = {
      id: currentChat.id!,
      changes: {
        newMessagesCount: 0,
      },
    };
    return chatsAdapter.updateOne(updatedChat, state);
  }),
  on(substractOneNewMessage, (state, data: { chatId: string }) => {
    const currentChat: ICurrentChatInfo = state.entities[data.chatId]!;
    const updatedChat: Update<ICurrentChatInfo> = {
      id: currentChat.id!,
      changes: {
        newMessagesCount: currentChat.newMessagesCount - 1,
      },
    };
    return chatsAdapter.updateOne(updatedChat, state);
  }),
  on(replaceMessageById, (state, { chatId, messageId, message }) => {
    const currentChat: ICurrentChatInfo = state.entities[chatId]!;
    const updatedChat: Update<ICurrentChatInfo> = {
      id: currentChat.id!,
      changes: {
        lastMessagesIdsRead: currentChat.lastMessagesIdsRead.map(id => {
          if(id === messageId){
            return message.id;
          };
          return id;
        })
      },
    };
    return chatsAdapter.updateOne(updatedChat, state);
  }),
  on(setMessagesPerPage, (state, { chatId, messagesPerPage }) => {
    const currentChat: ICurrentChatInfo = state.entities[chatId]!;
    const updatedChat: Update<ICurrentChatInfo> = {
      id: currentChat.id!,
      changes: {
        messagesPerPage: messagesPerPage,
      },
    };
    return chatsAdapter.updateOne(updatedChat, state);
  }),
  on(setLastPageEqualsToTrue, (state, data: { chatId: string }) => {
    const currentChat: ICurrentChatInfo = state.entities[data.chatId]!;
    const updatedChat: Update<ICurrentChatInfo> = {
      id: currentChat.id!,
      changes: {
        lastPage: true,
      },
    };
    return chatsAdapter.updateOne(updatedChat, state);
  }),
  on(setWaitingForMessages, (state, { chatId, value }) => {
    const currentChat: ICurrentChatInfo = state.entities[chatId]!;
    const updatedChat: Update<ICurrentChatInfo> = {
      id: currentChat.id!,
      changes: {
        waitingForNewMessages: value,
      },
    };
    return chatsAdapter.updateOne(updatedChat, state);
  }),
  on(
    setMessageError,
    (state, data: { chatId: string; value: string | null }) => {
      const chat = state.entities[data.chatId]!;
      const updatedChat: Update<ICurrentChatInfo> = {
        id: chat.id!,
        changes: {
          messageError: data.value,
        },
      };
      return chatsAdapter.updateOne(updatedChat, state);
    }
  ),
  on(clearChat, (state, data: { chatId: string }) => {
    const chat = state.entities[data.chatId]!;
    const updatedChat: Update<ICurrentChatInfo> = {
      id: chat.id!,
      changes: {
        newMessagesCount: 0,
        waitingForNewMessages: false,
        messageError: null,
      },
    };
    return chatsAdapter.updateOne(updatedChat, state);
  }),
);

export const userReducer = createReducer(
  userState,
  on(setUser, (state, { user }) => ({ ...state, user })),
  on(clearUser, () => ({
    user: {
      username: '',
      email: '',
      img: '',
      level: 0,
    },
  }))
);

export const errorReducer = createReducer(
  errorState,
  on(setError, (state, { error }) => ({ ...state, error }))
);
