import { RoomInUser } from '../types/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface ItemRoom {
    room: RoomInUser;
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
            (set: (partial: CompareStore | Partial<CompareStore> | ((state: CompareStore) => CompareStore | Partial<CompareStore>)) => void) => ({
                items: [],
                addItem: (item: ItemRoom) => set((state: CompareStore) => ({ items: [...state.items, item] })),
                removeItem: (key: string) => set((state: CompareStore) => ({ items: state.items.filter((item: ItemRoom) => item.room.id !== key) })),
                clearItems: () => set({ items: [] }),
            }),
            { name: 'compare-store' }
        )
    )
);
