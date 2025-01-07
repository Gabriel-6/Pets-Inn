import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import BottomIcons from "../../componentes/BottomIcons";
import CONFIG from "../../utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";

export default function InformacoesCliente() {
  const navigation = useNavigation();
  const [activeIcon, setActiveIcon] = useState("informacoesEmpresa");
  const [empresa, setEmpresa] = useState({ diasDisponiveis: [] });
  const [isLoading, setLoading] = useState(true);
  const [maxAmouth, setMaxAmouth] = useState();
  const [isCompany, setIsCompany] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    const checkUserType = async () => {
      const userType = await AsyncStorage.getItem("UserType");
      setIsCompany(userType === "empresa");
    };
    checkUserType();
  }, [isFocused]);

  useEffect(() => {
    fetchEmpresa();
  }, []);

  const fetchEmpresa = async () => {
    try {
      const token = await AsyncStorage.getItem("Authorization");
      const response = await fetch(`${CONFIG.API_BASE_URL}/reservations-day`, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });
      setLoading(false);
      const data = await response.json();

      setMaxAmouth(data.message.toString())
    } catch (error) {
      console.error("Erro ao obter informações:", error);
      setLoading(false);
    }
  };

  const saveEmpresaInfo = async () => {
    try {
      const token = await AsyncStorage.getItem("Authorization");
      const response = await fetch(
        `${CONFIG.API_BASE_URL}/update-days`,
        {
          method: "PUT",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "quantidade": maxAmouth
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao atualizar informações da empresa");
      }
    } catch (error) {
      console.error("Erro ao salvar informações da empresa:", error);
    }
  };

  const toggleDiaDisponivel = (dia) => {
    const updatedDiasDisponiveis = empresa.diasDisponiveis.includes(dia)
      ? empresa.diasDisponiveis.filter((d) => d !== dia)
      : [...empresa.diasDisponiveis, dia];
    setEmpresa({ ...empresa, diasDisponiveis: updatedDiasDisponiveis });
  };

  const iconPress = (iconName) => {
    setActiveIcon(iconName === activeIcon ? iconName : iconName);
    switch (iconName) {
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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Informações de Agendamento</Text>
      </View>

      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dias Disponíveis</Text>
          <View style={styles.diasContainer}>
            <TouchableOpacity
              style={[
                styles.diaButton,
                empresa.diasDisponiveis.includes("Domingo") &&
                  styles.diaButtonSelected,
              ]}
              onPress={() => toggleDiaDisponivel("Domingo")}
            >
              <Text style={styles.diaButtonText}>Domingo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.diaButton,
                empresa.diasDisponiveis.includes("Segunda") &&
                  styles.diaButtonSelected,
              ]}
              onPress={() => toggleDiaDisponivel("Segunda")}
            >
              <Text style={styles.diaButtonText}>Segunda</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.diaButton,
                empresa.diasDisponiveis.includes("Terça") &&
                  styles.diaButtonSelected,
              ]}
              onPress={() => toggleDiaDisponivel("Terça")}
            >
              <Text style={styles.diaButtonText}>Terça</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.diaButton,
                empresa.diasDisponiveis.includes("Quarta") &&
                  styles.diaButtonSelected,
              ]}
              onPress={() => toggleDiaDisponivel("Quarta")}
            >
              <Text style={styles.diaButtonText}>Quarta</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.diaButton,
                empresa.diasDisponiveis.includes("Quinta") &&
                  styles.diaButtonSelected,
              ]}
              onPress={() => toggleDiaDisponivel("Quinta")}
            >
              <Text style={styles.diaButtonText}>Quinta</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.diaButton,
                empresa.diasDisponiveis.includes("Sexta") &&
                  styles.diaButtonSelected,
              ]}
              onPress={() => toggleDiaDisponivel("Sexta")}
            >
              <Text style={styles.diaButtonText}>Sexta</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.diaButton,
                empresa.diasDisponiveis.includes("Sábado") &&
                  styles.diaButtonSelected,
              ]}
              onPress={() => toggleDiaDisponivel("Sábado")}
            >
              <Text style={styles.diaButtonText}>Sábado</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.separator}></View>
          <View style={styles.inputContainer}>
            <Text style={styles.sectionTitle}>Limite de Reservas por Dia</Text>
            <TextInput
              style={styles.input}
              value={maxAmouth}
              onChangeText={(text) =>
                setMaxAmouth(text)
              }
              keyboardType="numeric"
            />
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={saveEmpresaInfo}>
            <Text style={styles.saveButtonText}>Salvar Informações</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomIcons}>
        <BottomIcons activeIcon={activeIcon} onPress={iconPress} />
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
    fontSize: 28,
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
    marginTop: 10,
    marginBottom: 20,
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
  saveButton: {
    backgroundColor: "#FB7B19",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
  inputContainer: {
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: "70%",
    fontSize: 16,
    textAlign: "center",
  },
  diasContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    flexWrap: "wrap",
  },
  diaButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    width: "30%",
    alignItems: "center",
  },
  diaButtonText: {
    fontSize: 16,
    textAlign: "center",
  },
  diaButtonSelected: {
    backgroundColor: "#F4A460",
  },
});
