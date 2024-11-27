import { useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList } from 'react-native';

const ChatScreen = () => {
    const params = useLocalSearchParams();
    const roomName = params.roomName as string;
    const username = params.username as string;
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<{ sender: string; message: string }[]>([]);

    useEffect(() => {
        const ws = new WebSocket(`wss://backend-pm.onrender.com/ws/chat/${roomName}/`);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received data:', data); // Verifique os dados recebidos
            setMessages((prev) => [
                ...prev,
                { sender: data.sender || 'Unknown', message: data.message },
            ]);
        };

        setSocket(ws);

        return () => {
            ws.close();
        };
    }, [roomName, username]); // Adicionamos `username` à dependência

    const sendMessage = () => {
        if (socket && message.trim()) {
            const messagePayload = {
                message,
                sender: username, // Envia o username diretamente
            };

            console.log('Sending message:', messagePayload); // Verifique a mensagem antes de enviar
            socket.send(JSON.stringify(messagePayload));
            setMessage('');
        }
    };

    return (
        <View style={styles.container}>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
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

export default ChatScreen;
