import {
  TouchableOpacity,
  View,
  Text,
  TouchableOpacityProps,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

interface CheckBoxProps extends TouchableOpacityProps {
  checked?: boolean;
  title: string;
}

export function CheckBox({ checked = false, title, ...rest }: CheckBoxProps) {
  return (
    <TouchableOpacity
      className="flex-row mb-2 items-center"
      activeOpacity={0.7}
      {...rest}
    >
      {checked ? (
        <Animated.View className="h-8 w-8 bg-green-500 rounded-lg items-center justify-center">
          <Feather name="check" size={20} color={colors.white} />
        </Animated.View>
      ) : (
        <View className="h-8 w-8 bg-zinc-900 rounded-lg"></View>
      )}

      <Text className="text-white font-semibold text-base ml-3">{title}</Text>
    </TouchableOpacity>
  );
}
