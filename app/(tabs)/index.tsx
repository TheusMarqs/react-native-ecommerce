import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import SplashComponent from '../../components/SplashComponent';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import { getCookie, saveCookie } from '../../services/CookieService';
import { getNewAccessToken } from '../../services/TokenService';

SplashScreen.preventAutoHideAsync(); // Impede a auto-desaparecer da splash screen.

export default function HomeScreen() {
  const [appReady, setAppReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // Estado de login

  useEffect(() => {
    // Função para verificar o login do usuário
    const verifyLogin = async () => {
      const accessToken = await getCookie('access_token');
      
      try {
        if (accessToken !== null) {
          console.log(accessToken);
          const tokenResponse = await axios.post(
            'https://backend-pm.onrender.com/token/verify',
            { "token": accessToken },
            {
              validateStatus: () => true,
            }
          );

          console.log('Response:', tokenResponse);

          if (tokenResponse.status === 200) {
            console.log('User authenticated!');
            setIsLoggedIn(true);
            setAppReady(true);
            return;
          }

          // Se o token for inválido, tente o refresh
          if (tokenResponse.status === 401) {
            console.log('User not authenticated!');

            const newToken = await getNewAccessToken();

            if (newToken !== null) {
              setIsLoggedIn(true);
              saveCookie('access_token', newToken);  // Armazenar o novo token
              setAppReady(true);
            } else {
              setIsLoggedIn(false);
              setAppReady(true);
            }
          }
        } else {
          setIsLoggedIn(false);
          setAppReady(true);
        }
      } catch (error) {
        console.log(error);
        setIsLoggedIn(false);
        setAppReady(true);
      }
    };

    verifyLogin();
  }, []);

  useEffect(() => {
    // Redirecionar para a tela correta após o estado de login ser determinado
    if (appReady) {
      if (isLoggedIn) {
        router.replace('/(tabs)/listProduct');
      } else {
        router.replace('/login');  // Ou a tela de login que você está usando
      }
    }
  }, [appReady, isLoggedIn]);

  if (!appReady) {
    return <SplashComponent />; // Mostra a tela de splash enquanto verifica o login
  }

  return null; // Após a verificação, o componente não renderiza nada por si só
}
