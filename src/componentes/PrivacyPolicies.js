import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, ScrollView, TouchableOpacity, Button } from 'react-native';
import { CheckBox } from 'react-native-elements';

const PrivacyPolicyModal = ({ onCheckedChange }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    onCheckedChange(isChecked);
  }, [isChecked]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={styles.checkboxContainer}>
        <CheckBox
          checked={isChecked}
          onPress={() => setIsChecked(!isChecked)}
        />
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.label}>
            Ao se registrar você confirma que concorda com as
            <Text style={styles.link}> políticas de privacidade</Text>
          </Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Text style={styles.title}>Política de Privacidade da Pets Inn</Text>
              <Text style={styles.text}>
                Última atualização: 11 de junho de 2024
              </Text>
              <Text style={styles.text}>
                A Pets Inn valoriza a privacidade e a segurança dos seus dados pessoais. Esta Política de Privacidade descreve como coletamos, usamos, divulgamos e protegemos as informações dos nossos clientes ao utilizar nossos serviços de reservas de hotéis e creches para pets.
              </Text>
              <Text style={styles.subTitle}>1. Informações Coletadas</Text>
              <Text style={styles.text}>
                Coletamos diferentes tipos de informações para fornecer e melhorar nossos serviços, incluindo:
                - Informações Pessoais: Nome, endereço, e-mail, número de telefone, informações de pagamento, e detalhes sobre o seu pet.
                - Informações de Uso: Dados sobre como você utiliza nossos serviços, incluindo detalhes de reservas e preferências.
              </Text>
              <Text style={styles.subTitle}>2. Uso das Informações</Text>
              <Text style={styles.text}>
                Utilizamos as informações coletadas para:
                - Fornecer e Gerenciar os Serviços: Processar reservas, personalizar a experiência do usuário, e fornecer suporte ao cliente.
                - Comunicação: Enviar confirmações de reserva, atualizações, newsletters, e responder a consultas.
                - Melhoria dos Serviços: Analisar dados para melhorar nossos serviços, desenvolver novos recursos, e realizar pesquisas de mercado.
                - Segurança: Proteger nossos usuários, prevenir fraudes e garantir a segurança dos nossos serviços.
              </Text>
              <Text style={styles.subTitle}>3. Compartilhamento de Informações</Text>
              <Text style={styles.text}>
                Podemos compartilhar suas informações pessoais nas seguintes circunstâncias:
                - Com Terceiros Fornecedores: Compartilhamos dados não sensíveis, como seu nome, com empresas parceiras para proporcionar um melhor atendimento e personalização dos serviços.
                - Conformidade Legal: Divulgaremos suas informações se for necessário para cumprir com a lei, regulamento, processo legal ou solicitação governamental, ou para proteger os direitos, propriedade ou segurança da Pets Inn, nossos clientes ou outros.
              </Text>
              <Text style={styles.subTitle}>4. Segurança das Informações</Text>
              <Text style={styles.text}>
                Implementamos medidas de segurança adequadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, é importante lembrar que nenhum método de transmissão pela internet ou armazenamento eletrônico é 100% seguro.
              </Text>
              <Text style={styles.subTitle}>5. Seus Direitos</Text>
              <Text style={styles.text}>
                Você tem o direito de:
                - Acessar e Corrigir Seus Dados: Solicitar acesso às suas informações pessoais e corrigir qualquer dado incorreto.
                - Excluir Seus Dados: Solicitar a exclusão das suas informações pessoais, sujeito a certas exceções legais.
              </Text>
              <Text style={styles.subTitle}>6. Alterações nesta Política de Privacidade</Text>
              <Text style={styles.text}>
                Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças em nossas práticas ou por outros motivos operacionais, legais ou regulamentares. Notificaremos você sobre quaisquer alterações publicando a nova Política de Privacidade em nosso site.
              </Text>
              <Text style={styles.subTitle}>7. Contato</Text>
              <Text style={styles.text}>
                Se você tiver alguma dúvida ou preocupação sobre esta Política de Privacidade ou sobre nossas práticas de privacidade, fique a vontade de entrar em contato conosco.
                
              </Text>
              <Button
                title="Fechar"
                onPress={() => setModalVisible(false)}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  label: {
    marginLeft: 10,
    fontSize: 16,
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
});

export default PrivacyPolicyModal;
