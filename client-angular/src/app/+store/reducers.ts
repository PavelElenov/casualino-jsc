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

export interface ICurrentChatInfo extends IConversation {
  lastMessages: IMessage[];
  oldestMessages: IMessage[];
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

const chatsEntityState: IChatsEntity = chatsAdapter.getInitialState({});

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
          ...chat,
          lastMessages: [],
          oldestMessages: [],
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
        ...chat,
        lastMessages: [],
        oldestMessages: [],
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
    addMessage,
    (state: IChatsEntity, data: { chatId: string; message: IMessage }) => {
      const currentChat = state.entities[data.chatId]!;
      const updatedChat: Update<ICurrentChatInfo> = {
        id: currentChat.id!,
        changes: { lastMessages: [...currentChat.lastMessages, data.message] },
      };
      return chatsAdapter.updateOne(updatedChat, state);
    }
  ),
  on(addMessageToOldestMessages, (state, data: {chatId: string, message: IMessage}) => {
    const chat: ICurrentChatInfo = state.entities[data.chatId]!;
    const updatedChat: Update<ICurrentChatInfo> = {
      id: chat.id!,
      changes: {
        oldestMessages: [...chat.oldestMessages, data.message]
      }
    };
    return chatsAdapter.updateOne(updatedChat, state);
  }),
  on(
    addMessageToChatByChatId,
    (state, data: { chatId: string; message: IMessage }) => {
      const chat = state.entities[data.chatId]!;
      const updatedChat: Update<ICurrentChatInfo> = {
        id: data.chatId,
        changes: {
          lastMessages: [...chat.lastMessages, data.message],
        },
      };
      return chatsAdapter.updateOne(updatedChat, state);
    }
  ),
  on(
    addLastMessages,
    (state, data: { chatId: string; lastMessages: IMessage[] }) => {
      const currentChat: ICurrentChatInfo = state.entities[data.chatId]!;
      const updatedChat: Update<ICurrentChatInfo> = {
        id: currentChat.id!,
        changes: {
          lastMessages: [...data.lastMessages, ...currentChat.lastMessages],
        },
      };
      return chatsAdapter.updateOne(updatedChat, state);
    }
  ),
  on(
    addOldestMessages,
    (state, data: { chatId: string; messages: IMessage[] }) => {
      const currenChat = state.entities[data.chatId]!;
      const updatedChat: Update<ICurrentChatInfo> = {
        id: currenChat.id!,
        changes: {
          oldestMessages: [...currenChat.oldestMessages, ...data.messages],
        },
      };
      return chatsAdapter.updateOne(updatedChat, state);
    }
  ),
  on(deleteMessage, (state, data: { chatId: string; messageId: string }) => {
    const currentChat: ICurrentChatInfo = state.entities[data.chatId]!;
    const updatedChat: Update<ICurrentChatInfo> = {
      id: currentChat.id!,
      changes: {
        lastMessages: currentChat.lastMessages.filter(
          (m) => m.id !== data.messageId
        ),
      },
    };
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
        lastMessages: currentChat.lastMessages.map((messageInfo) => {
          if (messageInfo.id === messageId) {
            return message;
          }
          return messageInfo;
        }),
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
    return chatsAdapter.updateOne(updatedChat, state)
  }),
  on(setMessageSendingStatus, (state, data: {chatId: string, messageId: string, status: boolean}) => {
    const chat = state.entities[data.chatId]!;
    const message: IMessage = chat.lastMessages.find((m:IMessage) => m.id === data.messageId)!;
    const updatedChat: Update<ICurrentChatInfo> = {
      id: chat.id!,
      changes: {
        lastMessages: chat.lastMessages.map(m => {
          if(m.id === message.id){
            return {...message, sending: data.status};
          }
          return m;
        })
      }
    };
    return chatsAdapter.updateOne(updatedChat, state);
  })
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
