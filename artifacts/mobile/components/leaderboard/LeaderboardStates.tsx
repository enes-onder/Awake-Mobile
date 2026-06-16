import { Feather } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { styles } from "./leaderboardStyles";

interface LoadingStateProps { }
interface ErrorStateProps { message: string; onRetry: () => void; }
interface EmptyStateProps { }

export function LoadingState(_: LoadingStateProps) {
  const colors = useColors();
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Yükleniyor…</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const colors = useColors();
  return (
    <View style={styles.center}>
      <Feather name="wifi-off" size={40} color={colors.mutedForeground} />
      <Text style={[styles.errorText, { color: colors.mutedForeground }]}>{message}</Text>
      <TouchableOpacity
        onPress={onRetry}
        style={[styles.retryBtn, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.retryBtnText}>Tekrar Dene</Text>
      </TouchableOpacity>
    </View>
  );
}

export function EmptyState(_: EmptyStateProps) {
  const colors = useColors();
  return (
    <View style={styles.center}>
      <Feather name="users" size={40} color={colors.mutedForeground} />
      <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
        Henüz sıralamada kimse yok.{"\n"}Oynayarak ilk sen gir!
      </Text>
    </View>
  );
}
