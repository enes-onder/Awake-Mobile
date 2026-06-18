/**
 * leaderboard.tsx — Liderlik tablosu ekranı.
 *
 * XP'ye göre sıralı tüm oyuncuları gösterir.
 * Gerçek API verileri ile mock dedektif verileri birleştirilir (useLeaderboard hook'u).
 *
 * Bileşen yapısı:
 *  - Üst çubuk: geri butonu + ekran başlığı + kullanıcının sıralaması
 *  - PodiumCard: ilk 3 oyuncuyu podium görünümünde gösterir
 *  - FlatList: tüm sıralama satırları (LeaderRow)
 *  - Yükleniyor/Hata/Boş durumlar ayrı bileşenlerle yönetilir
 */

import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Platform, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useUser } from "@/context/UserContext";
import { useResponsive } from "@/hooks/useResponsive";

import { useLeaderboard } from "@/hooks/useLeaderboard";
import { LeaderRow } from "@/components/leaderboard/LeaderRow";
import { PodiumCard } from "@/components/leaderboard/PodiumCard";
import { LoadingState, ErrorState, EmptyState } from "@/components/leaderboard/LeaderboardStates";
import { styles } from "@/components/leaderboard/leaderboardStyles";

export default function LeaderboardScreen() {
  const colors = useColors();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { username } = useUser();
  const { entries, loading, error, retry } = useLeaderboard();

  const topPadding = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  /** Kullanıcının listede bulunduğu pozisyon (bulunamazsa 0) */
  const myPosition = entries.findIndex((e) => e.username === username) + 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Üst çubuk */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPadding + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Liderlik Tablosu</Text>
          {/** Kullanıcı listede bulunuyorsa sıralamasını göster */}
          {myPosition > 0 && (
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              Sıralaman: #{myPosition}
            </Text>
          )}
        </View>
        {/** Başlığı ortalamak için sağ boşluk */}
        <View style={{ width: 38 }} />
      </View>

      {/* İçerik: yükleniyor / hata / boş / liste */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : entries.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: r.hp,
            paddingTop: 12,
            paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 90,
            gap: 8,
            maxWidth: r.maxW,
            alignSelf: "center" as const,
            width: "100%",
          }}
          renderItem={({ item, index }) => (
            <LeaderRow
              entry={item}
              position={index + 1}
              /** Kullanıcının kendi satırını vurgulamak için */
              isMe={item.username === username}
              index={index}
            />
          )}
          /** İlk 3 oyuncu için podium görünümü */
          ListHeaderComponent={entries.length > 0 ? <PodiumCard entries={entries} /> : null}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
