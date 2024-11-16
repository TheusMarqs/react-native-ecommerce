import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { saveUserData } from '../services/cookie_service';
import AwesomeAlert from 'react-native-awesome-alerts';

const login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('error'); // Para controlar se o alerta é de sucesso ou erro

  const handleLogin = async () => {
    if (username && password) {
      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/auth/login',
          {
            'username': username,
            'password': password
          },
          {
            // Não rejeita a Promise em casos de erro HTTP
            validateStatus: (status) => status >= 200 && status < 300 // ou definir os códigos de status que você deseja tratar
          }
        );

        console.log(response);
        console.log(response.status)

        if (response.status === 200) {
          const userData = response.data;
          await saveUserData(userData);
          router.dismissAll();
          router.replace('/(tabs)/');

        } else if (response.status === 401) {
          setAlertType('error');
          setAlertMessage('Credenciais incorretas. Tente novamente.');
          setShowAlert(true);
        }
      } catch (error) {
        console.error(error);
        setAlertType('error');
        setAlertMessage('Ocorreu um erro. Tente novamente mais tarde.');
        setShowAlert(true);
      }
    } else {
      console.error('Preencha todos os campos');
      setAlertType('error');
      setAlertMessage('Por favor, preencha todos os campos.');
      setShowAlert(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo de volta!</Text>
      <Text style={styles.subtitle}>Faça login para continuar</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={setUsername}
        value={username}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#aaa"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Entrar</Text>
      </TouchableOpacity>

      <Link href="/register" style={styles.registerLink}>
        <Text style={styles.registerLinkText}>Não tem uma conta? Cadastre-se</Text>
      </Link>

      {/* Alerta de Sucesso ou Erro */}
      <AwesomeAlert
        show={showAlert}
        title={alertType === 'success' ? 'Sucesso!' : 'Erro!'}
        message={alertMessage}
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        confirmText="OK"
        confirmButtonColor={alertType === 'success' ? '#4CAF50' : '#F44336'}
        onConfirmPressed={() => setShowAlert(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  loginButton: {
    backgroundColor: '#007b5e',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: 15,
    alignItems: 'center',
  },
  registerLinkText: {
    color: '#007b5e',
    fontSize: 16,
  },
});

export default login;
