import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios'; // Importe o Axios
import { getCookie } from '@/services/CookieService';
import { AntDesign } from '@expo/vector-icons'; // Ícones para botões
import AwesomeAlert from 'react-native-awesome-alerts'; // Importe o AwesomeAlert

const AdminChatScreen = () => {
    const [chats, setChats] = useState<string[]>([]);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<{ sender: string; message: string }[]>([]);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

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
                setChats(response.data);
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
                sender: 'Vendedor',
            };
            socket.send(JSON.stringify(messagePayload));
            setMessage('');
        }
    };

    const handleDeleteChat = async (chat: string) => {
        let token = await getCookie('access_token');
        try {
            const response = await axios.delete(
                `https://backend-pm.onrender.com/ws/delete/${chat}`,
                {
                    headers: {
                        "Authorization": "Bearer " + token,
                    },
                }
            );
            setAlertMessage(response.data.success);
            setShowAlert(true);

            // Atualizar a lista de chats
            setChats((prev) => prev.filter((c) => c !== chat));
        } catch (error) {
            console.error('Erro ao deletar o chat:', error);
            setAlertMessage("Não foi possível deletar o chat.");
            setShowAlert(true);
        }
    };

    if (!selectedChat) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Chats Disponíveis</Text>
                <FlatList
                    data={chats}
                    renderItem={({ item }) => (
                        <View style={styles.chatItem}>
                            <Text>Chat {item}</Text>
                            <View style={styles.chatActions}>
                                <TouchableOpacity
                                    style={styles.enterChatButton}
                                    onPress={() => setSelectedChat(item)}
                                >
                                    <AntDesign name="rightcircleo" size={20} color="#007bff" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.deleteChatButton}
                                    onPress={() => handleDeleteChat(item)} // Função para excluir o chat
                                >
                                    <AntDesign name="closecircleo" size={20} color="red" />
                                </TouchableOpacity>
                            </View>
                        </View>
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
                            item.sender === 'Vendedor' ? styles.adminMessage : styles.clientMessage,
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

            <AwesomeAlert
                show={showAlert}
                showProgress={false}
                title="Resultado"
                message={alertMessage}
                closeOnTouchOutside={true}
                closeOnHardwareBackPress={false}
                showCancelButton={false}
                showConfirmButton={true}
                confirmText="OK"
                confirmButtonColor="#007bff"
                onConfirmPressed={() => setShowAlert(false)}
            />
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    chatActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    enterChatButton: {
        marginRight: 10,
    },
    deleteChatButton: {},
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
        backgroundColor: '#d1e7dd', // Mensagem do vendedor
        alignSelf: 'flex-end',
        color: '#fff',
    },
    clientMessage: {
        backgroundColor: '#fff', // Mensagem do cliente
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
    endChatButton: {
        marginLeft: 'auto',
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 8,
    },
});

export default AdminChatScreen;
