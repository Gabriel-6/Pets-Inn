import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Calendar } from "react-native-calendars";
import CONFIG from "../../utils/config";
import BottomIcons from "../../componentes/BottomIcons";
import ToastManager, { Toast } from "toastify-react-native";

export default function AgendaEmpresa() {
  const navigation = useNavigation();
  const [reservas, setReservas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeScreen, setActiveScreen] = useState("Favoritos");
  const [expandedReservaId, setExpandedReservaId] = useState(null);

  const fetchReservasByDate = async (date) => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("Authorization");
      const response = await fetch(
        `${CONFIG.API_BASE_URL}/date-enterprise?date=${date}`,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const data = await response.json();
        if (data.reservas && data.reservas.length > 0) {
          setReservas(data.reservas);
        } else {
          setReservas([]);
          Toast.error("Não há reservas para a data selecionada.");
        }
      } else {
        const errorData = await response.json();
        Toast.error("Erro ao obter reservas por data");
        setReservas([]);
      }
    } catch (error) {
      Toast.error("Erro ao obter reservas por data");
      setReservas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const finalizarReserva = async (id_reserva) => {
    const token = await AsyncStorage.getItem("Authorization");
    const response = await fetch(`${CONFIG.API_BASE_URL}/finalize-reservation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ id_reserva }),
    });
    if (response.status === 200) {
      Toast.success("Reserva finalizada com sucesso");
      fetchReservasByDate(selectedDate); 
    } else {
      Toast.error("Não foi possivel confirmar a reserva");
    }
  };


  const toggleReservaExpand = (reservaId) => {
    setExpandedReservaId(expandedReservaId === reservaId ? null : reservaId);
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    fetchReservasByDate(day.dateString);
  };

  const handleIconPress = (iconName) => {
    setActiveScreen(iconName);
    AsyncStorage.setItem("activeIcon", iconName);
    switch (iconName) {
      case "calendar":
        navigation.navigate("AgendaEmpresa");
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

  const renderItem = ({ item }) => {
    const isExpanded = item.reservaId === expandedReservaId;
    return (
      <View style={styles.item}>
        <TouchableOpacity
          onPress={() => toggleReservaExpand(item.reservaId)}>

          <Text style={styles.header}>Cliente: {item.cliente_nome}</Text>
          <Text style={styles.subheader}>Informações do pet</Text>
          <Text style={styles.text}>Nome: {item.pet_nome}</Text>
          <Text style={styles.text}>Tipo: {item.pet_tipo}</Text>
          <Text style={styles.text}>Raça: {item.pet_raca}</Text>
          <Text style={styles.text}>Porte: {item.pet_porte}</Text>
          <Text style={styles.text}>Informação Adicional: {item.pet_adicional}</Text>
          <Text style={styles.text}>Status: {item.status}</Text>
        </TouchableOpacity>
        {isExpanded && (
          <>
            {item.status !== "finalizada"  || item.status !== "pendente" || item.status !== "cancelada"   && (
              <TouchableOpacity
                onPress={() => finalizarReserva(item.reserva_id)}
                style={styles.finishButton}
              >
                <Text style={styles.finishButtonText}>Finalizar Reserva</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    );
  };

  const markedDates = reservas.reduce((acc, reserva) => {
    if (reserva.datas) {
      reserva.datas.forEach((date) => {
        acc[date] = { marked: true, dotColor: "blue" };
      });
    }
    return acc;
  }, {});

  if (selectedDate) {
    markedDates[selectedDate] = {
      selected: true,
      marked: true,
      selectedColor: "orange",
    };
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reservas da Empresa</Text>
      <ToastManager />
      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        style={styles.calendar}
      />

      {isLoading ? (
        <ActivityIndicator
          style={styles.loading}
          size="large"
          color="#0000ff"
        />
      ) : reservas.length > 0 ? (
        <FlatList
          data={reservas}
          renderItem={renderItem}
          keyExtractor={(item) => item.reserva_id.toString()}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyMessage}>
            Não há reservas para a data selecionada.
          </Text>
        </View>
      )}
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
  title: {
    fontSize: 30,
    marginTop: "10%",
    textAlign: "center",
    fontWeight: "bold",
    color: "#333",
  },
  item: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  subheader: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#888",
  },
  text: {
    fontSize: 16,
    marginBottom: 4,
    color: "#666",
  },
  loading: {
    marginTop: 50,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyMessage: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
    color: "#666",
  },
  calendar: {
    marginTop: "5%",
    marginBottom: 20,
    width: "95%",
    alignSelf: "center",
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
  finishButton: {
    marginTop: 10,
    backgroundColor: "#0056B3",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  finishButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
