import {
  client,
  COMPLETIONS_COLLECTION,
  DATABASE_ID,
  databases,
  HABIT_COLLECTION_ID,
  RealtimeResponse,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { CompletedHabit, Habit } from "@/types/database.type";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Query } from "react-native-appwrite";
import { ScrollView } from "react-native-gesture-handler";
import { Card, Text } from "react-native-paper";

export default function StreaksScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<CompletedHabit[]>([]);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const habitChanel = `databases.${DATABASE_ID}.collections.${HABIT_COLLECTION_ID}.documents`;
      const habitSubscription = client.subscribe(
        habitChanel,
        (response: RealtimeResponse) => {
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.create"
            )
          ) {
            fetchHabits();
          }
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.update"
            )
          ) {
            fetchHabits();
          }
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.delete"
            )
          ) {
            fetchHabits();
          }
        }
      );

      const completionChanel = `databases.${DATABASE_ID}.collections.${COMPLETIONS_COLLECTION}.documents`;
      const completionSubscription = client.subscribe(
        completionChanel,
        (response: RealtimeResponse) => {
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.create"
            )
          ) {
            fetchCompletions();
          }
        }
      );

      fetchHabits();
      fetchCompletions();

      return () => {
        habitSubscription();
        completionSubscription();
      };
    }
  }, [user]);

  const fetchHabits = async function () {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        HABIT_COLLECTION_ID,
        [Query.equal("user_id", user?.$id ?? "")]
      );
      setHabits(response.documents as unknown as Habit[]);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCompletions = async function () {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COMPLETIONS_COLLECTION,
        [Query.equal("user_id", user?.$id ?? "")]
      );
      const complitions = response.documents as unknown as CompletedHabit[];
      setCompletedHabits(complitions);
    } catch (error) {
      console.log(error);
    }
  };

  interface StreakData {
    streak: number;
    bestStreak: number;
    total: number;
  }

  const getStreakData = (habitId: string): StreakData => {
    const habitCompletion = completedHabits
      ?.filter((c) => c.habit_id === habitId)
      ?.sort(
        (a, b) =>
          new Date(a.completed_at).getTime() -
          new Date(b.completed_at).getTime()
      );

    if (habitCompletion?.length === 0) {
      return { streak: 0, bestStreak: 0, total: 0 };
    }

    // build streak data
    let streak = 0;
    let bestStreak = 0;
    let total = habitCompletion?.length;

    let lastDate: Date | null = null;
    let currentStreak = 0;

    habitCompletion?.forEach((c) => {
      const date = new Date(c.completed_at);

      if (lastDate) {
        const diff =
          (date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

        if (diff <= 1.5) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }

      if (currentStreak > bestStreak) bestStreak = currentStreak;
      streak = currentStreak;
      lastDate = date;
    });

    return { streak, bestStreak, total };
  };

  const habitStreak = habits.map((habit) => {
    const { bestStreak, streak, total } = getStreakData(habit.$id);
    return { habit, bestStreak, total, streak };
  });

  const rankedHabits = habitStreak.sort((a, b) => b.bestStreak - a.bestStreak);

  const badgeStyles = [styles.badge1, styles.badge2, styles.badge3];

  return (
    <View style={styles.container}>
      <Text style={styles.title} variant="headlineSmall">
        {" "}
        Habit Streaks
      </Text>

      {rankedHabits.length > 0 && (
        <View style={styles.rankingContainer}>
          <Text style={styles.rankingTitle}> 🥇 Top Streaks</Text>

          {rankedHabits.slice(0, 3).map((item, key) => (
            <View key={key} style={styles.rankingRow}>
              <View style={[styles.rankingBadge, badgeStyles[key]]}>
                <Text style={styles.rankingBadgeText}>{key + 1}</Text>
              </View>
              <Text style={styles.rankingHabit}>{item.habit.title}</Text>
              <Text style={styles.rankingStreak}>{item.bestStreak}</Text>
            </View>
          ))}
        </View>
      )}

      {habits.length === 0 ? (
        <View style={styles.container}>
          <Text style={styles.title}>No Habits yet. add your first Habit!</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.container}
        >
          {rankedHabits.map(({ bestStreak, habit, streak, total }, key) => (
            <Card
              key={key}
              style={[styles.card, key === 0 && styles.firstCard]}
            >
              <Card.Content>
                <Text variant="titleMedium" style={styles.habitTitle}>
                  {habit.title}
                </Text>
                <Text style={styles.habitDescription}>{habit.decription}</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statsBage}>
                    <Text style={styles.statsBageText}>🔥 {streak}</Text>
                    <Text style={styles.statsBageLabel}>Current</Text>
                  </View>
                  <View style={styles.statsBageGold}>
                    <Text style={styles.statsBageText}>🏆 {bestStreak}</Text>
                    <Text style={styles.statsBageLabel}>Best</Text>
                  </View>
                  <View style={styles.statsBageGreen}>
                    <Text style={styles.statsBageText}>✅ {total}</Text>
                    <Text style={styles.statsBageLabel}>Total</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },

  title: {
    fontWeight: "bold",
    marginBottom: 16,
  },

  card: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: "#fff",
    elevation: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },

  firstCard: {
    borderWidth: 2,
    borderColor: "#7c4dff",
  },

  habitTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 2,
  },

  habitDescription: {
    color: "#6c6c88",
    marginBottom: 0,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
    marginTop: 8,
  },

  statsBage: {
    backgroundColor: "#fff3e0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
  },

  statsBageText: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#22223b",
  },

  statsBageLabel: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
    fontWeight: "500",
  },

  statsBageGold: {
    backgroundColor: "#fffde7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
  },

  statsBageGreen: {
    backgroundColor: "#e8f5e9",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
  },

  rankingContainer: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },

  rankingTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
    color: "#7c4dff",
    letterSpacing: 0.5,
  },

  rankingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 8,
  },

  rankingBadge: {
    width: 28,
    height: 21,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#e0e0e0",
  },

  badge1: {
    backgroundColor: "#ffd700", // gold
  },
  badge2: {
    backgroundColor: "#c0c0c0", // sliver
  },
  badge3: {
    backgroundColor: "#cd7f32", // bronze
  },

  rankingBadgeText: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 15,
  },

  rankingHabit: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
  },

  rankingStreak: {
    fontSize: 14,
    color: "#7c4dff",
    fontWeight: "bold",
  },
});
