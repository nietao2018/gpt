import { cloneDeep } from 'lodash';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { t } from './i18n';
import type { ChatItem, ChatMessage } from './types';
import { uuid } from './utils';

export interface ChatAtomType {
  currentChat: ChatItem;
  chatList: ChatItem[];
}

export interface ChatConfigType {
  accessCode?: string;
  openAIKey?: string;

  openAIHost?: string;
  openAIModel?: string;
  temperature?: string;
  top_p?: string;

  searchSuggestions?: string;
  enterSend?: string;

  unisoundAppKey?: string;
  unisoundSecret?: string;
}

export const chatConfigStore = create<ChatConfigType, [['zustand/persist', ChatConfigType]]>(
  persist(
    (set, get) => ({
      temperature: '0.6',
      top_p: '1',
    }),
    {
      name: 'persist-chat-config',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const chatDataStore = create<{ data: ChatMessage[] }>((setState, getState, store) => ({
  data: [],
}));

interface VisibleState {
  chatVisible: boolean;
  promptVisible: boolean;
  settingVisible: boolean;
  imageVisible: boolean;
}

export const visibleStore = create<VisibleState>((setState, getState, store) => ({
  chatVisible: false,
  promptVisible: false,
  settingVisible: false,
  imageVisible: false,
}));

interface ChatState {
  chatList: Array<ChatItem>;
}

interface ChatAction {
  currentChat: () => ChatItem;
  saveChatList: (value: ChatItem[]) => void;
  updateChat: (id: string, value: Partial<ChatItem>) => void;
}

export const chatListStore = create<ChatState & ChatAction, [['zustand/persist', ChatState & ChatAction]]>(
  persist(
    (set, get) => ({
      chatList: [],
      currentChat: () => {
        const { chatList } = get();
        let chat = chatList.find((v) => v.selected)!;
        if (!chat && chatList.length > 0) {
          chatList[0].selected = true;
          chat = chatList[0];
        }
        if (!chat) {
          const id = uuid();
          const item: ChatItem = { id, name: t('New Chat') + ' ' + id.slice(0, 6) };
          set({ chatList: [item] });
          chat = item;
        }
        return chat;
      },
      saveChatList: (value) => {
        const selected = value.find((v) => v.selected);
        if (!selected && value.length > 0) {
          value[0].selected = true;
        }
        set({ chatList: cloneDeep(value) });
      },
      updateChat: (id, value) => {
        const chatList = get().chatList;
        const index = chatList.findIndex((v) => v.id === id);
        chatList[index] = { ...chatList[index], ...value };

        set((state) => {
          return { chatList: cloneDeep(state.chatList) };
        });
      },
    }),
    {
      name: 'persist-chat',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);