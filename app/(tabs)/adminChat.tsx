import { useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios'; // Importe o Axios

const AdminChatScreen = () => {
    const params = useLocalSearchParams();
    const [chats, setChats] = useState<string[]>([]); // Lista de chats disponíveis
    const [selectedChat, setSelectedChat] = useState<string | null>(null); // Chat selecionado
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<{ sender: string; message: string }[]>([]);

    // Buscar os chats disponíveis do backend
    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await axios.get('https://backend-pm.onrender.com/ws/chats');
                setChats(response.data); // Supondo que o backend retorna uma lista de strings
            } catch (error) {
                console.error('Erro ao buscar os chats:', error);
            }
        };

        fetchChats();
    }, []);

    // Conectar ao WebSocket quando um chat for selecionado
    useEffect(() => {
        if (selectedChat) {
            const ws = new WebSocket(`wss://backend-pm.onrender.com/ws/chat/${selectedChat}/`);

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('Received data:', data);
                setMessages((prev) => [
                    ...prev,
                    { sender: data.sender || 'Unknown', message: data.message },
                ]);
            };

            setSocket(ws);

            return () => {
                ws.close();
                setMessages([]); // Limpar mensagens ao sair do chat
            };
        }
    }, [selectedChat]);

    const sendMessage = () => {
        if (socket && message.trim()) {
            const messagePayload = {
                message,
                sender: 'Vendedor', // Enviar como administrador
            };

            console.log('Sending message:', messagePayload);
            socket.send(JSON.stringify(messagePayload));
            setMessage('');
        }
    };

    if (!selectedChat) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Chats Disponíveis</Text>
                <FlatList
                    data={chats}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.chatItem} onPress={() => setSelectedChat(item)}>
                            <Text style={styles.chatName}>{item}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Chat: {selectedChat}</Text>
            <FlatList
                data={messages}
                renderItem={({ item }) => (
                    <Text style={styles.message}>
                        <Text style={styles.sender}>{item.sender}: </Text>
                        {item.message}
                    </Text>
                )}
                keyExtractor={(_, index) => index.toString()}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Digite sua mensagem..."
                    value={message}
                    onChangeText={setMessage}
                />
                <Button title="Enviar" onPress={sendMessage} />
            </View>
            <Button title="Voltar" onPress={() => setSelectedChat(null)} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    chatItem: {
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: '#f9f9f9',
    },
    chatName: {
        fontSize: 16,
    },
    message: {
        padding: 5,
        fontSize: 16,
    },
    sender: {
        fontWeight: 'bold',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
    },
});

export default AdminChatScreen;
