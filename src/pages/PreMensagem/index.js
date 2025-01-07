import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  FlatList,
  SafeAreaView,
} from "react-native";
import CONFIG from "../../utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import BottomIcons from "../../componentes/BottomIcons";

const PreMensagem = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [activeScreen, setActiveScreen] = useState("Favoritos");
  const [isCompany, setIsCompany] = useState(false);

  useEffect(() => {
    const checkUserType = async () => {
      const userType = await AsyncStorage.getItem("UserType");
      setIsCompany(userType === "empresa");
    };
    checkUserType();
  }, [isFocused]);

  useEffect(() => {
    const getActiveIcon = async () => {
      const savedIcon = await AsyncStorage.getItem("activeIcon");
      if (savedIcon) {
        setActiveScreen(savedIcon);
      }
    };

    getActiveIcon();
  }, [isFocused]);

  const handleIconPress = async (iconName) => {
    setActiveScreen(iconName);
    await AsyncStorage.setItem("activeIcon", iconName);

    switch (iconName) {
      case "search":
        navigation.navigate("Home");
        break;
      case "heart":
        navigation.navigate("Favoritos");
        break;
      case "calendar":
        if (isCompany) {
          navigation.navigate("AgendaEmpresa");
          break;
        } else {
          navigation.navigate("Agendamentos");
          break;
        }
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
    const getChatsEnable = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("Authorization");
        const response = await fetch(`${CONFIG.API_BASE_URL}/enable-chats`, {
          headers: {
            Authorization: token,
          },
        });

        if (!response.ok) {
          throw new Error(
            "Você ainda não realizou nenhuma reserva. Assim que realizar uma reserva, poderá estar iniciando a conversa com a empresa."
          );
        }

        const data = await response.json();
        setEmpresas(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getChatsEnable();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.empresaItem}
      onPress={() =>
        navigation.navigate("PreMensagens", { nome: item.empresa_nome })
      }
    >
      <Image source={{ uri: item.logo }} style={styles.logo} />
      <Text style={styles.empresaNome}>{item.empresa_nome}</Text>
      <Text>
        {item.cidade}, {item.estado}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Chats</Text>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {!loading && !error && empresas.length === 0 && (
        <Text style={styles.emptyText}>Nenhuma empresa encontrada.</Text>
      )}
      {!loading && !error && (
        <FlatList
          data={empresas}
          renderItem={renderItem}
          keyExtractor={(item) => item.empresa_id.toString()}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
      <View style={styles.bottomIcons}>
        <BottomIcons onPress={handleIconPress} activeScreen={activeScreen} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fcfcf2",
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 70,
  },
  title: {
    fontSize: 30,
    marginTop: 10,
    marginLeft: "10%",
  },
  empresaItem: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    width: "100%",
    alignItems: "center",
  },
  logo: {
    width: "100%",
    height: 160,
    marginBottom: 12,
  },
  empresaNome: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    margin: "auto",
    marginTop: "95%",
    color: "#888",
  },
  emptyText: {
    display: "flex",
    fontSize: 16,
    textAlign: "center",
    marginTop: "90%",
    color: "#888",
  },
  bottomIcons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fcfcf2",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#C5C5BC",
  },
});

export default PreMensagem;
