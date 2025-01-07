import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Button,
} from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import BottomIcons from "../../componentes/BottomIcons";
import Icon from "react-native-vector-icons/FontAwesome";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Perfil() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [activeScreen, setActiveScreen] = useState("search");
  const isFocused = useIsFocused();

  const navigation = useNavigation();
  const [activeIcon, setActiveIcon] = useState("user");

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("Authorization");
        console.log(token);
        if (token) {
          setIsLoggedIn(true);
          const userTypeStored = await AsyncStorage.getItem("UserType");
          setUserType(userTypeStored);
          navigateBasedOnUserType(userTypeStored);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Erro ao verificar token:", error);
      }
    };

    checkToken();
  }, [isFocused]);

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync("Authorization");
      await SecureStore.deleteItemAsync("UserType");
      setIsLoggedIn(false);
      setUserType(null);
    } catch (error) {}
  };

  const handleLogin = async () => {
    try {
      navigation.navigate("SignIn");
    } catch (error) {}
  };

  const navigateBasedOnUserType = (type) => {
    if (type === "usuario") {
      navigation.navigate("PerfilCliente");
    } else if (type === "empresa") {
      navigation.navigate("PerfilEstabelecimento");
    }
  };

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
      <View style={styles.header}></View>

      {isLoggedIn ? (
        <TouchableOpacity onPress={handleLogout}>
          <View style={styles.section}>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>Sair</Text>
              <Icon name="chevron-right" size={20} color="#333" />
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.buttonEntrar} onPress={handleLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.content}></View>
      </ScrollView>

      <View style={styles.bottomIcons}>
        <BottomIcons activeIcon={activeIcon} onPress={handleIconPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fcfcf2",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 50,
  },
  title: {
    fontSize: 30,
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
  buttonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 200,
  },
  buttonEntrar: {
    backgroundColor: "#11021E",
    width: "80%",
    borderRadius: 4,
    paddingVertical: 12,
    marginTop: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 20,
  },
  sectionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
  },
});
