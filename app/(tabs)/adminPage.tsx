import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const adminPage: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Administração</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(tabs)/listSupplier')}
      >
        <Text style={styles.buttonText}>Fornecedores</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(tabs)/listOrders')}
      >
        <Text style={styles.buttonText}>Pedidos</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(tabs)/adminChat')}
      >
        <Text style={styles.buttonText}>Mensagens</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(tabs)/listCategory')}
      >
        <Text style={styles.buttonText}>Categorias</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
  button: {
    width: '80%',
    padding: 15,
    backgroundColor: '#007b5e',
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default adminPage;
