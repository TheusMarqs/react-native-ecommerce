import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { AntDesign } from '@expo/vector-icons'; // Instale se necessário: expo install @expo/vector-icons

const FloatingChatButton = ({ roomName, username }: { roomName: string; username: string }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<{ sender: string; message: string }[]>([]);

    useEffect(() => {
        if (isChatOpen) {
            const ws = new WebSocket(`wss://backend-pm.onrender.com/ws/chat/${roomName}/`);
            setMessages([]);
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
            };
        }
    }, [isChatOpen, roomName]);

    const sendMessage = () => {
        if (socket && message.trim()) {
            socket.send(JSON.stringify({ message, sender: username }));
            setMessage('');
        }
    };

    return (
        <>
            {/* Botão Flutuante */}
            <TouchableOpacity
                style={styles.floatingButton}
                onPress={() => setIsChatOpen((prev) => !prev)}
            >
                <AntDesign name="message1" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Modal de Chat */}
            <Modal visible={isChatOpen} animationType="slide" transparent>
                <View style={styles.chatContainer}>
                    <FlatList
                        data={messages}
                        renderItem={({ item }) => (
                            <Text style={styles.message}>
                                <Text style={styles.sender}>{item.sender}: </Text>
                                {item.message}
                            </Text>
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
                        <Button title="Enviar" onPress={sendMessage} />
                    </View>
                    <Button title="Fechar Chat" onPress={() => setIsChatOpen(false)} color="#d9534f" />
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    floatingButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#007bff',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
    chatContainer: {
        flex: 1,
        width: '30%',
        backgroundColor: '#fff',
        margin: 20,
        borderRadius: 10,
        padding: 10,
        elevation: 10,
        alignSelf: 'flex-end'
    },
    messageList: {
        flex: 1,
        marginBottom: 10,
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

export default FloatingChatButton;
