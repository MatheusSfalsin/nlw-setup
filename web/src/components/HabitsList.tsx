import * as Checkbox from "@radix-ui/react-checkbox";
import dayjs from "dayjs";
import { Check } from "phosphor-react";
import React, { useEffect, useState } from "react";
import { api } from "../lib/axios";

interface HabitsListProps {
  date: Date;
  onCompletedChange: (completed: number) => void;
}

type HabitsProps = {
  possibleHabits: { id: string; title: string; created_at: string }[];
  completedHabits: string[];
};

export function HabitsList({ date, onCompletedChange }: HabitsListProps) {
  const [habits, setHabits] = useState<HabitsProps>();

  useEffect(() => {
    async function getHabitList() {
      const response = await api.get("day", {
        params: {
          date: date.toISOString(),
        },
      });
      const habits = response.data;
      setHabits(habits);
    }

    getHabitList();
  }, []);

  async function handleToggleHabit(habitId: string) {
    const isHabitAlreadyCompleted = habits!.completedHabits.includes(habitId);
    const response = await api.patch(`/habits/${habitId}/toggle`);

    let completedHabits: string[] = [];
    if (isHabitAlreadyCompleted) {
      completedHabits = habits!.completedHabits.filter((id) => id !== habitId);
    } else {
      completedHabits = [...habits!.completedHabits, habitId];
    }

    setHabits({
      completedHabits,
      possibleHabits: habits!.possibleHabits,
    });

    onCompletedChange(completedHabits.length);
  }

  const isDateInPast = dayjs(date).endOf("day").isBefore(new Date());

  return (
    <>
      <div className="mt-6 flex flex-col gap-3">
        {habits?.possibleHabits.map((habit) => {
          return (
            <Checkbox.Root
              key={habit.id}
              onCheckedChange={() => handleToggleHabit(habit.id)}
              checked={habits.completedHabits.includes(habit.id)}
              disabled={isDateInPast}
              className="flex gap-3 group focus:outline-none disabled:cursor-not-allowed"
            >
              <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-zinc-900 border-2 border-zinc-800 group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500 transition-colors group-focus:outline-none group-focus:ring-2 group-focus:ring-violet-700 group-focus:ring-offset-2 group-focus:ring-offset-background">
                <Checkbox.Indicator>
                  <Check size={20} className="text-white" />
                </Checkbox.Indicator>
              </div>
              <span className="font-semibold text-xl text-white leading-tight group-data-[state=checked]:line-through group-data-[state=checked]:text-zinc-400">
                {habit.title}
              </span>
            </Checkbox.Root>
          );
        })}
      </div>
    </>
  );
}
