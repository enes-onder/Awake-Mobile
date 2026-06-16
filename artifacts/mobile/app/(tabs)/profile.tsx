import { useRouter } from "expo-router";
import React from "react";
import { Platform, ScrollView } from "react-native";
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

      {user.isAnonymous && (
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <AnonBanner onPress={() => router.push("/onboarding")} />
        </Animated.View>
      )}

      <StatsGrid items={statItems} startDelay={120} />

      <RankPath ranks={RANKS} userXp={user.xp} rankIdx={rankIdx} delay={260} />

      <CertCard xp={user.xp} delay={320} />

      <SignOutButton onSignOut={user.signOut} delay={380} />
    </ScrollView>
  );
}
