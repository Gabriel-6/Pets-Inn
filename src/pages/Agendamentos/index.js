import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome";
import BottomIcons from "../../componentes/BottomIcons";
import ToastManager, { Toast } from "toastify-react-native";
import CONFIG from "../../utils/config";

export default function Agendamentos() {
  const navigation = useNavigation();
  const [activeIcon, setActiveIcon] = useState("calendar");
  const [reservas, setReservas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedReservaId, setExpandedReservaId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filter, setFilter] = useState(null);
  const [hasReservas, setHasReservas] = useState(false);
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
    fetchReservas();
  }, []);

  const transformData = (data) => {
    return Object.keys(data).map((key) => ({
      id: data[key].reserva_id,
      reservaId: data[key].reserva_id,
      localNome: data[key].local_nome,
      status: data[key].status,
      logo: data[key].logo,
      datas: data[key].datas_reserva.map(formatDate),
    }));
  };

  const cancelarReserva = async (id_reserva) => {
    const token = await AsyncStorage.getItem("Authorization");
    const response = await fetch(`${CONFIG.API_BASE_URL}/cancel-reservation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ id_reserva }),
    });
    if (response.status === 200) {
      Toast.success("Reserva cancelada com sucesso");
      fetchReservas(); 
    } else {
      Toast.error("Não foi possivel cancelar a reserva");
    }
  };

  const confirmarReserva = async (id_reserva) => {
    const token = await AsyncStorage.getItem("Authorization");
    const response = await fetch(`${CONFIG.API_BASE_URL}/confirm-reservation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ id_reserva }),
    });
    if (response.status === 200) {
      Toast.success("Reserva confirmada com sucesso");
      fetchReservas(); 
    } else {
      Toast.error("Não foi possivel confirmar a reserva");
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

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const fetchReservas = async () => {
    try {
      const token = await AsyncStorage.getItem("Authorization");

      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);
      const response = await fetch(`${CONFIG.API_BASE_URL}/reserva-data`, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      const processedReservas = transformData(data);
      setReservas(processedReservas);
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao obter reservas:", error);
      setIsLoading(false);
    }
  };

  const toggleReservaExpand = (reservaId) => {
    setExpandedReservaId((prevId) => (prevId === reservaId ? null : reservaId));
  };

  const renderItem = ({ item }) => {
    const isExpanded = item.reservaId === expandedReservaId;

    return (
      <View style={styles.reservaContainer}>
        <ToastManager />
        <TouchableOpacity
          onPress={() => toggleReservaExpand(item.reservaId)}
          style={[styles.item]}
        >
          <Image source={{ uri: item.logo }} style={styles.imageCard} />
          <Text style={styles.subTitle}>Nome da Empresa: {item.localNome}</Text>
          <Text style={[styles.status]}>Status: {item.status}</Text>
          {isExpanded && (
            <View style={styles.datesContainer}>
              {item.datas.map((data, index) => (
                <Text key={index} style={styles.date}>
                  {data}
                </Text>
              ))}
            </View>
          )}
        </TouchableOpacity>
        {isExpanded && (
          <>
            {item.status !== "cancelada" && (
              <TouchableOpacity
                onPress={() => cancelarReserva(item.reservaId)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancelar Reserva</Text>
              </TouchableOpacity>
            )}
            {item.status !== "confirmada" && (
              <TouchableOpacity
                onPress={() => confirmarReserva(item.reservaId)}
                style={styles.confirmButton}
              >
                <Text style={styles.cancelButtonText}>Confirmar Reserva</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    );
  };

  const filteredReservas = filter
    ? reservas.filter((reserva) => reserva.status === filter)
    : reservas;
  const hasFilteredReservas = filteredReservas.length > 0;

  useEffect(() => {
    setHasReservas(reservas.length > 0);
  }, [reservas]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reservas</Text>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilter("confirmada")}
        >
          <Text>Confirmada</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilter("pendente")}
        >
          <Text>Pendente</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilter("cancelada")}
        >
          <Text>Cancelada</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilter("finalizada")}
        >
          <Text>Finalizada</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator
          style={styles.loading}
          size="large"
          color="#0000ff"
        />
      ) : hasFilteredReservas ? (
        <FlatList
          data={filteredReservas}
          renderItem={renderItem}
          keyExtractor={(item) => item.reservaId.toString()}
          contentContainerStyle={styles.list}
        />
      ) : hasReservas ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyMessage}>
            Não há reservas para o filtro selecionado.
          </Text>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyMessage}>
            Você ainda não possui reservas. Assim que realizar uma reserva, ela
            aparecerá aqui.
          </Text>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.searchButtonText}>Começar a busca</Text>
          </TouchableOpacity>
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
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 70,
  },
  title: {
    fontSize: 30,
    marginTop: 10,
    marginLeft: "6%",
    marginBottom: "3%",
  },
  subTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  item: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  datesContainer: {
    marginTop: 10,
  },
  date: {
    fontSize: 16,
    marginBottom: 5,
  },
  loading: {
    marginTop: 50,
  },
  bottomIcons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fcfcf2",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#C5C5BC",
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
    color: "#888",
  },
  searchButton: {
    backgroundColor: "#FB7B19",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 10,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
  contentAgenda: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  reservaContainer: {
    borderRadius: 8,
    overflow: "hidden",
  },
  cancelButton: {
    backgroundColor: "#FF0000",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 5,
  },
  confirmButton: {
    backgroundColor: "#008000",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 5,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  filterButton: {
    padding: 10,
    backgroundColor: "#ccc",
    borderRadius: 5,
  },
  imageCard: {
    width: "100%",
    height: 160,
    marginBottom: 12,
  },
});