import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import ToastManager, { Toast } from "toastify-react-native";
import { useNavigation } from "@react-navigation/native";
import CONFIG from "../../utils/config";


const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const navigation = useNavigation()

  const success = () => {
    Toast.success("Foi enviado um email para redefinir sua senha.");
  };

  const error = () => {
    Toast.error("Não foi possível enviar o email.");
  };

  const handlePasswordReset = async () => {
    
    const resposta = await fetch(`${CONFIG.API_BASE_URL}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (resposta.status == 200) {
      success();
      navigation.navigate('SignIn')
    } else {
      error();
    }
  };

  return (
    <View style={styles.container}>
      <ToastManager />
      <Text style={styles.title}>Esqueci a minha senha</Text>
      <Text style={styles.instruction}>
        Digite seu e-mail para recuperar a senha:
      </Text>
      <TextInput
        placeholder="Digite seu e-mail"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
        <Text style={styles.buttonText}>Enviar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  instruction: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
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
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ForgotPassword;
