import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const saveUserData = async (userData: any) => {
    try {

      if (Platform.OS === 'web') {
        // Salvar cada informação nos cookies
        saveCookie('username', userData.username);
        saveCookie('email', userData.email);
        saveCookie('authToken', userData.access_token);

        // Recuperar e exibir os cookies logo após salvar
        console.log('Username cookie:', getCookie('username'));
        console.log('Email cookie:', getCookie('email'));
        console.log('Auth Token cookie:', getCookie('authToken'));

        console.log('Informações salvas com sucesso');


      }
      else {
        // Salvar cada informação no SecureStore
        await SecureStore.setItemAsync('username', userData.username);
        await SecureStore.setItemAsync('email', userData.email);
        // Exemplo de token, substitua pelo seu token real após o login
        await SecureStore.setItemAsync('authToken', userData.access_token);
        console.log('Informações salvas com sucesso');
      }

    } catch (error) {
      console.error('Erro ao salvar dados no SecureStore', error);
    }
  };

export const saveCookie = (name: string, value: string) => {
    document.cookie = `${name}=${value}; path=/; Secure; HttpOnly; SameSite=Strict`;
};

export const getCookie = (name: string) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};