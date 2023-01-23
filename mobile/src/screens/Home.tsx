import { Text, View, ScrollView, Alert } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import HabitDay, { DAY_SIZE } from "../components/HabitDays";
import { Header } from "../components/Header";
import { api } from "../lib/axios";
import { generateDatesFromYearBeginning } from "../utils/generate-dates-from-year-beginning";
import { useCallback, useState } from "react";
import { Loading } from "../components/Loading";
import dayjs from "dayjs";

const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

const datesFromYearStart = generateDatesFromYearBeginning();

const mimSummaryDatesSizes = 18 * 5; // 18 weeks
const amountOfDaysToFill = mimSummaryDatesSizes - datesFromYearStart.length;

type Summary = Array<{
  id: string;
  date: string;
  amount: number;
  completed: number;
}>;

export function Home() {
  const { navigate } = useNavigation();
  const [summary, setSummary] = useState<Summary>([]);
  const [loading, setLoading] = useState(true);

  async function getData() {
    try {
      setLoading(true);

      const response = await api.get("summary");

      const summary = response.data;

      setSummary(summary);
    } catch (error) {
      console.log(error);
      Alert.alert("Ops...", "Não foi possível carregar seus Hábitos.");
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      getData();
    }, [])
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <Header />

      <View className="flex-row mt-6 mb-2">
        {weekDays.map((weekDay, i) => {
          return (
            <Text
              className="text-zinc-400 text-xl font-bold text-center mx-1"
              key={`${weekDay}-${i}`}
              style={{ width: DAY_SIZE }}
            >
              {weekDay}
            </Text>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {summary && (
          <View className="flex-row flex-wrap">
            {datesFromYearStart.map((date) => {
              const dayInSummary = summary.find((day) => {
                return dayjs(date).isSame(day.date, "day");
              });

              return (
                <HabitDay
                  key={date.toISOString()}
                  date={date}
                  amountCompleted={dayInSummary?.completed}
                  amountOfHabits={dayInSummary?.amount}
                  onPress={() => {
                    navigate("habit", { date: date.toISOString() });
                  }}
                />
              );
            })}

            {amountOfDaysToFill > 0 &&
              Array.from({ length: amountOfDaysToFill }).map((_, i) => {
                return (
                  <View
                    key={i}
                    className="bg-zinc-900 rounded-lg border-2 m-1 border-zinc-800 opacity-40"
                    style={{
                      width: DAY_SIZE,
                      height: DAY_SIZE,
                    }}
                  />
                );
              })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
