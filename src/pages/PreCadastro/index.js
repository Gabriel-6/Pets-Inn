import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';


export default function PreCadastro() {
  const navigation = useNavigation();

  const handleNavigation = (tipo) => {
    if (tipo === 'cliente') {
      navigation.navigate('CadastroCliente');
    } else if (tipo === 'estabelecimento') {
      navigation.navigate('CadastroEstabelecimento');
    }
  };

  const goToSignIn = () => {
    navigation.navigate('SignIn')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolha uma opção:</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleNavigation('cliente')}
      >
        <Text style={styles.buttonText}>Sou Cliente</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleNavigation('estabelecimento')}
      >
        <Text style={styles.buttonText}>Sou Estabelecimento</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcfcf2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#11021E',
    width: '80%',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
