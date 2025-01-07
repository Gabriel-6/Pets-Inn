import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomIcons from "../../componentes/BottomIcons";
import CONFIG from "../../utils/config";

export default function Favoritos() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [empresasFavoritas, setEmpresasFavoritas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeScreen, setActiveScreen] = useState("Favoritos");

  useEffect(() => {
    const getActiveIcon = async () => {
      const savedIcon = await AsyncStorage.getItem("activeIcon");
      if (savedIcon) {
        setActiveScreen(savedIcon);
      }
    };

    getActiveIcon();
  }, [isFocused]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const favoriteKeys = keys.filter((key) => key.startsWith("favorite_"));

        const favoritePromises = favoriteKeys.map(async (key) => {
          const empresaId = key.replace("favorite_", "");
          const response = await fetch(
            `${CONFIG.API_BASE_URL}/getEnterprise/${empresaId}`
          );
          if (!response.ok) {
            throw new Error(`Erro ao buscar empresa com ID ${empresaId}`);
          }
          const data = await response.json();
          return data[0];
        });

        const empresas = await Promise.all(favoritePromises);
        setEmpresasFavoritas(empresas);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar favoritos:", error);
        setLoading(false);
      }
    };

    loadFavorites();
  }, [isFocused]);

  const handleIconPress = (iconName) => {
    setActiveScreen(iconName);

    switch (iconName) {
      case "search":
        navigation.navigate("Home");
        break;
      case "heart":
        navigation.navigate("Favoritos");
        break;
      case "calendar":
        navigation.navigate("Agendamentos");
        break;
      case "envelope":
        navigation.navigate("Mensagens");
        break;
      case "user":
        navigation.navigate("Perfil");
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favoritos</Text>
      {loading ? (
        <ActivityIndicator
          style={styles.loading}
          size="large"
          color="#007BFF"
        />
      ) : empresasFavoritas.length === 0 ? (
        <View style={styles.centeredContent}>
          <View style={styles.message}>
            <Text style={styles.subtitle}>
              Crie sua primeira lista de favoritos
            </Text>
            <Text style={styles.descricao}>
              Ao buscar, toque no ícone do coração para salvar os
              estabelecimentos e experiências que você mais gosta nos favoritos.
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.content}>
            {empresasFavoritas.map((empresa) => (
              <TouchableOpacity
                key={empresa.id}
                style={styles.card}
                onPress={() =>
                  navigation.navigate("Enterprise", { empresaId: empresa.id })
                }
              >
                <View key={empresa.id} style={styles.card}>
                  <Image
                    source={{ uri: empresa.logo }}
                    style={styles.imageCard}
                  />
                  <Text style={styles.text}>
                    {empresa.cidade}, {empresa.estado}
                  </Text>
                  <Text style={styles.text}>{empresa.nome}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
      <View style={styles.bottomIcons}>
        <BottomIcons onPress={handleIconPress} activeScreen={activeScreen} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fcfcf2",
    justifyContent: "flex-start",
    paddingTop: 40,
  },
  title: {
    fontSize: 30,
    marginTop: 10,
    marginLeft: "10%",
  },
  centeredContent: {
    alignItems: "center",
    marginTop: "auto",
    marginBottom: "auto",
  },
  message: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  descricao: {
    textAlign: "center",
    color: "#888",
  },
  loading: {
    marginTop: 50,
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: "center",
  },
  content: {
    padding: 20,
    width: "100%",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    width: "90%",
    maxWidth: 410,
    alignSelf: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  imageCard: {
    width: "100%",
    height: 160,
    marginBottom: 12,
    borderRadius: 8,
  },
  bottomIcons: {
    borderWidth: 1,
    borderColor: "#C5C5BC",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fcfcf2",
    paddingVertical: 10,
    width: "100%",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
