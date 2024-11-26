import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import SplashComponent from '../../components/SplashComponent';
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
      const accessToken = getCookie('access_token');

      try {
        if (accessToken !== null) {
          const tokenResponse = await axios.post(
            'https://backend-pm.onrender.com/token/verify',
            { token: accessToken },
            {
              validateStatus: () => true,
            }
          );

          console.log('Response:', tokenResponse);

          if (tokenResponse.status === 200) {
            console.log('User authenticated!');
            setIsLoggedIn(true);
            return;
          }

          // Se o token for inválido, tente o refresh
          if (tokenResponse.status === 401) {
            console.log('User not authenticated!');

            const newToken = await getNewAccessToken();

            if (newToken !== null) {
              setIsLoggedIn(true);
            }

            else {
              setIsLoggedIn(false);
            }

          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.log(error);
        setIsLoggedIn(false); // Erro na verificação
      }
    };

    // Função para carregar dados e preparar o estado
    const prepare = async () => {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Aguarda 3 segundos, simula o carregamento
      await verifyLogin(); // Verifica se o usuário está logado
      setAppReady(true); // Marca o app como pronto
    };

    prepare();
  }, []); // Dependências vazias para garantir que a verificação aconteça apenas uma vez

  // if (!appReady) {
  //   return <SplashComponent />;
  // }

  // if (isLoggedIn === null) {
  //   // Enquanto aguardamos a resposta da verificação de login
  //   return <SplashComponent />;
  // }

  // // Se o usuário estiver logado, exibe o ProductList
  // if (isLoggedIn) {
  //   return (
  //     router.dismissAll(),
  //     router.replace('/(tabs)/listProduct')
  //   )
  // }

  return (
    router.dismissAll(),
    router.replace('/(tabs)/login')
  );
}
