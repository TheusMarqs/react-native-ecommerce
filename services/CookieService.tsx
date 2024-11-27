import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const saveUserData = async (userData: any) => {
  try {

    if (Platform.OS === 'web') {
      // Salvar cada informação nos cookies
      console.log(userData)
      saveCookie('id', userData.user_id);
      saveCookie('username', userData.username);
      saveCookie('email', userData.email);
      saveCookie('access_token', userData.access_token);
      saveCookie('refresh_token', userData.refresh_token);
      saveCookie('is_superuser', userData.is_superuser);

      console.log('ID:', await getCookie('id'));
      console.log('Username cookie:', await getCookie('username'));
      console.log('Email cookie:', await getCookie('email'));
      console.log('Access token cookie:', await getCookie('access_token'));
      console.log('Refresh Token cookie:', await getCookie('refresh_token'));

      console.log('Informações salvas com sucesso');


    }
    else {
      // Salvar cada informação no SecureStore
      await SecureStore.setItemAsync('id', userData.user_id);
      await SecureStore.setItemAsync('username', userData.username);
      await SecureStore.setItemAsync('email', userData.email);
      await SecureStore.setItemAsync('access_token', userData.access_token);
      await SecureStore.setItemAsync('refresh_token', userData.refresh_token);
      await SecureStore.setItemAsync('is_superuser', userData.is_superuser);

      console.log('Informações salvas com sucesso');
    }

  } catch (error) {
    console.error('Erro ao salvar dados no SecureStore', error);
  }
};

export const saveCookie = async (name: string, value: string) => {
  if (Platform.OS === 'web') {
    document.cookie = `${name}=${value}; path=/; Secure; SameSite=Strict`;
  }
  else {
    await SecureStore.setItemAsync(name, value);
  }
};

export const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const getCookie = async (name: string) => {
  if (Platform.OS === 'web') {

    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  else {
    const value = await SecureStore.getItemAsync(name);
    return value ? value : null;
  }
};