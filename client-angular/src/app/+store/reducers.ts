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
  addNewMessage,
  clearChats,
  clearNewMessages,
  clearSelectedChatId,
  clearUser,
  deleteChat,
  deleteMessage,
  likeChat,
  replaceMessageById,
  setChats,
  setError,
  setLastPageEqualsToTrue,
  setMessagesPerPage,
  setSelectedChatId,
  setUser,
  setWaitingForMessages,
  substractOneNewMessage,
} from './actions';

export interface IChats {
  chats: IConversation[];
}

export interface ICurrentChatInfo extends IConversation {
  lastMessages: IMessage[];
  newMessagesCount: number;
  messagesPerPage: number;
  lastPage: boolean;
  waitingForNewLastMessages: boolean;
}

export interface IUserState {
  user: IUser;
}

export interface IError {
  error: string;
}

export interface IChatsEntity extends EntityState<ICurrentChatInfo> {
  selectedChatId: string | null;
}

export const chatsAdapter: EntityAdapter<ICurrentChatInfo> =
  createEntityAdapter<ICurrentChatInfo>();

const chatsEntityState: IChatsEntity = chatsAdapter.getInitialState({
  selectedChatId: null,
});

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
  on(setChats, (state, {chats}) => {
    return chatsAdapter.addMany(chats.map(chat => {
      return {
        ...chat,
        lastMessages: [],
        newMessagesCount: 0,
        messagesPerPage: 0,
        lastPage: false,
        waitingForNewLastMessages: false,
      }
    }), state);
  }),
  on(addChat, (state, { chat }) => {
    return chatsAdapter.addOne(
      {
        ...chat,
        lastMessages: [],
        newMessagesCount: 0,
        messagesPerPage: 0,
        lastPage: false,
        waitingForNewLastMessages: false,
      },
      state
    );
  }),
  on(addMessage, (state: IChatsEntity, data: { message: IMessage }) => {
    const currentChat = state.entities[state.selectedChatId!]!;
    const updatedChat: Update<ICurrentChatInfo> = {
      id: currentChat.id!,
      changes: { lastMessages: [...currentChat.lastMessages, data.message] },
    };
    return chatsAdapter.updateOne(updatedChat, state);
  }),
  on(addMessageToChatByChatId, (state, data: {chatId: string, message: IMessage}) => {
    const chat = state.entities[data.chatId]!;
    const updatedChat: Update<ICurrentChatInfo> = {
      id: data.chatId,
      changes: {
        lastMessages: [...chat.lastMessages, data.message]
      }
    };
    return chatsAdapter.updateOne(updatedChat, state);
  }),
  on(addLastMessages, (state, data: { lastMessages: IMessage[] }) => {
    const currentChat: ICurrentChatInfo =
      state.entities[state.selectedChatId!]!;
    const updatedChat: Update<ICurrentChatInfo> = {
      id: currentChat.id!,
      changes: {
        lastMessages: [...data.lastMessages, ...currentChat.lastMessages],
      },
    };
    return chatsAdapter.updateOne(updatedChat, state);
  }),

  on(deleteMessage, (state, data: { messageId: string }) => {
    const currentChat: ICurrentChatInfo =
      state.entities[state.selectedChatId!]!;
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
  on(addNewMessage, (state) => {
    const currentChat: ICurrentChatInfo =
      state.entities[state.selectedChatId!]!;
    const updatedChat: Update<ICurrentChatInfo> = {
      id: currentChat.id!,
      changes: {
        newMessagesCount: currentChat.newMessagesCount + 1,
      },
    };
    return chatsAdapter.updateOne(updatedChat, state);
  }),
  on(clearNewMessages, (state) => {
    const currentChat: ICurrentChatInfo =
      state.entities[state.selectedChatId!]!;
    const updatedChat: Update<ICurrentChatInfo> = {
      id: currentChat.id!,
      changes: {
        newMessagesCount: 0,
      },
    };
    return chatsAdapter.updateOne(updatedChat, state);
  }),
  on(substractOneNewMessage, (state) => {
    const currentChat: ICurrentChatInfo =
      state.entities[state.selectedChatId!]!;
    const updatedChat: Update<ICurrentChatInfo> = {
      id: currentChat.id!,
      changes: {
        newMessagesCount: currentChat.newMessagesCount - 1,
      },
    };
    return chatsAdapter.updateOne(updatedChat, state);
  }),

  on(replaceMessageById, (state, { messageId, message }) => {
    const currentChat: ICurrentChatInfo =
      state.entities[state.selectedChatId!]!;
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
  on(setMessagesPerPage, (state, { messagesPerPage }) => {
    const currentChat: ICurrentChatInfo =
      state.entities[state.selectedChatId!]!;
    const updatedChat: Update<ICurrentChatInfo> = {
      id: currentChat.id!,
      changes: {
        messagesPerPage: messagesPerPage,
      },
    };
    return chatsAdapter.updateOne(updatedChat, state);
  }),
  on(setLastPageEqualsToTrue, (state) => {
    const currentChat: ICurrentChatInfo =
      state.entities[state.selectedChatId!]!;
    const updatedChat: Update<ICurrentChatInfo> = {
      id: currentChat.id!,
      changes: {
        lastPage: true,
      },
    };
    return chatsAdapter.updateOne(updatedChat, state);
  }),
  on(setWaitingForMessages, (state, { value }) => {
    const currentChat: ICurrentChatInfo =
      state.entities[state.selectedChatId!]!;
    const updatedChat: Update<ICurrentChatInfo> = {
      id: currentChat.id!,
      changes: {
        waitingForNewLastMessages: value,
      },
    };
    return chatsAdapter.updateOne(updatedChat, state);
  }),
  on(setSelectedChatId, (state, { chatId }) => ({
    ...state,
    selectedChatId: chatId,
  })),
  on(clearSelectedChatId, (state) => {
    const currentChat: ICurrentChatInfo =
      state.entities[state.selectedChatId!]!;
    const updatedChat: Update<ICurrentChatInfo> = {
      id: currentChat.id!,
      changes: {
        newMessagesCount: 0,
        messagesPerPage: 0,
        lastPage: false,
        waitingForNewLastMessages: false,
      },
    };
    return chatsAdapter.updateOne(updatedChat, {
      ...state,
      selectedChatId: null,
    });
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
