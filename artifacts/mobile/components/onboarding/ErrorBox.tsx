import React from "react";
import { Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

import { styles } from "./styles";

interface ErrorBoxProps {
  error: string | null;
}

export function ErrorBox({ error }: ErrorBoxProps) {
  const colors = useColors();

  if (!error) return null;

  const isSuccess = error.startsWith("✅");

  return (
    <View
      style={[
        styles.errorBox,
        {
          backgroundColor: isSuccess ? colors.success + "18" : colors.fake + "18",
          borderColor: isSuccess ? colors.success + "44" : colors.fake + "44",
        },
      ]}
    >
      <Text
        style={[
          styles.errorText,
          { color: isSuccess ? colors.success : colors.fake },
        ]}
      >
        {error}
      </Text>
    </View>
  );
}
