import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import RNPickerSelect from "react-native-picker-select";
import { Input, Icon } from "react-native-elements";

import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";

import * as Animatable from "react-native-animatable";
import CONFIG from "../../utils/config";
import PrivacyPolicyModal from "../../componentes/PrivacyPolicies";

export default function CadastroCliente() {
  const navigation = useNavigation();

  const toggleMostrarSenha = () => {
    setMostrarSenha(!mostrarSenha);
  };

  const goToHome = () => {
    navigation.navigate("Home");
  };

  const estadosBrasileiros = [
    { value: "AC", label: "Acre" },
    { value: "AL", label: "Alagoas" },
    { value: "AP", label: "Amapá" },
    { value: "AM", label: "Amazonas" },
    { value: "BA", label: "Bahia" },
    { value: "CE", label: "Ceará" },
    { value: "DF", label: "Distrito Federal" },
    { value: "ES", label: "Espírito Santo" },
    { value: "GO", label: "Goiás" },
    { value: "MA", label: "Maranhão" },
    { value: "MT", label: "Mato Grosso" },
    { value: "MS", label: "Mato Grosso do Sul" },
    { value: "MG", label: "Minas Gerais" },
    { value: "PA", label: "Pará" },
    { value: "PB", label: "Paraíba" },
    { value: "PR", label: "Paraná" },
    { value: "PE", label: "Pernambuco" },
    { value: "PI", label: "Piauí" },
    { value: "RJ", label: "Rio de Janeiro" },
    { value: "RN", label: "Rio Grande do Norte" },
    { value: "RS", label: "Rio Grande do Sul" },
    { value: "RO", label: "Rondônia" },
    { value: "RR", label: "Roraima" },
    { value: "SC", label: "Santa Catarina" },
    { value: "SP", label: "São Paulo" },
    { value: "SE", label: "Sergipe" },
    { value: "TO", label: "Tocantins" },
  ];

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cep, setCep] = useState("");
  const [bairro, setBairro] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [complemento, setComplemento] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  const checaCEP = (cep) => {
    if (typeof cep !== "undefined") {
      const newCEP = cep.replace(/[^\d]/g, "");
      if (newCEP.length === 8) {
        fetch(`https://viacep.com.br/ws/${newCEP}/json/`)
          .then((res) => res.json())
          .then((data) => {
            setBairro(data.bairro);
            setLogradouro(data.logradouro);
            setCidade(data.localidade);
            setEstado(data.uf);
          });
      }
    }
  };

  const removeData = (text) => {
    const removed = text.replace(/\D/g, "");
    return removed;
  };

  const formatCep = (input) => {
    const numericInput = input.replace(/\D/g, "");

    if (numericInput.length > 5) {
      return numericInput.slice(0, 5) + "-" + numericInput.slice(5);
    } else {
      return numericInput;
    }
  };

  const PhoneInput = (text) => {
    const newTelefone = text.replace(/\D/g, "");

    let formatTelefone = newTelefone;

    if (newTelefone.length >= 2) {
      formatTelefone = `(${newTelefone.substring(0, 2)})`;
    }
    if (newTelefone.length > 2) {
      const numero = newTelefone.substring(2);
      if (numero.length === 9) {
        formatTelefone += ` ${numero.substring(0, 5)}-${numero.substring(5)}`;
      } else if (numero.length === 8) {
        formatTelefone += ` ${numero.substring(0, 4)}-${numero.substring(4)}`;
      } else {
        formatTelefone += ` ${numero}`;
      }
    }

    return formatTelefone;
  };

  const register = async () => {
    if (
      !email ||
      !senha ||
      !nome ||
      !telefone ||
      !cep ||
      !bairro ||
      !logradouro ||
      !numero ||
      !cidade ||
      !estado ||
      !isChecked
    ) {
      Alert.alert(
        "Atenção",
        "Preencha todos os dados e concorde com os temos de uso"
      );
    } else {
      try {
        newCep = removeData(cep);
        newTel = removeData(telefone);
        const url = `${CONFIG.API_BASE_URL}/register`;
        payload = {
          email: email.toLocaleLowerCase(),
          senha: senha,
          nome: nome,
          telefone: newTel,
          cep: newCep,
          bairro: bairro,
          logradouro: logradouro,
          numero: numero,
          cidade: cidade,
          estado: estado,
          complemento: complemento,
          role: "user",
        };

        const resposta = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const dadosResposta = await resposta.json();

        if (resposta.ok) {
          Alert.alert("Sucesso", dadosResposta.message);
          goToHome();
        } else {
          Alert.alert("Erro", dadosResposta.message);
        }
      } catch (erro) {
        console.log("Ocorreu um erro ao realizar o cadastro: ", erro);
      }
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
          <Text style={styles.title}>Nome</Text>
          <Input
            placeholder="Digite seu Nome"
            onChangeText={(text) => setNome(text)}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            inputStyle={{
              borderBottomWidth: 1,
              borderColor: "#333",
              paddingVertical: 10,
              paddingHorizontal: 0,
            }}
          />

          <Text style={styles.title}>Email</Text>
          <Input
            placeholder="Digite seu E-mail"
            onChangeText={(text) => setEmail(text)}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            inputStyle={{
              borderBottomWidth: 1,
              borderColor: "#333",
              paddingVertical: 10,
              paddingHorizontal: 0,
            }}
          />

          <Text style={styles.title}>Senha</Text>
          <Input
            placeholder="Digite sua Senha"
            onChangeText={(text) => setSenha(text)}
            style={password.pass}
            secureTextEntry={!mostrarSenha}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            inputStyle={{
              borderBottomWidth: 1,
              borderColor: "#333",
              paddingVertical: 10,
              paddingHorizontal: 0,
            }}
            rightIcon={
              <Icon
                name={mostrarSenha ? "eye" : "eye-slash"}
                type="font-awesome"
                style={password.eyeIcon}
                onPress={toggleMostrarSenha}
              />
            }
          />

          <Text style={styles.title}>Telefone</Text>
          <Input
            placeholder="Digite seu Telefone"
            onChangeText={(text) => {
              const formattedTelefone = PhoneInput(text);
              setTelefone(formattedTelefone);
            }}
            keyboardType="numeric"
            value={telefone}
            maxLength={15}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            inputStyle={{
              borderBottomWidth: 1,
              borderColor: "#333",
              paddingVertical: 10,
              paddingHorizontal: 0,
            }}
          />

          <Text style={styles.title}>CEP</Text>
          <Input
            placeholder="Digite seu CEP"
            onChangeText={(text) => {
              const formattedCep = formatCep(text);
              setCep(formattedCep);
            }}
            value={cep}
            onBlur={() => checaCEP(cep)}
            inputMode="numeric"
            inputContainerStyle={{ borderBottomWidth: 0 }}
            inputStyle={{
              borderBottomWidth: 1,
              borderColor: "#333",
              paddingVertical: 10,
              paddingHorizontal: 0,
            }}
          />

          <Text style={styles.title}>Bairro</Text>
          <Input
            placeholder="Digite seu Bairro"
            onChangeText={(text) => setBairro(text)}
            value={bairro}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            inputStyle={{
              borderBottomWidth: 1,
              borderColor: "#333",
              paddingVertical: 10,
              paddingHorizontal: 0,
            }}
          />

          <Text style={styles.title}>Rua</Text>
          <Input
            placeholder="Digite seu Logradouro"
            onChangeText={(text) => setLogradouro(text)}
            value={logradouro}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            inputStyle={{
              borderBottomWidth: 1,
              borderColor: "#333",
              paddingVertical: 10,
              paddingHorizontal: 0,
            }}
          />

          <Text style={styles.title}>Numero da Casa</Text>
          <Input
            placeholder="Digite o N° da Casa"
            onChangeText={(text) => setNumero(text)}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            inputStyle={{
              borderBottomWidth: 1,
              borderColor: "#333",
              paddingVertical: 10,
              paddingHorizontal: 0,
            }}
          />

          <Text style={styles.title}>Complemento</Text>
          <Input
            placeholder="ex: Casa de Baixo (Opcional)"
            onChangeText={(text) => setComplemento(text)}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            inputStyle={{
              borderBottomWidth: 1,
              borderColor: "#333",
              paddingVertical: 10,
              paddingHorizontal: 0,
            }}
          />

          <Text style={styles.title}>Cidade</Text>
          <Input
            placeholder="Digite sua Cidade"
            onChangeText={(text) => setCidade(text)}
            value={cidade}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            inputStyle={{
              borderBottomWidth: 1,
              borderColor: "#333",
              paddingVertical: 10,
              paddingHorizontal: 0,
            }}
          />

          <Text style={styles.title}>Estado</Text>
          <RNPickerSelect
            style={pickerSelectStyles}
            placeholder={{
              label: "Selecione um Estado",
            }}
            onValueChange={(text) => setEstado(text)}
            items={estadosBrasileiros}
            value={estado}
          />

          <PrivacyPolicyModal onCheckedChange={setIsChecked} />

          <TouchableOpacity style={styles.button} onPress={register}>
            <Text style={styles.buttonText}>Próximo</Text>
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
  container: {
    flex: 1,
    backgroundColor: "#fcfcf2",
  },
  containerHeader: {
    marginTop: "14%",
    marginBottom: "8%",
    paddingStart: "5%",
  },

  containerForm: {
    backgroundColor: "#FFF",
    flex: 1,
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
  buttonRegister: {
    marginTop: 14,
    alignSelf: "center",
  },
  registerText: {
    color: "#a1a1a1",
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    justifyContent: "center",
    alignSelf: "center",
  },
  link: {
    color: "blue",
    textDecorationLine: "underline",
  },
});

const password = StyleSheet.create({
  eyeIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    height: 10,
    fontSize: 9,
  },
});
