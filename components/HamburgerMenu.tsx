import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../src/constants/theme";
import { useColorScheme } from "../src/hooks/use-color-scheme";

interface HamburgerMenuProps {
  onUpdateData: () => void;
  onShowStatistics: () => void;
  onShowSettings: () => void;
  onShowAbout: () => void;
}

export default function HamburgerMenu({
  onUpdateData,
  onShowStatistics,
  onShowSettings,
  onShowAbout,
}: HamburgerMenuProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-300));
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const showMenu = () => {
    setIsVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
    });
  };

  const handleMenuOption = (callback: () => void) => {
    hideMenu();
    // Pequeño delay para que la animación termine antes de ejecutar la acción
    setTimeout(callback, 350);
  };

  const menuOptions = [
    {
      icon: "refresh-outline",
      title: "Actualizar datos",
      onPress: () => handleMenuOption(onUpdateData),
    },
    {
      icon: "stats-chart-outline",
      title: "Estadísticas",
      onPress: () => handleMenuOption(onShowStatistics),
    },
    {
      icon: "settings-outline",
      title: "Configuración",
      onPress: () => handleMenuOption(onShowSettings),
    },
    {
      icon: "information-circle-outline",
      title: "Acerca de",
      onPress: () => handleMenuOption(onShowAbout),
    },
  ];

  return (
    <>
      <TouchableOpacity
        style={styles.hamburgerButton}
        onPress={showMenu}
        accessibilityLabel="Abrir menú"
      >
        <Ionicons name="menu" size={28} color={colors.text} />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={hideMenu}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={hideMenu}
        >
          <Animated.View
            style={[
              styles.menuContainer,
              {
                backgroundColor: colors.background,
                borderColor: colors.tabIconDefault,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={styles.menuHeader}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>
                Verbix
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={hideMenu}
                accessibilityLabel="Cerrar menú"
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.menuOptions}>
              {menuOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.menuOption,
                    { borderBottomColor: colors.tabIconDefault },
                  ]}
                  onPress={option.onPress}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={24}
                    color={colors.text}
                    style={styles.menuOptionIcon}
                  />
                  <Text style={[styles.menuOptionText, { color: colors.text }]}>
                    {option.title}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.tabIconDefault}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.menuFooter}>
              <Text
                style={[styles.versionText, { color: colors.tabIconDefault }]}
              >
                Versión 1.0.0
              </Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  hamburgerButton: {
    padding: 8,
    borderRadius: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
  },
  menuContainer: {
    width: width * 0.75,
    maxWidth: 300,
    height: "100%",
    borderRightWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginTop: 40, // Para el status bar
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  menuOptions: {
    flex: 1,
    paddingTop: 20,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  menuOptionIcon: {
    marginRight: 16,
  },
  menuOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  menuFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    alignItems: "center",
  },
  versionText: {
    fontSize: 14,
    fontStyle: "italic",
  },
});
