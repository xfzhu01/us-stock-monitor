import { format } from 'date-fns';
import { create } from 'zustand';

interface AppState {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedDate: format(new Date(), 'yyyy-MM-dd'),
  setSelectedDate: (date: string) => set({ selectedDate: date }),
}));
