import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Button,
  Switch,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomCalendar from "../../componentes/CustomCalendar";
import CONFIG from "../../utils/config";
import { AirbnbRating } from "react-native-ratings";
import ToastManager, { Toast } from "toastify-react-native";

const EnterpriseScreen = ({ route, navigation }) => {
  const { empresaId } = route.params;
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [allReviews, setAllReviews] = useState([]);
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);

  const customCalendarRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${CONFIG.API_BASE_URL}/getEnterprise/${empresaId}`
        );
        if (!response.ok) {
          throw new Error("Erro ao buscar empresas");
        }
        const data = await response.json();
        setEmpresa(data);
        setRating(data.rating || 0);
        setLoading(false);
      } catch (error) {
        Alert.alert("Erro", error.message);
        setLoading(false);
      }
    };
    fetchData();

    const fetchFavoriteStatus = async () => {
      try {
        const value = await AsyncStorage.getItem(`favorite_${empresaId}`);
        if (value !== null) {
          setIsFavorite(JSON.parse(value));
        }
      } catch (error) {
        console.log("Erro ao recuperar estado de favorito:", error);
      }
    };
    fetchFavoriteStatus();

    const fetchPets = async () => {
      try {
        const token = await AsyncStorage.getItem("Authorization");
        const response = await fetch(`${CONFIG.API_BASE_URL}/select-pet`, {
          method: "GET",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setPets(data);
        if (data.length === 1) {
          setSelectedPet(data[0].id);
        }
      } catch {
        console.error("Erro ao buscar pets:", error);
      }
    };
    fetchPets();
  }, [empresaId]);

  useEffect(() => {
    const fetchCanReview = async () => {
      try {
        const token = await AsyncStorage.getItem("Authorization");
        const response = await fetch(`${CONFIG.API_BASE_URL}/can-review`, {
          method: "GET",
          headers: {
            Authorization: token,
            Local: empresaId,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        setCanReview(data.can_review);
      } catch (error) {
        console.error("Erro ao verificar se pode avaliar:", error);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `${CONFIG.API_BASE_URL}/get-reviews/${empresaId}`
        );
        if (!response.ok) {
          throw new Error("Falha ao buscar avaliações");
        }
        const data = await response.json();
        setAllReviews(data);
      } catch (error) {
        console.error("Erro ao buscar avaliações:", error);
      }
    };

    fetchCanReview();
    fetchReviews();
  }, [empresaId]);

  const handleReserve = () => {
    if (empresa[0].servico === "ambos" && !selectedService) {
      Toast.error("É necessário selecionar o tipo do serviço");
      return;
    }
    if (customCalendarRef.current) {
      const markedDates = customCalendarRef.current.getMarkedDates();
      const days = Object.keys(markedDates);
      const numDays = days.length;
      setSelectedDays(days);

      const valorReserva = numDays * empresa[0].preco;
      setTotalPrice(valorReserva);
      setCalendarVisible(false);
    }
  };

  const handleServiceSelection = (service) => {
    setSelectedService(service);
  };

  const toggleCalendarVisibility = () => {
    setCalendarVisible(!calendarVisible);
  };

  const handleToggleFavorite = async () => {
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);

    const storageKey = `favorite_${empresaId}`;

    if (newFavoriteState) {
      await AsyncStorage.setItem(storageKey, JSON.stringify(newFavoriteState));
    } else {
      await AsyncStorage.removeItem(storageKey);
    }
  };

  const setService = (service) => {
    const serv = service === "ambos" ? "Hotel e Creche" : service;
    return serv;
  };

  const handleReserveConfirmation = async () => {
    try {
      const token = await AsyncStorage.getItem("Authorization");

      if (!token) {
        Alert.alert(
          "Aviso",
          "Para realizar a reserva é necessário realizar login"
        );
        navigation.navigate("SignIn");
        return;
      }

      if (pets.length === 0) {
        Alert.alert(
          "Aviso",
          "Você não possui nenhum pet cadastrado. Por favor, cadastre um pet antes de realizar a reserva."
        );
        return;
      }

      if (!selectedPet) {
        Toast.error("É necessário selecionar um pet");
        return;
      }

      const numDays = selectedDays.length;
      const valorReserva = numDays * empresa[0].preco;

      const dadosReserva = {
        datas: selectedDays,
        id: empresaId,
        pet_id: selectedPet,
      };

      const response = await fetch(`${CONFIG.API_BASE_URL}/reserva`, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosReserva),
      });

      const data = await response.json()
      console.log(data)

      if (!response.ok) {
        throw new Error("Erro ao enviar reserva para o servidor");
      }

      if (response.status === 200) {
        Alert.alert("Sucesso", "Reserva realizada com sucesso.");
      }
      
    } catch (error) {
      Alert.alert("Limite de Reservas Alcançado",
        "Não é possível realizar a reserva porque o número máximo de reservas para a data selecionada foi alcançado. Por favor, escolha uma data diferente ou tente novamente mais tarde.")
    }
  };

  const handleRating = (rating) => {
    setRating(rating);
  };

  const renderItem = ({ item }) => (
    <View style={styles.reviewContainer}>
      <Text style>Nome: {item.id_usuario}</Text>
      <AirbnbRating
        defaultRating={item.rating}
        reviews={["Péssimo", "Ruim", "Bom", "Muito Bom", "Excelente"]}
        size={20}
        isDisabled
      />
      <Text>Título: {item.titulo}</Text>
      <Text>Comentário: {item.comentario}</Text>
    </View>
  );

  const submitReview = async () => {
    if (!title || !review || rating === 0) {
      Toast.error("Preencha todos os campos antes de enviar a avaliação.");
      return;
    }

    const reviewData = {
      rating,
      title,
      review,
      anonymous,
      empresaId,
    };

    const token = await AsyncStorage.getItem("Authorization");
    const response = await fetch(`${CONFIG.API_BASE_URL}/submit-review`, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
    });

    if (response.status === 200) {
      setTitle("");
      setReview("");
      setRating(0);
      Toast.success("Avaliação enviada com sucesso");

      const reviewsResponse = await fetch(
        `${CONFIG.API_BASE_URL}/get-reviews/${empresaId}`
      );
      const reviewsData = await reviewsResponse.json();
      setAllReviews(reviewsData);
    } else {
      Toast.error("Erro ao enviar Avaliação");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (!empresa) {
    return (
      <View style={styles.container}>
        <Text>Nenhuma informação encontrada para esta empresa.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ToastManager />
      <Image
        source={{ uri: empresa[0].logo }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.contentContainer}>
        <Text style={styles.enterpriseName}>{empresa[0].nome}</Text>
        <Text style={styles.sectionTitle}>Descrição</Text>
        <Text style={styles.descriptionText}>{empresa[0].descricao}</Text>
        <Text style={styles.sectionTitle}>Serviço Oferecido</Text>
        <Text style={styles.serviceText}>{setService(empresa[0].servico)}</Text>
        <Text style={styles.sectionTitle}>Preço</Text>
        <Text style={styles.descriptionText}>{empresa[0].preco}</Text>

        {pets.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Selecione o Pet:</Text>
            {pets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={[
                  styles.serviceButton,
                  selectedPet === pet.id && { backgroundColor: "#FFA500" },
                ]}
                onPress={() => setSelectedPet(pet.id)}
              >
                <Text style={styles.buttonText}>{pet.nome}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {empresa[0].servico === "ambos" && (
          <View>
            <Text style={styles.sectionTitle}>Escolha o Serviço:</Text>
            <TouchableOpacity
              style={[
                styles.serviceButton,
                selectedService === "Hotel" && {
                  backgroundColor: "#FFA500",
                },
              ]}
              onPress={() => handleServiceSelection("Hotel")}
            >
              <Text style={styles.buttonText}>Hotel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.serviceButton,
                selectedService === "Creche" && {
                  backgroundColor: "#FFA500",
                },
              ]}
              onPress={() => handleServiceSelection("Creche")}
            >
              <Text style={styles.buttonText}>Creche</Text>
            </TouchableOpacity>
          </View>
        )}

        {calendarVisible && (
          <CustomCalendar
            ref={customCalendarRef}
            title="Selecione o Período"
            onDayPress={() => console.log()}
          />
        )}

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: calendarVisible ? "#FFA500" : "#FFA500" },
          ]}
          onPress={calendarVisible ? handleReserve : toggleCalendarVisibility}
        >
          <Text style={styles.buttonText}>
            {calendarVisible ? "Confirmar" : "Selecionar Dias"}
          </Text>
        </TouchableOpacity>

        {selectedDays.length > 0 && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#FFA500" }]}
            onPress={handleReserveConfirmation}
          >
            <Text style={styles.buttonText}>
              {`Confirmar Reserva (${selectedDays.length} dia(s) por R$ ${totalPrice})`}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("Home")}
      >
        <Icon name="arrow-left" size={24} color="#FFA500" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={handleToggleFavorite}
      >
        <Icon name="heart" size={24} color={isFavorite ? "#FF6347" : "#fff"} />
      </TouchableOpacity>

      {canReview ? (
        <View style={{ flex: 1 }}>
          <View style={styles.reviewContainer}>
            <Text style={styles.title}>Deixe sua Avaliação</Text>
            <AirbnbRating
              count={5}
              reviews={["Péssimo", "Ruim", "Bom", "Muito Bom", "Excelente"]}
              defaultRating={0}
              size={40}
              onFinishRating={handleRating}
            />
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Título da avaliação..."
            />
            <TextInput
              style={[styles.input, styles.reviewInput]}
              value={review}
              onChangeText={setReview}
              placeholder="Escreva sua avaliação..."
              multiline
            />
            <View style={styles.anonymousContainer}>
              <Text style={styles.anonymousText}>Enviar de forma anônima</Text>
              <Switch value={anonymous} onValueChange={setAnonymous} />
            </View>
            <Button title="Enviar Avaliação" onPress={submitReview} />
          </View>
        </View>
      ) : (
        <View style={styles.noReviewContainer}>
          <Text style={styles.title}>
            Você não pode deixar uma avaliação no momento.
          </Text>
        </View>
      )}

      <FlatList
        data={allReviews}
        renderItem={renderItem}
        keyExtractor={(item) => item.id_avaliacao}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fcfcf2",
  },
  image: {
    width: "100%",
    height: 200,
    marginBottom: 12,
  },
  contentContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  enterpriseName: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
  },
  descriptionText: {
    fontSize: 16,
    textAlign: "justify",
    marginBottom: 12,
  },
  serviceText: {
    fontSize: 16,
    textTransform: "capitalize",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  selectedDaysText: {
    marginTop: 10,
    textAlign: "center",
  },
  backButton: {
    position: "absolute",
    top: 25,
    left: 20,
    zIndex: 1,
  },
  favoriteButton: {
    position: "absolute",
    top: 25,
    right: 20,
    zIndex: 1,
  },
  serviceButton: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  reviewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  noReviewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    width: "100%",
    marginBottom: 10,
  },
  reviewInput: {
    height: 100,
  },
  anonymousContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  anonymousText: {
    marginRight: 10,
  },
  reviewTitle: {
    textAlign: "left",
  },
});

export default EnterpriseScreen;
