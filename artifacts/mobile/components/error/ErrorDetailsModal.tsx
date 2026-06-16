import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { errorStyles } from "./errorFallbackStyles";

interface ErrorDetailsModalProps {
  visible: boolean;
  error: Error;
  onClose: () => void;
}

export function ErrorDetailsModal({ visible, error, onClose }: ErrorDetailsModalProps) {
  const colors = useColors();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={errorStyles.modalOverlay}>
        <View style={[errorStyles.modalSheet, { backgroundColor: colors.card }]}>
          <Text style={[errorStyles.modalTitle, { color: colors.foreground }]}>
            Hata Detayları (DEV)
          </Text>

          <View style={[errorStyles.errorNameBox, { backgroundColor: colors.fake + "18" }]}>
            <Text style={[errorStyles.errorName, { color: colors.fake }]}>{error.name}</Text>
            <Text style={[errorStyles.errorMessage, { color: colors.foreground }]}>
              {error.message}
            </Text>
          </View>

          {error.stack && (
            <ScrollView
              style={[errorStyles.stackBox, { backgroundColor: colors.secondary }]}
              nestedScrollEnabled
            >
              <Text style={[errorStyles.stackText, { color: colors.mutedForeground }]}>
                {error.stack}
              </Text>
            </ScrollView>
          )}

          <TouchableOpacity
            onPress={onClose}
            style={[errorStyles.closeModalBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={errorStyles.closeModalBtnText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
