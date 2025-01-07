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
import CONFIG from "../../utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import { Input } from "react-native-elements";

export default function InformacoesCliente() {
  const navigation = useNavigation();
  const [activeIcon, setActiveIcon] = useState("informacoesCliente");
  const [usuario, setUsuario] = useState([]);
  const [isEditable, setIsEditable] = useState();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cep, setCep] = useState("");
  const [bairro, setBairro] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [complemento, setComplemento] = useState("");
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

  const toggleEditable = () => {
    setIsEditable(!isEditable);
  };

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const token = await AsyncStorage.getItem("Authorization");
        const response = await fetch(`${CONFIG.API_BASE_URL}/infoClient`, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao obter informações do usuário");
        }

        const data = await response.json();
        setUsuario(data);

        if (data.length > 0) {
          setNome(data[0].nome);
          setTelefone(data[0].telefone);
          setCep(data[0].cep);
          setBairro(data[0].bairro);
          setLogradouro(data[0].logradouro);
          setNumero(data[0].numero);
          setCidade(data[0].cidade);
          setEstado(data[0].estado);
          setComplemento(data[0].complemento);
        }
      } catch (error) {
        console.error("Erro ao obter informações:", error);
      }
    };

    fetchUsuario();
  }, []);

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem("Authorization");
      const response = await fetch(`${CONFIG.API_BASE_URL}/updateClient`, {
        method: "PUT",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          telefone,
          cep,
          bairro,
          logradouro,
          numero,
          cidade,
          estado,
          complemento,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar informações da empresa");
      }

      const data = await response.json();
      setUsuario([data]);
      setIsEditable(false);
    } catch (error) {
      console.error("Erro ao atualizar informações:", error);
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
      <View style={styles.header}>
        <Text style={styles.title}>Informações do Cliente</Text>
        <TouchableOpacity onPress={toggleEditable}>
          <FontAwesome name="pencil" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {usuario.length > 0 && (
          <View style={[styles.section, { marginTop: 40 }]}>
            <View style={styles.sectionContent}></View>
            <Text style={styles.sectionTitle}>Nome</Text>
            <Input
              disabled={!isEditable}
              value={nome}
              onChangeText={setNome}
            ></Input>

            <View style={styles.sectionContent}></View>
            <Text style={styles.sectionTitle}>Telefone</Text>
            <Input
              disabled={!isEditable}
              value={telefone}
              onChangeText={setTelefone}
            ></Input>

            <View style={styles.sectionContent}></View>
            <Text style={styles.sectionTitle}>CEP</Text>
            <Input
              disabled={!isEditable}
              value={cep}
              onChangeText={setCep}
            ></Input>

            <View style={styles.sectionContent}></View>
            <Text style={styles.sectionTitle}>Bairro</Text>
            <Input
              disabled={!isEditable}
              value={bairro}
              onChangeText={setBairro}
            ></Input>

            <View style={styles.sectionContent}></View>
            <Text style={styles.sectionTitle}>Logradouro</Text>
            <Input
              disabled={!isEditable}
              value={logradouro}
              onChangeText={setLogradouro}
            ></Input>

            <View style={styles.sectionContent}></View>
            <Text style={styles.sectionTitle}>Numero</Text>
            <Input
              disabled={!isEditable}
              value={numero}
              onChangeText={setNumero}
            ></Input>

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
            <Text style={styles.sectionTitle}>Complemento</Text>
            <Input
              disabled={!isEditable}
              value={complemento}
              onChangeText={setComplemento}
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
  section: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 20,
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
});
