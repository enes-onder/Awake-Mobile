import React from "react";
import { Text } from "react-native";

import { useColors } from "@/hooks/useColors";
import { styles } from "./styles";

interface SectionHeaderProps {
  label: string;
}

export function SectionHeader({ label }: SectionHeaderProps) {
  const colors = useColors();
  return (
    <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
      {label}
    </Text>
  );
}
