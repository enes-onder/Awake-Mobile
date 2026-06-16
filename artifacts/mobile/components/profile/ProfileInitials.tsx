import React from "react";
import { Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface ProfileInitialsProps {
  name: string;
  size: number;
}

export function ProfileInitials({ name, size }: ProfileInitialsProps) {
  const colors = useColors();
  const parts = name.trim().split(" ").filter(Boolean);
  const letters =
    parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : (parts[0]?.[0] ?? "A").toUpperCase();

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.primary + "22",
        borderWidth: 2.5,
        borderColor: colors.primary + "55",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: size * 0.36,
          color: colors.primary,
          letterSpacing: 1,
        }}
      >
        {letters}
      </Text>
    </View>
  );
}
