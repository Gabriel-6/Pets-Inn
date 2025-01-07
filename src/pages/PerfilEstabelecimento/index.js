import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import BottomIcons from "../../componentes/BottomIcons";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PerfilEstabelecimento() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isFocused = useIsFocused();
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
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("Authorization");
        if (token) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Erro ao verificar token:", error);
      }
    };

    checkToken();
  }, []);

  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("Authorization");
      await AsyncStorage.removeItem("UserType")
      setIsLoggedIn(false);
      navigation.navigate("Home")
    } catch (error) {}
  };

  const handleIconPress = (iconName) => {
    setActiveScreen(iconName);

    switch (iconName) {
      case "calendar":
        navigation.navigate("AgendaEmpresa");
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
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('InformacoesEmpresa')}>
        <View style={[styles.section, { marginTop: 50 }]}>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>
              Informações do Estabelecimento
            </Text>
            <Icon name="chevron-right" size={20} color="#333" />
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.separator}></View>

      <TouchableOpacity onPress={() => navigation.navigate('InformacoesAgendamentos')}>
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Informações de Agendamentos</Text>
            <Icon name="chevron-right" size={20} color="#333" />
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.separator}></View>

      <TouchableOpacity onPress={handleLogout}>
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Sair</Text>
            <Icon name="chevron-right" size={20} color="#333" />
          </View>
        </View>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.content}></View>
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
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginHorizontal: 20,
  },
});
