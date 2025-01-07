import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import BottomIcons from "../../componentes/BottomIcons";
import CONFIG from "../../utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

export default function InformacoesPet() {
  const navigation = useNavigation();
  const [pets, setPets] = useState([]);
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
    const fetchPets = async () => {
      try {
        const token = await AsyncStorage.getItem("Authorization");
        const response = await fetch(`${CONFIG.API_BASE_URL}/infoPet`, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao obter informações do pet");
        }

        const data = await response.json();
        setPets(data);
      } catch (error) {
        console.error("Erro ao obter informações:", error);
      }
    };
    fetchPets();
  }, []);

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

  const handleEditPet = (index) => {
    const updatedPets = [...pets];
    updatedPets[index].isEditable = true;
    setPets(updatedPets);
  };

  const handleSaveChanges = async (index) => {
    const updatedPets = [...pets];
    updatedPets[index].isEditable = false;
    const petUpdated = updatedPets[index];

    try {
      const token = await AsyncStorage.getItem("Authorization");
      const response = await fetch(`${CONFIG.API_BASE_URL}/updatePet`, {
        method: "PUT",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(petUpdated),
      });
      if (!response.ok) {
        throw new Error("Erro ao salvar alterações do pet");
      }

      if (response.status === 200) {
        Alert.alert("Sucesso", "Informações do Pet foram alteradas");
      } else {
        Alert.alert("Erro", "Não foi possivel realizar as alterações");
      }
    } catch (error) {
      console.log("Erro", error);
    }

    setPets(updatedPets);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Informações do Pet</Text>
      </View>

      <ScrollView>
        {pets.map((pet, index) => (
          <View
            key={index}
            style={[styles.section, { marginTop: index === 0 ? 50 : 20 }]}
          >
            {pet.isEditable ? (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => handleSaveChanges(index)}
                >
                  <Text style={styles.saveButtonText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditPet(index)}
              >
                <FontAwesome name="pencil" size={20} color="black" />
              </TouchableOpacity>
            )}
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>Nome: </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { color: pet.isEditable ? "black" : "gray" },
                ]}
                editable={pet.isEditable}
                value={pet.nome}
                onChangeText={(text) => {
                  const updatedPets = [...pets];
                  updatedPets[index].nome = text;
                  setPets(updatedPets);
                }}
              />
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>Porte:</Text>
              <Picker
                style={styles.picker}
                selectedValue={pet.porte}
                onValueChange={(itemValue) => {
                  const updatedPets = [...pets];
                  updatedPets[index].porte = itemValue;
                  setPets(updatedPets);
                }}
              >
                <Picker.Item label="Pequeno" value="pequeno" />
                <Picker.Item label="Médio" value="medio" />
                <Picker.Item label="Grande" value="grande" />
              </Picker>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>Raça: </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { color: pet.isEditable ? "black" : "gray" },
                ]}
                editable={pet.isEditable}
                value={pet.raca}
                onChangeText={(text) => {
                  const updatedPets = [...pets];
                  updatedPets[index].raca = text;
                  setPets(updatedPets);
                }}
              />
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>Tipo:</Text>
              <Picker
                style={styles.picker}
                selectedValue={pet.tipo}
                onValueChange={(itemValue) => {
                  const updatedPets = [...pets];
                  updatedPets[index].tipo = itemValue;
                  setPets(updatedPets);
                }}
              >
                <Picker.Item label="Cachorro" value="cachorro" />
                <Picker.Item label="Gato" value="gato" />
              </Picker>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>Adicional: </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { color: pet.isEditable ? "black" : "gray" },
                ]}
                editable={pet.isEditable}
                value={pet.adicional}
                onChangeText={(text) => {
                  const updatedPets = [...pets];
                  updatedPets[index].adicional = text;
                  setPets(updatedPets);
                }}
              />
            </View>

            <View style={styles.separator}></View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("CadastroPet")}
      >
        <Text style={styles.addButton}>Adicionar outro Pet</Text>
      </TouchableOpacity>

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
  textInput: {
    fontSize: 18,
    flex: 1,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  editButton: {
    borderRadius: 4,
    padding: 8,
    marginLeft: "auto",
  },
  saveButton: {
    backgroundColor: "#24a0ed",
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#f00",
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  editButtonText: {
    color: "white",
    fontSize: 16,
    marginRight: 8,
  },
  picker: {
    height: 50,
    width: 150,
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
  addButton: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
