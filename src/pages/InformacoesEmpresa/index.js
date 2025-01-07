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
import CONFIG from "../../utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import { Input, CheckBox } from "react-native-elements";

export default function InformacoesEmpresa() {
  const navigation = useNavigation();
  const [empresa, setEmpresa] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isEditable, setIsEditable] = useState(false);
  const [nome, setNome] = useState("");
  const [servico, setServico] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [isHotel, setIsHotel] = useState(false);
  const [isCreche, setIsCreche] = useState(false);
  const isFocused = useIsFocused();
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

  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        const token = await AsyncStorage.getItem("Authorization");
        const response = await fetch(`${CONFIG.API_BASE_URL}/infoEnterprise`, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        });
        console.log(token)
        if (!response.ok) {
          throw new Error("Erro ao obter informações da empresa");
        }

        const data = await response.json();
        setEmpresa(data);
        
        setNome(data[0].nome);
        setServico(data[0].servico);
        setCidade(data[0].cidade);
        setEstado(data[0].estado);
        setLogradouro(data[0].logradouro);
        setDescricao(data[0].descricao);
        setPreco(data[0].preco);
        
        if (data[0].servico === "hotel") {
          setIsHotel(true);
          setIsCreche(false);
        } else if (data[0].servico === "creche") {
          setIsHotel(false);
          setIsCreche(true);
        } else if (data[0].servico === "ambos") {
          setIsHotel(true);
          setIsCreche(true);
        }

        setLoading(false);
      } catch (error) {
        console.error("Erro ao obter informações:", error);
        setLoading(false);
      }
    };

    fetchEmpresa();
  }, []);

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem("Authorization");
      const response = await fetch(`${CONFIG.API_BASE_URL}/updateEnterprise`, {
        method: "PUT",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          servico: isHotel && isCreche ? "ambos" : isHotel ? "hotel" : "creche",
          cidade,
          estado,
          logradouro,
          descricao,
          preco,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar informações da empresa");
      }

      const data = await response.json();
      setEmpresa([data]);
      setIsEditable(false);
    } catch (error) {
      console.error("Erro ao atualizar informações:", error);
    }
  };

  const handleIconPress = (iconName) => {
    setActiveScreen(iconName);

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

  const toggleEditable = () => {
    setIsEditable(!isEditable);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Informações da Empresa</Text>
        <TouchableOpacity onPress={toggleEditable}>
          <FontAwesome name="pencil" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {empresa.length > 0 && (
          <View style={[styles.section, { marginTop: 40 }]}>
            <View style={styles.sectionContent}></View>
            <Text style={styles.sectionTitle}>Nome</Text>
            <Input
              disabled={!isEditable}
              value={nome}
              onChangeText={setNome}
            ></Input>

            <View style={styles.sectionContent}></View>
            <Text style={styles.sectionTitle}>Serviço</Text>
            <CheckBox
              title="Hotel"
              checked={isHotel}
              disabled={!isEditable}
              onPress={() => setIsHotel(!isHotel)}
            />
            <CheckBox
              title="Creche"
              checked={isCreche}
              disabled={!isEditable}
              onPress={() => setIsCreche(!isCreche)}
            />

            <View style={styles.sectionContent}></View>
            <Text style={styles.sectionTitle}>Cidade</Text>
            <Input
              disabled={!isEditable}
              value={cidade}
              onChangeText={setCidade}
            ></Input>

            <View style={styles.sectionContent}></View>
            <Text style={styles.sectionTitle}>Estado</Text>
            <Input
              disabled={!isEditable}
              value={estado}
              onChangeText={setEstado}
            ></Input>

            <View style={styles.sectionContent}></View>
            <Text style={styles.sectionTitle}>Logradouro</Text>
            <Input
              disabled={!isEditable}
              value={logradouro}
              onChangeText={setLogradouro}
            ></Input>

            <View style={styles.sectionContent}></View>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Input
              disabled={!isEditable}
              value={descricao}
              onChangeText={setDescricao}
            ></Input>

            <View style={styles.sectionContent}></View>
            <Text style={styles.sectionTitle}>Preço</Text>
            <Input
              disabled={!isEditable}
              value={preco}
              onChangeText={setPreco}
            ></Input>

            {isEditable && (
              <View style={[styles.section, { marginTop: 20 }]}>
                <TouchableOpacity style={styles.button} onPress={handleUpdate}>
                  <Text style={styles.buttonText}>Alterar Dados</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
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
  button: {
    backgroundColor: "#FFA500",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
});
