import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { SectionHeader } from "./SectionHeader";
import { styles } from "./styles";

export const TOPICS = [
  { id: "politics", label: "Siyaset", icon: "flag" },
  { id: "health", label: "Sağlık", icon: "heart" },
  { id: "science", label: "Bilim", icon: "cpu" },
  { id: "economy", label: "Ekonomi", icon: "trending-up" },
  { id: "social", label: "Sosyal Medya", icon: "share-2" },
  { id: "environment", label: "Çevre", icon: "wind" },
  { id: "tech", label: "Teknoloji", icon: "monitor" },
  { id: "general", label: "Genel", icon: "globe" },
] as const;

interface TopicsPickerProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function TopicsPicker({ selected, onSelect }: TopicsPickerProps) {
  const colors = useColors();

  return (
    <Animated.View entering={FadeInDown.delay(200).springify()} style={{ gap: 10, marginTop: 12 }}>
      <SectionHeader label="FAVORİ KONU" />

      <View style={styles.topicsGrid}>
        {TOPICS.map((t) => {
          const isSelected = selected === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.topicChip,
                {
                  backgroundColor: isSelected ? colors.primary + "1A" : colors.secondary,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => onSelect(isSelected ? "" : t.id)}
              activeOpacity={0.7}
            >
              <Feather
                name={t.icon as any}
                size={14}
                color={isSelected ? colors.primary : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.topicLabel,
                  { color: isSelected ? colors.primary : colors.foreground },
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}
