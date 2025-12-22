import { RoomDetail } from '../types/types';
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ItemRoom {
    room: RoomDetail;
}

interface CompareStore {
    items: ItemRoom[];
    addItem: (item: ItemRoom) => void;
    removeItem: (key: string) => void;
    clearItems: () => void;
}

export const useCompareStore = create<CompareStore>()(
    devtools(
        persist(
            (set) => ({
                items: [],
                addItem: (item: ItemRoom) => set((state: CompareStore) => {
                    // Prevent duplicates
                    if (state.items.some(i => i.room.id === item.room.id)) {
                        return state;
                    }
                    return { items: [...state.items, item] };
                }),
                removeItem: (key: string) => set((state: CompareStore) => ({ items: state.items.filter((item: ItemRoom) => item.room.id !== key) })),
                clearItems: () => set({ items: [] }),
            }),
            { 
                name: 'compare-storage',
                storage: createJSONStorage(() => AsyncStorage),
            }
        )
    )
);
