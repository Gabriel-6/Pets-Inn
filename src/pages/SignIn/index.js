import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";

import * as Animatable from "react-native-animatable";
import { useNavigation } from "@react-navigation/native";
import { Input, Icon } from "react-native-elements";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from "react-redux";
import { setAuth } from "../../../redux/authSlice";
import { useSelector } from "react-redux";
import CONFIG from "../../utils/config";


export default function SignIn() {
  const dispatch = useDispatch();

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const navigation = useNavigation();

  const goToPreCadastro = () => {
    navigation.navigate("PreCadastro");
  };

  const goToUser = () => {
    navigation.navigate("Perfil");
  };

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const toggleMostrarSenha = () => {
    setMostrarSenha(!mostrarSenha);
  };

  const saveToken = async (token, type) => {
    try {
      await AsyncStorage.setItem("Authorization", token);
      await AsyncStorage.setItem("UserType", type)
      console.log(token);
      console.log(type)
    } catch (error) {
      console.log("Error ao salvar o token: ", error);
    }
  };

  const login = async () => {
    try {
      const url = `${CONFIG.API_BASE_URL}/login`;
      const payload = {
        username: email.toLocaleLowerCase().trim(),
        password: senha,
      };

      const resposta = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const dadosResposta = await resposta.json();

      if (resposta.status == 200) {
        Alert.alert("Sucesso", dadosResposta.message);
        await saveToken(dadosResposta.token, dadosResposta.user);

        dispatch(setAuth(dadosResposta.token));
        goToUser();
      } else {
        Alert.alert("Erro", dadosResposta.message);
      }
    } catch (erro) {
      console.error("Ocorreu um erro ao tentar fazer login:", erro);
    }
  };

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInLeft" delay={500}>
        <Image source={require("../../assets/logo.jpeg")} style={styles.logo} />
      </Animatable.View>

      <Animatable.View animation="fadeInUp" style={styles.containerForm}>
        <Text style={styles.title}>Usuario</Text>
        <Input
          placeholder="Digite o E-mail ou CNPJ"
          style={styles.input}
          onChangeText={(text) => setEmail(text)}
          inputContainerStyle={{ borderBottomWidth: 0 }}
          inputStyle={{
            borderBottomWidth: 1,
            borderColor: "#333",
            paddingVertical: 10,
            paddingHorizontal: 0,
          }}
        />

        <Text style={styles.title}>{isAuthenticated}</Text>

        <Text style={styles.title}>Senha</Text>
        <Input
          placeholder="Digite a Senha"
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

        <TouchableOpacity style={styles.button} onPress={login}>
          <Text style={styles.buttonText}>Acessar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonRegister}
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={styles.registerText}>Esqueci a minha senha</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonRegister}
          onPress={goToPreCadastro}
        >
          <Text style={styles.registerText}>
            Não possui uma conta? Cadastre-se
          </Text>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}

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
  },
  title: {
    fontSize: 25,
    marginTop: 28,
  },
  input: {
    borderBottomWidth: 1,
    height: 40,
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
