import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import ProductList from '@/components/ProductList';
import SplashComponent from '../../components/SplashComponent';
import { router } from 'expo-router';
import axios from 'axios';
import { getCookie, saveCookie } from '../services/CookieService';

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
            'http://127.0.0.1:8000/token/verify',
            { token: accessToken },
            {
              validateStatus: () => true,
            }
          );

          console.log('Response:', tokenResponse);

          if (tokenResponse.status === 200) {
            console.log('User authenticated!');
            setIsLoggedIn(true); // Usuário autenticado
            return;
          }

          // Se o token for inválido, tente o refresh
          if (tokenResponse.status === 401) {
            console.log('User not authenticated!');

            const refreshToken = getCookie('refresh_token');
            if (refreshToken !== null) {
              try {
                const refreshResponse = await axios.post(
                  'http://127.0.0.1:8000/token/refresh',
                  { refresh: refreshToken },
                  {
                    validateStatus: () => true,
                  }
                );

                console.log('RefreshResponse:', refreshResponse);

                if (refreshResponse.status === 200) {
                  console.log('Access token refreshed successfully');
                  const newToken = refreshResponse.data.access;
                  saveCookie('access_token', newToken);
                  setIsLoggedIn(true); // Usuário autenticado após refresh
                } else if (refreshResponse.status === 401) {
                  console.log('Invalid refresh token');
                  setIsLoggedIn(false); // Token de refresh inválido
                }
              } catch (e) {
                console.log(e);
                setIsLoggedIn(false); // Erro na tentativa de refresh
              }
            } else {
              setIsLoggedIn(false); // Nenhum token de refresh disponível
            }
          }
        } else {
          setIsLoggedIn(false); // Não há token de acesso
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

  if (!appReady) {
    return <SplashComponent />;
  }

  if (isLoggedIn === null) {
    // Enquanto aguardamos a resposta da verificação de login
    return <SplashComponent />;
  }

  // Se o usuário estiver logado, exibe o ProductList
  if (isLoggedIn) {
    return <ProductList />;
  }

  return (
    router.dismissAll(),
    router.replace('/(tabs)/login')
  );
}
