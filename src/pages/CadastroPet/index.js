import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Button,
  Input,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import RNPickerSelect from "react-native-picker-select";
import BirthdatePicker from "../../componentes/BirthdatePicker";

import * as Animatable from "react-native-animatable";
import CONFIG from "../../utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CadastroPet() {
  const navigation = useNavigation();

  const goToHome = () => {
    navigation.navigate("Home");
  };

  const goToCadastroPet = () => {
    navigation.navigate("CadastroPet");
  };

  const goToCadastroCliente = () => {
    navigation.navigate("CadastroCliente");
  };

  const tipoAnimal = [
    { value: "cachorro", label: "Cachorro" },
    { value: "gato", label: "Gato" },
  ];

  const porteAnimal = [
    { value: "pequeno", label: "Pequeno" },
    { value: "medio", label: "Médio" },
    { value: "grande", label: "Grande" },
  ];

  useEffect(() => {
    console.log(date);
  }, [date]);

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [porte, setPorte] = useState("");
  const [date, setDate] = useState("");
  const [adicional, setAdicional] = useState("");
  const [raca, setRaca] = useState("");

  const handleDateChange = (date) => {
    setDate(date);
  };

  const register = async () => {
    try {
      const token = await AsyncStorage.getItem("Authorization")
      const url = `${CONFIG.API_BASE_URL}/register-pet`;
      const payload = {
        nome,
        tipo,
        porte,
        date,
        adicional,
        raca
      };

      const resposta = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const dadosResposta = await resposta.json();

      if (resposta.status == 200) {
        Alert.alert("Sucesso", dadosResposta.message);
        goToHome()
      } else {
        Alert.alert("Erro", dadosResposta.message);
      }
    } catch (erro) {
      console.error("Ocorreu um erro ao tentar fazer login:", erro);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Animatable.View animation="fadeInLeft" delay={500}>
          <Image
            source={require("../../assets/logo.jpeg")}
            style={styles.logo}
          />
        </Animatable.View>

        <Animatable.View animation="fadeInUp" style={styles.containerForm}>
          <Text style={styles.title}>Tipo de Animal</Text>
          <RNPickerSelect
            style={pickerSelectStyles}
            placeholder={{
              label: "Selecione um Estado",
            }}
            onValueChange={(text) => setTipo(text)}
            items={tipoAnimal}
            value={tipo}
          />

          <Text style={styles.title}>Nome do Pet</Text>
          <TextInput
            placeholder="Digite o nome do seu pet"
            style={styles.input}
            onChangeText={(text) => setNome(text)}
          />

          <Text style={styles.title}>Data de Nascimento</Text>
          <BirthdatePicker onDateChange={handleDateChange} />

          <Text style={styles.title}>Raça</Text>
          <TextInput
            placeholder="Digite a raça do seu pet"
            style={styles.input}
            onChangeText={(text) => setRaca(text)}
          />

          <Text style={styles.title}>Porte</Text>
          <RNPickerSelect
            style={pickerSelectStyles}
            placeholder={{
              label: "Selecione um Porte",
            }}
            onValueChange={(text) => setPorte(text)}
            items={porteAnimal}
            value={porte}
          />

          <Text style={styles.title}>Informações Adicionais</Text>
          <TextInput
            placeholder="Informações extras sobre o pet (opcional)"
            style={styles.input}
            onChangeText={(text) => setAdicional(text)}
          />

          <TouchableOpacity style={styles.button} onPress={() => register()}>
            <Text style={styles.buttonText}>Cadastrar</Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>
    </ScrollView>
  );
}

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  inputAndroid: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: "8%",
    paddingStart: "5%",
    paddingHorizontal: 10,
  },
});

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#fcfcf2",
  },
  containerForm: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingStart: "5%",
    paddingEnd: "5%",
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    marginTop: 28,
  },
  input: {
    borderBottomWidth: 1,
    height: 30,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#11021E",
    width: "100%",
    borderRadius: 4,
    paddingVertical: 8,
    marginTop: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    justifyContent: "center",
    alignSelf: "center",
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    marginTop: 10,
  },
});
