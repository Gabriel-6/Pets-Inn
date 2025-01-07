import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";

import Welcome from "../pages/Welcome";
import SignIn from "../pages/SignIn";
import PreCadastro from "../pages/PreCadastro";
import CadastroCliente from "../pages/CadastroCliente";
import CadastroPet from "../pages/CadastroPet";
import CadastroEstabelecimento from "../pages/CadastroEstabelecimento";
import Home from "../pages/Home";
import Perfil from "../pages/Perfil";
import Favoritos from "../pages/Favoritos";
import Mensagens from "../pages/Mensagens";
import Agendamentos from "../pages/Agendamentos";
import InformacoesCliente from "../pages/InformacoesCliente";
import InformacoesPet from "../pages/InformacoesPet";
import InformacoesEmpresa from "../pages/InformacoesEmpresa";
import Enterprise from "../pages/DetalhesEmpresa";
import ForgotPassword from "../pages/ForgotPassword";
import PerfilCliente from "../pages/PerfilCliente";
import PerfilEstabelecimento from "../pages/PerfilEstabelecimento";
import InformacoesAgendamentos from "../pages/InformacoesAgendamentos";
import AgendaEmpresa from "../pages/AgendaEmpresa";
import PreMensagem from "../pages/PreMensagem";

const Stack = createNativeStackNavigator();

export default function Router() {
  return (
    <Stack.Navigator>

      <Stack.Screen
        name="Welcome"
        component={Welcome}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="SignIn"
        component={SignIn}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="PreCadastro"
        component={PreCadastro}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="CadastroPet"
        component={CadastroPet}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="CadastroCliente"
        component={CadastroCliente}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="CadastroEstabelecimento"
        component={CadastroEstabelecimento}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Perfil"
        component={Perfil}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Favoritos"
        component={Favoritos}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="PreMensagens"
        component={Mensagens}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Mensagens"
        component={PreMensagem}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Agendamentos"
        component={Agendamentos}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="AgendaEmpresa"
        component={AgendaEmpresa}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="InformacoesCliente"
        component={InformacoesCliente}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="InformacoesPet"
        component={InformacoesPet}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Enterprise"
        component={Enterprise}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPassword}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="PerfilCliente"
        component={PerfilCliente}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="PerfilEstabelecimento"
        component={PerfilEstabelecimento}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="InformacoesEmpresa"
        component={InformacoesEmpresa}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="InformacoesAgendamentos"
        component={InformacoesAgendamentos}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}