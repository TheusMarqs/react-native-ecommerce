import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';
import axios from 'axios';
import { saveUserData } from '../../services/CookieService';
import AwesomeAlert from 'react-native-awesome-alerts';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Função para validar o formato de email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Função para realizar o registro via API
  const handleRegister = async () => {
    if (!username || !email || !firstName || !lastName || !password) {
      setAlertMessage('Por favor, preencha todos os campos.');
      setShowAlert(true);
      return;
    }

    if (username.length < 4) {
      setAlertMessage('O nome de usuário deve ter no mínimo 4 caracteres.');
      setShowAlert(true);
      return;
    }

    if (!isValidEmail(email)) {
      setAlertMessage('Por favor, insira um email válido.');
      setShowAlert(true);
      return;
    }

    if (password.length < 8) {
      setAlertMessage('A senha deve ter no mínimo 8 caracteres.');
      setShowAlert(true);
      return;
    }

    try {
      // Envia os dados para a API
      const response = await axios.post(
        'http://127.0.0.1:8000/auth/register',
        {
          username,
          email,
          first_name: firstName,
          last_name: lastName,
          password,
        },
        {
          // Permite tratar os erros manualmente
          validateStatus: () => true,
        }
      );

      console.log(response);

      if (response.status === 201) {
        const userData = response.data;

        await saveUserData(userData);

        router.dismissAll();
        router.replace('/(tabs)/');
      }

      else {
        var error = response.data.error

        if (error == 'Erro desconhecido: UNIQUE constraint failed: auth_user.username') {
          setAlertMessage('Este nome de usuário ja esta em uso.')
        }
        else {
          setAlertMessage(error);
        }
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage('Falha ao cadastrar. Tente novamente mais tarde.');
      setShowAlert(true);
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome de usuário"
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Primeiro nome"
        placeholderTextColor="#aaa"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Sobrenome"
        placeholderTextColor="#aaa"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerButtonText}>Cadastrar</Text>
      </TouchableOpacity>

      <Link href="/(tabs)/login" style={styles.loginLink}>
        <Text style={styles.loginLinkText}>Já possui uma conta? Faça login</Text>
      </Link>

      {/* Alerta de Erro */}
      <AwesomeAlert
        show={showAlert}
        title="Erro!"
        message={alertMessage}
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        confirmText="OK"
        confirmButtonColor="#F44336"
        onConfirmPressed={() => setShowAlert(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
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
  registerButton: {
    backgroundColor: '#007b5e',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 15,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#007b5e',
    fontSize: 16,
  },
});

export default Register;
