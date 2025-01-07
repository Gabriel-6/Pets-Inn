import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native"; 
import Icon from "react-native-vector-icons/FontAwesome";
import BottomIcons from "../../componentes/BottomIcons";
import {
  requestForegroundPermissionsAsync,
  getCurrentPositionAsync,
} from "expo-location";
import CONFIG from "../../utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Home() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [empresas, setEmpresas] = useState([]);
  const [location, setLocation] = useState(null);
  const [search, setSearch] = useState("");
  const [activeScreen, setActiveScreen] = useState("Home");

  useEffect(() => {
    const getActiveIcon = async () => {
      const savedIcon = await AsyncStorage.getItem("activeIcon");
      if (savedIcon) {
        setActiveScreen(savedIcon);
      }
    };

    getActiveIcon();
  }, [isFocused]);

  const handleIconPress = (iconName) => {
    setActiveScreen(iconName);
    AsyncStorage.setItem("activeIcon", iconName);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (location) {
          const { latitude, longitude } = location;
          if (latitude && longitude) {
            const response = await fetch(
              `${CONFIG.API_BASE_URL}/company-list?latitude=${latitude}&longitude=${longitude}`
            );
            if (!response.ok) {
              throw new Error("Erro ao buscar empresas");
            }
            const data = await response.json();
            setEmpresas(data);
          }
        } else {
          const response = await fetch(`${CONFIG.API_BASE_URL}/company-list`);
          if (!response.ok) {
            throw new Error("Erro ao buscar empresas");
          }
          const data = await response.json();
          setEmpresas(data);
        }
      } catch (error) {
        console.error("Erro ao buscar empresas:", error);
      }
    };

    fetchData();
  }, [location, isFocused]);

  useEffect(() => {
    const getPosition = async () => {
      const { granted } = await requestForegroundPermissionsAsync();
      if (granted) {
        const currentPosition = await getCurrentPositionAsync();
        setLocation(currentPosition.coords);
      }
    };

    getPosition();
  }, []);

  const handleSearch = (text) => {
    setSearch(text.toLowerCase());
  };

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/logo.jpeg")} style={styles.header} />

      <View style={styles.imageMargin} />

      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar..."
          onChangeText={handleSearch}
          placeholderTextColor="#888"
        />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.content}>
          {empresas.map((empresa) => {
            const { id, nome, cidade, estado, logo } = empresa;
            const empresaNomeLowerCase = nome.toLowerCase();
            const cidadeLowerCase = cidade.toLowerCase();

            if (
              empresaNomeLowerCase.includes(search) ||
              cidadeLowerCase.includes(search)
            ) {
              return (
                <TouchableOpacity
                  key={id}
                  style={styles.card}
                  onPress={() =>
                    navigation.navigate("Enterprise", { empresaId: id })
                  }
                >
                  <View style={styles.cardContent}>
                    <Image source={{ uri: logo }} style={styles.imageCard} />
                    <Text style={styles.text}>{`${cidade}, ${estado}`}</Text>
                    <Text style={styles.text}>{nome}</Text>
                  </View>
                </TouchableOpacity>
              );
            }
            return null;
          })}
        </View>
      </ScrollView>

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
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    height: 10,
    width: 10,
  },
  header: {
    width: 90,
    height: 130,
  },
  imageMargin: {
    height: 2,
    marginTop: "1%",
    backgroundColor: "#C5C5BC",
    width: "45%",
  },
  searchBarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: "100%",
  },
  searchInput: {
    height: 40,
    marginTop: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#C5C5BC",
    fontSize: 16,
  },
  contentContainer: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
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
  },
  iconContainer: {
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    width: "85%",
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
  },
});