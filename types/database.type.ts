import { Models } from "react-native-appwrite";

export interface Habit extends Models.Document {
  user_id: string;
  title: string;
  decription: string;
  frequency: string;
  streak_count: number;
  last_completed: string;
  created_at: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface CompletedHabit {
  habit_id: string;
  user_id: string;
  completed_at: string;
}
