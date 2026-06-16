import { Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewToken,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_W } = Dimensions.get("window");

interface Slide {
  id: string;
  icon: string;
  accentColor: string;
  tag: string;
  title: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    id: "s1",
    icon: "shield",
    accentColor: "#2B7FFF",
    tag: "Misyon Başlıyor",
    title: "Dezenformasyona\nKarşı Dur",
    description:
      "Her gün milyonlarca sahte haber yayılıyor. Sahte fotoğraflar, uydurma alıntılar, manipüle istatistikler — artık sen onları göreceksin.",
  },
  {
    id: "s2",
    icon: "search",
    accentColor: "#00C851",
    tag: "Gerçek Teknikler",
    title: "Siber Dedektif\nOl",
    description:
      "Tersine görsel arama, EXIF metadata analizi, kaynak doğrulama — gazetecilerin ve istihbarat analistlerinin kullandığı yöntemleri öğren.",
  },
  {
    id: "s3",
    icon: "zap",
    accentColor: "#00D4FF",
    tag: "Sıralamaya Gir",
    title: "Seri Kur,\nRütbe Kazan",
    description:
      "Her gün oyna, XP kazan, liderlik tablosuna gir. Çaylak'tan Baş Dedektif'e yüksel. Gerçeği bul, rozet al.",
  },
];

interface IntroSlidesProps {
  onFinish: () => void;
}

export function IntroSlides({ onFinish }: IntroSlidesProps) {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Math.max(insets.bottom, 20);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      onFinish();
    }
  };

  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <View style={styles.root}>
      {/* Background grid lines decoration */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {[...Array(8)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.gridLine,
              { top: (SCREEN_W * i) / 4, opacity: 0.04 },
            ]}
          />
        ))}
      </View>

      {/* Skip button */}
      <Animated.View
        entering={FadeInDown.delay(200).springify()}
        style={[styles.skipRow, { paddingTop: topPad + 14 }]}
      >
        <TouchableOpacity onPress={onFinish} activeOpacity={0.7} style={styles.skipBtn}>
          <Text style={styles.skipText}>Atla</Text>
          <Feather name="chevron-right" size={14} color="#5C6B82" />
        </TouchableOpacity>
      </Animated.View>

      {/* Slides */}
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item }) => <SlideItem slide={item} />}
        style={{ flex: 1 }}
      />

      {/* Dots + CTA */}
      <Animated.View
        entering={FadeInUp.delay(300).springify()}
        style={[styles.footer, { paddingBottom: botPad + 16 }]}
      >
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex
                  ? { width: 22, backgroundColor: SLIDES[activeIndex].accentColor }
                  : { width: 7, backgroundColor: "#1B2A42" },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.88}
          style={[
            styles.ctaBtn,
            { backgroundColor: SLIDES[activeIndex].accentColor },
          ]}
        >
          <Feather
            name={isLast ? "shield" : "arrow-right"}
            size={20}
            color="#fff"
          />
          <Text style={styles.ctaText}>
            {isLast ? "Göreve Başla" : "Devam Et"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function SlideItem({ slide }: { slide: Slide }) {
  return (
    <View style={[styles.slide, { width: SCREEN_W }]}>
      <View style={styles.slideInner}>
        {/* Icon badge */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={[styles.iconWrap, { borderColor: slide.accentColor + "44" }]}
        >
          <View
            style={[styles.iconCircle, { backgroundColor: slide.accentColor + "1A" }]}
          >
            <Feather name={slide.icon as any} size={56} color={slide.accentColor} />
          </View>
          {/* Outer glow rings */}
          <View
            style={[
              styles.glowRing,
              { borderColor: slide.accentColor + "22", width: 160, height: 160, borderRadius: 80 },
            ]}
          />
          <View
            style={[
              styles.glowRing,
              { borderColor: slide.accentColor + "12", width: 210, height: 210, borderRadius: 105 },
            ]}
          />
        </Animated.View>

        {/* Tag */}
        <Animated.View
          entering={FadeInDown.delay(160).springify()}
          style={[styles.tagPill, { backgroundColor: slide.accentColor + "1A", borderColor: slide.accentColor + "44" }]}
        >
          <Text style={[styles.tagText, { color: slide.accentColor }]}>{slide.tag}</Text>
        </Animated.View>

        {/* Title */}
        <Animated.Text
          entering={FadeInDown.delay(220).springify()}
          style={styles.title}
        >
          {slide.title}
        </Animated.Text>

        {/* Description */}
        <Animated.Text
          entering={FadeInDown.delay(280).springify()}
          style={styles.desc}
        >
          {slide.description}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#070B14",
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#2B7FFF",
  },
  skipRow: {
    paddingHorizontal: 20,
    alignItems: "flex-end",
  },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  skipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#5C6B82",
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  slideInner: {
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 20,
    maxWidth: 420,
    width: "100%",
  },
  iconWrap: {
    width: 130,
    height: 130,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 65,
    borderWidth: 1,
    marginBottom: 8,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  glowRing: {
    position: "absolute",
    borderWidth: 1,
  },
  tagPill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  tagText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    color: "#E8EDF5",
    textAlign: "center",
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  desc: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#5C6B82",
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    gap: 20,
    alignItems: "center",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 18,
    width: "100%",
    maxWidth: 380,
  },
  ctaText: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: "#fff",
  },
});
