/**
 * ===== TYPES CHO FAVORITED SCREEN =====
 */

import { RoomInUser } from '../../../types/types';

// Re-export RoomInUser
export type { RoomInUser };

// Filter options
export type FilterType = 'all' | 'vip' | 'normal';

export interface FilterOption {
  key: FilterType;
  label: string;
  icon: string;
}

export const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'Tất cả', icon: 'grid-outline' },
  { key: 'vip', label: 'VIP', icon: 'star' },
  { key: 'normal', label: 'Thường', icon: 'home-outline' },
];
