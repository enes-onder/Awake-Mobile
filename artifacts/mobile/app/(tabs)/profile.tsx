/**
 * (tabs)/profile.tsx — Profil ekranı.
 *
 * Kullanıcının oyun geçmişini, rütbe ilerlemesini ve rozetlerini gösterir.
 * Tüm veri useProfile hook'u aracılığıyla UserContext'ten gelir.
 *
 * Bileşen yapısı (yukarıdan aşağıya):
 *  1. ProfileHeader  — başlık + profili düzenle butonu
 *  2. HeroCard       — kullanıcı adı, bio, rütbe, XP ilerleme çubuğu, streak
 *  3. AnonBanner     — misafir kullanıcılar için hesap oluşturma çağrısı
 *  4. StatsGrid      — 4'lü istatistik kartları (vaka, doğruluk, XP, rozet)
 *  5. Leaderboard butonu — liderlik tablosuna yönlendirir
 *  6. RankPath       — tüm rütbeleri gösteren ilerleme yolu
 *  7. CertCard       — XP sertifikası
 *  8. SignOutButton  — çıkış butonu
 */

import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { RANKS } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";
import { useProfile } from "@/hooks/useProfile";
import { useResponsive } from "@/hooks/useResponsive";

import { AnonBanner } from "@/components/profile/AnonBanner";
import { CertCard } from "@/components/profile/CertCard";
import { HeroCard } from "@/components/profile/HeroCard";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { RankPath } from "@/components/profile/RankPath";
import { SignOutButton } from "@/components/profile/SignOutButton";
import { StatsGrid } from "@/components/profile/StatsGrid";
import { styles } from "@/components/profile/styles";

export default function ProfileScreen() {
  const colors = useColors();
  const r = useResponsive();
  const router = useRouter();
  const { topPadding, rankIdx, statItems, user } = useProfile();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPadding + 16,
        paddingBottom: Platform.OS === "web" ? 100 : 90,
        paddingHorizontal: r.hp,
        gap: 16,
        maxWidth: r.maxW,
        alignSelf: "center" as const,
        width: "100%",
      }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.delay(0).springify()}>
        <ProfileHeader onEditPress={() => router.push("/edit-profile")} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60).springify()}>
        <HeroCard
          username={user.username}
          bio={user.bio}
          favoriteTopic={user.favoriteTopic}
          rank={user.rank}
          nextRank={user.nextRank}
          xp={user.xp}
          xpProgress={user.xpProgress}
          streak={user.streak}
        />
      </Animated.View>

      {/* Misafir kullanıcılara hesap oluşturma önerisi */}
      {user.isAnonymous && (
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <AnonBanner />
        </Animated.View>
      )}

      <StatsGrid items={statItems} startDelay={120} />

      {/* Liderlik tablosuna geçiş kartı */}
      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <TouchableOpacity
          style={[leaderboardStyles.card, { backgroundColor: colors.card, borderColor: "#FFD700" + "44" }]}
          onPress={() => router.push("/leaderboard")}
          activeOpacity={0.82}
        >
          <View style={[leaderboardStyles.iconBox, { backgroundColor: "#FFD700" + "18" }]}>
            <Text style={leaderboardStyles.trophy}>🏆</Text>
          </View>
          <View style={leaderboardStyles.textBlock}>
            <Text style={[leaderboardStyles.title, { color: colors.foreground }]}>Liderlik Tablosu</Text>
            <Text style={[leaderboardStyles.sub, { color: colors.mutedForeground }]}>
              Tüm oyuncular arasındaki sıralamana bak
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
      </Animated.View>

      {/* Tüm rütbe aşamalarını gösteren yol haritası */}
      <RankPath ranks={RANKS} userXp={user.xp} rankIdx={rankIdx} delay={260} />

      <CertCard xp={user.xp} delay={320} />

      <SignOutButton onSignOut={user.signOut} delay={380} />
    </ScrollView>
  );
}

/** Liderlik tablosu kart stili — sadece bu ekranda kullanıldığı için yerel tutulur */
const leaderboardStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  trophy: { fontSize: 24 },
  textBlock: { flex: 1, gap: 3 },
  title: { fontFamily: "Inter_700Bold", fontSize: 15 },
  sub: { fontFamily: "Inter_400Regular", fontSize: 12 },
});
