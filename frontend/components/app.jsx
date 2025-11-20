// App.js
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import io from 'socket.io-client';
import axios from 'axios';

const SERVER_URL = 'http://192.168.1.3:5000';

export default function App() {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [apiResponse, setApiResponse] = useState('');

  useEffect(() => {
    const socketConnection = io(SERVER_URL);
    socketConnection.on('connect', () => {
      console.log('Connected to socket server with id:', socketConnection.id);
    });
    socketConnection.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    setSocket(socketConnection);
    return () => socketConnection.disconnect();
  }, []);

  const sendMessage = () => {
    if (socket && message.trim()) {
      socket.emit('message', message);
      setMessage('');
    }
  };

  const callApi = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}`);
      setApiResponse(JSON.stringify(res.data));
    } catch (err) {
      setApiResponse('API call failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Socket.IO Messages</Text>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Text style={styles.message}>{item}</Text>}
      />
      <TextInput
        style={styles.input}
        placeholder="Type a message"
        placeholderTextColor="#888"
        value={message}
        onChangeText={setMessage}
      />
      <View style={styles.buttonContainer}>
        <Button title="Send Message" color="#1976D2" onPress={sendMessage} />
      </View>
      <View style={styles.apiSection}>
        <Button title="Call API" color="#424242" onPress={callApi} />
        <Text style={styles.apiResponse}>{apiResponse}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181A20',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F5F5F5',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#DDDDDD',
    marginVertical: 4,
    backgroundColor: '#22242A',
    padding: 8,
    borderRadius: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: '#22242A',
    color: '#FAFAFA',
    padding: 10,
    marginVertical: 10,
    borderRadius: 6,
  },
  buttonContainer: {
    backgroundColor: '#212121',
    borderRadius: 4,
    marginBottom: 10,
    overflow: 'hidden',
  },
  apiSection: {
    marginTop: 30,
    backgroundColor: '#22242A',
    borderRadius: 4,
    padding: 10,
  },
  apiResponse: {
    color: '#90CAF9',
    marginTop: 10,
  },
});
