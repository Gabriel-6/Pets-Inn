import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  Button,
  TouchableOpacity,
} from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import BottomIcons from "../../componentes/BottomIcons";
import io from "socket.io-client";
import CONFIG from "../../utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function Mensagens({ route }) {
  const { nome } = route.params;
  const navigation = useNavigation();
  const [activeIcon, setActiveIcon] = useState("envelope");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [senderId, setSenderId] = useState(null);
  const [socket, setSocket] = useState(null);
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
    const newSocket = io(`ws://${CONFIG.WS_BASE_URL}`);

    newSocket.on("connect", () => {
      console.log("WebSocket ID:", newSocket.id);
      setSenderId(newSocket.id);
      setSocket(newSocket);
    });

    newSocket.on("message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() && senderId) {
      socket.emit("message", { message, sender: senderId });
      setMessage("");
    }
  };

  const renderItem = ({ item }) => {
    const isMyMessage = item.sender === senderId;
    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.message}</Text>
      </View>
    );
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Mensagens")}
        >
          <Icon name="arrow-left" size={24} color="#FFA500" />
        </TouchableOpacity>
        <Text style={styles.nome}>{nome}</Text>
      </View>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.flatListContent}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Mensagem..."
        />
        <Button title="Enviar" onPress={sendMessage} />
      </View>
      <View style={styles.bottomIcons}>
        <BottomIcons onPress={handleIconPress} activeScreen={activeScreen} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fcfcf2",
  },
  flatListContent: {
    flexGrow: 1,
    padding: 10,
    paddingBottom: 120,
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: "80%",
  },
  myMessage: {
    backgroundColor: "#11021E",
    alignSelf: "flex-end",
  },
  otherMessage: {
    backgroundColor: "#FFA500",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fcfcf2",
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  bottomIcons: {
    borderTopWidth: 1,
    borderColor: "#C5C5BC",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fcfcf2",
    paddingVertical: 10,
    width: "100%",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 8,
  },
  nome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginLeft: 12,
  },
});
