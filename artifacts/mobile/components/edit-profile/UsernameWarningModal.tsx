import { Feather } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { styles } from "./styles";

interface UsernameWarningModalProps {
  visible: boolean;
  daysLeft: number;
  onClose: () => void;
}

export function UsernameWarningModal({ visible, daysLeft, onClose }: UsernameWarningModalProps) {
  const colors = useColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Animated.View
          entering={FadeInUp.springify()}
          style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={[styles.modalIcon, { backgroundColor: colors.warning + "18" }]}>
            <Feather name="clock" size={26} color={colors.warning} />
          </View>

          <Text style={[styles.modalTitle, { color: colors.foreground }]}>
            Değişiklik Sınırı
          </Text>

          <Text style={[styles.modalBody, { color: colors.mutedForeground }]}>
            Kod adını ayda yalnızca{" "}
            <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold" }}>1 kez</Text>{" "}
            değiştirebilirsin.{"\n\n"}Tekrar değiştirebilmek için{" "}
            <Text style={{ color: colors.warning, fontFamily: "Inter_700Bold" }}>
              {daysLeft} gün
            </Text>{" "}
            beklemelisin.
          </Text>

          <TouchableOpacity
            style={[styles.modalBtn, { backgroundColor: colors.primary }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.modalBtnText}>Tamam, anladım</Text>
          </TouchableOpacity>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
