import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TelegramUser } from '../types/telegram';

interface UserState {
  telegramUser: TelegramUser | null;
  userId: string | null;
  wilaya: string | null;
  score: number;
  weeklyStudyTime: number;
  totalStudyTime: number;
  isInitialized: boolean;
  setTelegramUser: (user: TelegramUser | null) => void;
  setUserId: (id: string | null) => void;
  setWilaya: (wilaya: string | null) => void;
  setScore: (score: number) => void;
  setWeeklyStudyTime: (time: number) => void;
  setTotalStudyTime: (time: number) => void;
  addStudyTime: (seconds: number) => void;
  setIsInitialized: (initialized: boolean) => void;
  resetUser: () => void;
}

export const useStore = create<UserState>()(
  persist(
    (set) => ({
      telegramUser: null,
      userId: null,
      wilaya: null,
      score: 0,
      weeklyStudyTime: 0,
      totalStudyTime: 0,
      isInitialized: false,
      setTelegramUser: (user) => set({ telegramUser: user }),
      setUserId: (id) => set({ userId: id }),
      setWilaya: (wilaya) => set({ wilaya }),
      setScore: (score) => set({ score }),
      setWeeklyStudyTime: (time) => set({ weeklyStudyTime: time }),
      setTotalStudyTime: (time) => set({ totalStudyTime: time }),
      addStudyTime: (seconds) => set((state) => ({
        weeklyStudyTime: state.weeklyStudyTime + seconds,
        totalStudyTime: state.totalStudyTime + seconds,
        score: state.score + Math.floor(seconds / 60) // Add points based on minutes studied
      })),
      setIsInitialized: (initialized) => set({ isInitialized: initialized }),
      resetUser: () => set({
        telegramUser: null,
        userId: null,
        wilaya: null,
        score: 0,
        weeklyStudyTime: 0,
        totalStudyTime: 0,
        isInitialized: false,
      }),
    }),
    {
      name: 'student-app-storage',
    }
  )
);