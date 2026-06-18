import { Feather } from "@expo/vector-icons";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/useColors";

import { styles } from "./styles";

export function AnonBanner() {
  const colors = useColors();

  const handlePress = () => {
    Alert.alert(
      "Misafir Hesabı",
      "İlerlemeniz şu an yalnızca bu cihazda kayıtlı. Uygulama silinirse veya cihaz değiştirilirse verileriniz kaybolur.\n\nGoogle ve Apple ile giriş özelliği yakında geliyor!",
      [{ text: "Anladım", style: "default" }]
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.anonBanner,
        { backgroundColor: colors.warning + "14", borderColor: colors.warning + "44" },
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={[styles.anonIconBox, { backgroundColor: colors.warning + "22" }]}>
        <Feather name="alert-triangle" size={18} color={colors.warning} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.anonTitle, { color: colors.foreground }]}>
          İlerlemeniz Kaydedilmiyor
        </Text>
        <Text style={[styles.anonSub, { color: colors.mutedForeground }]}>
          Misafir modundasınız — veriler yalnızca bu cihazda. Üye olmak için dokun.
        </Text>
      </View>
      <Feather name="chevron-right" size={16} color={colors.warning} />
    </TouchableOpacity>
  );
}
