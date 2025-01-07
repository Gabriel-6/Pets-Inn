import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";
import RNPickerSelect from "react-native-picker-select";
import { Input, Icon } from "react-native-elements";
import CONFIG from "../../utils/config";

export default function CadastroEstabelecimento() {
  const navigation = useNavigation();

  const [cnpj, setCnpj] = useState("");
  const [nome, setNome] = useState("");
  const [inscricao, setInscricao] = useState("");
  const [servico, setServico] = useState("");
  const [cep, setCep] = useState("");
  const [bairro, setBairro] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [complemento, setComplemento] = useState("");
  const [senha, setSenha] = useState("");
  const [email, setEmail] = useState("");

  const goToHome = () => {
    navigation.navigate("Home");
  };

  const [mostrarSenha, setMostrarSenha] = useState(false);

  const servicosOferecidos = [
    { value: "hotel", label: "Hotel" },
    { value: "creche", label: "Creche" },
    { value: "ambos", label: "Ambos" },
  ];

  const toggleMostrarSenha = () => {
    setMostrarSenha(!mostrarSenha);
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

  function checkCnpj(cnpj) {
    if (typeof cnpj !== "undefined") {
      const newCnpj = cnpj.replace(/[^\d]/g, "");
      if (newCnpj.length === 14) {
        fetch(`https://publica.cnpj.ws/cnpj/${newCnpj}`)
          .then((res) => res.json())
          .then((data) => {
            setNome(data.razao_social);
            setLogradouro(data.estabelecimento.logradouro);
            if (data.estabelecimento.inscricoes_estaduais[0]) {
              setInscricao(
                data.estabelecimento.inscricoes_estaduais[0].inscricao_estadual
              );
            }
          });
      }
    }
  }

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

  const formatCnpj = (input) => {
    const newCnpj = input.replace(/\D/g, "");

    let formatCnpj = newCnpj;

    if (newCnpj.length >= 2) {
      formatCnpj = `${newCnpj.substring(0, 2)}`;
    }
    if (newCnpj.length > 2) {
      formatCnpj += `.${newCnpj.substring(2, 5)}`;
    }
    if (newCnpj.length > 5) {
      formatCnpj += `.${newCnpj.substring(5, 8)}`;
    }
    if (newCnpj.length > 8) {
      formatCnpj += `/${newCnpj.substring(8, 12)}`;
    }
    if (newCnpj.length > 12) {
      formatCnpj += `-${newCnpj.substring(12, 14)}`;
    }

    return formatCnpj;
  };

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

  const register = async () => {
    if (
      !cnpj ||
      !senha ||
      !nome ||
      !inscricao ||
      !servico ||
      !cep ||
      !bairro ||
      !logradouro ||
      !numero ||
      !cidade ||
      !estado ||
      !email
    ) {
      Alert.alert("Atenção", "Preencha todos os dados");
    } else {
      try {
        const newCep = removeData(cep);
        const newCnpj = removeData(cnpj);
        const url = `${CONFIG.API_BASE_URL}/register-company`;
        const payload = {
          cnpj: newCnpj,
          email: email,
          nome: nome,
          senha: senha,
          ie: inscricao,
          servico: servico,
          cep: newCep,
          bairro: bairro,
          logradouro: logradouro,
          numero: numero,
          complemento: complemento,
          cidade: cidade,
          estado: estado,
          role: "provider",
        };

        const resposta = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const dadosResposta = await resposta.json();

        if (resposta.ok && resposta.status == 200) {
          Alert.alert("Sucesso", dadosResposta.message);
          goToHome();
        } else {
          console.log(dadosResposta.message);
        }
      } catch (erro) {
        console.log("Ocorreu um erro ao realizar o cadastro", erro);
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
          <Text style={styles.title}>CNPJ</Text>
          <Input
            placeholder="Digite o CNPJ"
            style={styles.input}
            onChangeText={(text) => {
              const formattedCnpj = formatCnpj(text);
              setCnpj(formattedCnpj);
            }}
            onBlur={() => {
              checkCnpj(cnpj);
            }}
            maxLength={18}
            value={cnpj}
            keyboardType="numeric"
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

          <Text style={styles.title}>Email</Text>
          <Input
            placeholder="Digite seu e-mail"
            style={styles.input}
            onChangeText={(text) => setEmail(text)}
            value={email}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            inputStyle={{
              borderBottomWidth: 1,
              borderColor: "#333",
              paddingVertical: 10,
              paddingHorizontal: 0,
            }}
          />

          <Text style={styles.title}>Nome do Estabelecimento</Text>
          <Input
            placeholder="Digite o nome do estabelecimento"
            style={styles.input}
            onChangeText={(text) => setNome(text)}
            value={nome}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            inputStyle={{
              borderBottomWidth: 1,
              borderColor: "#333",
              paddingVertical: 10,
              paddingHorizontal: 0,
            }}
          />

          <Text style={styles.title}>Inscrição Estadual</Text>
          <Input
            placeholder="Digite a inscrição estadual"
            style={styles.input}
            onChangeText={(text) => setInscricao(text)}
            value={inscricao}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            inputStyle={{
              borderBottomWidth: 1,
              borderColor: "#333",
              paddingVertical: 10,
              paddingHorizontal: 0,
            }}
          />

          <Text style={styles.title}>Tipo de Serviço Oferecido</Text>
          <RNPickerSelect
            style={pickerSelectStyles}
            placeholder={{
              label: "Selecione o Serviço Oferecido",
            }}
            onValueChange={(text) => setServico(text)}
            items={servicosOferecidos}
            value={servico}
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
            onChangeText={(text) => setComplemento("Complemento", text)}
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
            onChangeText={(text) => setCidade("cidade", text)}
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

          <TouchableOpacity style={styles.button} onPress={register}>
            <Text style={styles.buttonText}>Cadastrar</Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>
    </ScrollView>
  );
}

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
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    justifyContent: "center",
    alignSelf: "center",
  },
});

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
