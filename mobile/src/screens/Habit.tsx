import { ScrollView, View, Text, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import clsx from "clsx";
import dayjs from "dayjs";
import { BackButton } from "../components/BackButton";
import { ProgressBar } from "../components/ProgressBar";
import { CheckBox } from "../components/CheckBox";
import { api } from "../lib/axios";
import { useEffect, useState } from "react";
import { Loading } from "../components/Loading";
import { generateProgressPercentage } from "../utils/generate-progress-percentage";
import { HabitsEmpty } from "../components/HabitsEmpty";

interface Params {
  date: string;
}

type HabitsProps = {
  possibleHabits: { id: string; title: string; created_at: string }[];
  completedHabits: string[];
};

export function Habit() {
  const route = useRoute();
  const { date } = route.params as Params;

  const [habits, setHabits] = useState<HabitsProps | null>(null);
  const [loading, setLoading] = useState(true);

  const completedPercentage =
    habits && habits?.possibleHabits?.length > 0
      ? generateProgressPercentage(
          habits!.completedHabits.length,
          habits!.possibleHabits.length
        )
      : 0;

  async function getHabitList() {
    try {
      setLoading(true);
      const response = await api.get("day", {
        params: {
          date: date,
        },
      });
      const habits = response.data;
      setHabits(habits);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getHabitList();
  }, []);

  if (loading) {
    return <Loading />;
  }

  const parsedDate = dayjs(date);
  const dayOfWeek = parsedDate.format("dddd");
  const dayAndMonth = parsedDate.format("DD/MM");

  async function handleToggleHabit(habitId: string) {
    try {
      const isHabitAlreadyCompleted = habits!.completedHabits.includes(habitId);
      await api.patch(`/habits/${habitId}/toggle`);

      let completedHabits: string[] = [];
      if (isHabitAlreadyCompleted) {
        completedHabits = habits!.completedHabits.filter(
          (id) => id !== habitId
        );
      } else {
        completedHabits = [...habits!.completedHabits, habitId];
      }

      setHabits({
        completedHabits,
        possibleHabits: habits!.possibleHabits,
      });
    } catch (error) {
      Alert.alert("Ops...", "Não foi possível atualizar status do hábito.");
    }
  }

  const isDateInPast = dayjs(date).endOf("day").isBefore(new Date());
  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <BackButton />

        <Text className="mt-6 text-zinc-400 font-semibold text-base lowercase">
          {dayOfWeek}
        </Text>
        <Text className="mt-2 text-white font-extrabold text-3xl">
          {dayAndMonth}
        </Text>

        <ProgressBar progress={completedPercentage} />

        <View
          className={clsx("mt-6", {
            ["opacity-40"]: isDateInPast,
          })}
        >
          {habits && habits?.possibleHabits.length > 0 ? (
            habits?.possibleHabits.map((habit) => {
              const isChecked = habits.completedHabits.includes(habit.id);
              return (
                <CheckBox
                  key={habit.id}
                  title={habit.title}
                  checked={isChecked}
                  disabled={isDateInPast}
                  onPress={() => handleToggleHabit(habit.id)}
                />
              );
            })
          ) : (
            <HabitsEmpty />
          )}
        </View>

        {isDateInPast && (
          <Text className="text-white mt-10 text-center">
            Você não pode editar hábitos de uma data passada.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
