import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { styles } from "./swipeCardStyles";

interface CluesAreaProps {
  clues: string[];
  clueIndex: number;
  fs: (base: number) => number;
}

export function CluesArea({ clues, clueIndex, fs }: CluesAreaProps) {
  const colors = useColors();

  if (clueIndex === 0) return null;

  return (
    <View style={[styles.cluesArea, { borderTopColor: colors.border }]}>
      {clues.slice(0, clueIndex).map((clue, i) => (
        <View key={i} style={[styles.clue, { backgroundColor: colors.primary + "12" }]}>
          <Feather name="info" size={12} color={colors.primary} />
          <Text style={[styles.clueText, { color: colors.foreground, fontSize: fs(13) }]}>
            {clue}
          </Text>
        </View>
      ))}
    </View>
  );
}
