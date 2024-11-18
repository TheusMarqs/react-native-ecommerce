import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync(); // Impede que a splash screen desapareça automaticamente.

const SplashComponent: React.FC = () => {
  const [fadeAnim] = useState(new Animated.Value(0)); // Animação de fade-in.

  useEffect(() => {
    // Inicia a animação de fade-in.
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000, // 2 segundos para a animação.
      useNativeDriver: true,
    }).start(() => {
      // Esconde a splash screen após a animação.
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 1500); // Mais 1.5 segundos antes de prosseguir.
    });
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      {/* <Animated.Image
        source={require('./assets/logo.png')} // Substitua pelo caminho do seu logo.
        style={[styles.logo, { opacity: fadeAnim }]}
        resizeMode="contain"
      /> */}
      <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
        Bem-vindo ao Meu App
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4CAF50', // Cor de fundo da splash screen.
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default SplashComponent;
