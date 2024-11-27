import { useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios'; // Importe o Axios
import { getCookie } from '@/services/CookieService';
import { AntDesign } from '@expo/vector-icons'; // Ícones para botões

const AdminChatScreen = () => {
    const params = useLocalSearchParams();
    const [chats, setChats] = useState<string[]>([]); // Lista de chats disponíveis
    const [selectedChat, setSelectedChat] = useState<string | null>(null); // Chat selecionado
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [message, setMessage] = useState<string>(''); // Mensagem a ser enviada
    const [messages, setMessages] = useState<{ sender: string; message: string }[]>([]); // Mensagens do chat
    const [newMessages, setNewMessages] = useState<Record<string, boolean>>({}); // Nova mensagem para cada chat

    // Buscar os chats disponíveis do backend
    useEffect(() => {
        const fetchChats = async () => {
            let token = await getCookie('access_token');
            try {
                const response = await axios.get('https://backend-pm.onrender.com/ws/chats', {
                    headers: {
                        "Authorization": "Bearer " + token,
                    },
                });
                setChats(response.data); // Supondo que o backend retorna uma lista de chats
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

                // Se a mensagem for do cliente, marcar como nova
                if (data.sender !== 'Vendedor') {
                    setNewMessages((prev) => ({
                        ...prev,
                        [selectedChat]: true, // Marca que há uma nova mensagem
                    }));
                }
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
                        <TouchableOpacity
                            style={styles.chatItem}
                            onPress={() => setSelectedChat(item)}
                        >
                            <View style={styles.chatNameContainer}>
                                <Text style={styles.chatName}>{item}</Text>
                                {newMessages[item] && (
                                    <View style={styles.notificationDot} />
                                )}
                            </View>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setSelectedChat(null)} style={styles.backButton}>
                    <AntDesign name="arrowleft" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.chatTitle}>Chat: {selectedChat}</Text>
            </View>

            <FlatList
                data={messages}
                renderItem={({ item }) => (
                    <View
                        style={[
                            styles.messageContainer,
                            item.sender === 'Vendedor'
                                ? styles.adminMessage
                                : styles.clientMessage,
                        ]}
                    >
                        <Text style={styles.message}>
                            <Text style={styles.sender}>{item.sender}: </Text>
                            {item.message}
                        </Text>
                    </View>
                )}
                keyExtractor={(_, index) => index.toString()}
                style={styles.messageList}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Digite sua mensagem..."
                    value={message}
                    onChangeText={setMessage}
                />
                <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                    <AntDesign name="right" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f4f4f4',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 8,
    },
    backButton: {
        marginRight: 10,
    },
    chatTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    chatItem: {
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    chatNameContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    chatName: {
        fontSize: 16,
        color: '#333',
    },
    notificationDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#28a745', // Bolinha verde
    },
    messageList: {
        flex: 1,
        marginBottom: 10,
    },
    messageContainer: {
        padding: 10,
        marginBottom: 15,
        borderRadius: 10,
        maxWidth: '70%',
    },
    adminMessage: {
        backgroundColor: '#007bff', // Mensagem do vendedor
        alignSelf: 'flex-end',
        color: '#fff',
    },
    clientMessage: {
        backgroundColor: '#d1e7dd', // Mensagem do cliente
        alignSelf: 'flex-start',
        borderColor: '#ccc',
        borderWidth: 1,
    },
    message: {
        fontSize: 16,
        color: '#333',
    },
    sender: {
        fontWeight: 'bold',
        color: '#000',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginRight: 10,
        backgroundColor: '#fff',
    },
    sendButton: {
        backgroundColor: '#007bff',
        padding: 12,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AdminChatScreen;
