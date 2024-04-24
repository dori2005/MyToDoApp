
import { View, TextInput, Button, StyleSheet, Alert, TouchableHighlight, Text, Modal, Platform } from 'react-native';
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../App";
import React, { useEffect, useState } from 'react';
import Realm from 'realm'


export type AddScreenProps = StackScreenProps<RootStackParamList, 'Add'>;

var realm = new Realm();

const AddScreen = ({navigation} : AddScreenProps) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('ToDo');
    const [date, setDate] = useState('');

    const handleSaveSchedule = () => {
      if (title.trim() === '' || type === null || date.trim() === '') {
        Alert.alert('Error', 'Please enter all fields.');
      } else {
        // Save schedule logic here (e.g., send to backend or store locally)
        console.log('Title:', title);
        console.log('Type:', type);
        console.log('Date:', date);
  
        // Navigate back to previous screen
        navigation.goBack();
      }
    };
  
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Enter title"
          value={title}
          onChangeText={(text) => setTitle(text)}
        />
        <View style={styles.horizontalButtons}>
          <Button
            title="ToDo"
            onPress={() => setType('ToDo')}
            color={type === 'ToDo' ? '#007bff' : '#333'}
          />
          <Button
            title="Schedule"
            onPress={() => setType('Schedule')}
            color={type === 'Schedule' ? '#007bff' : '#333'}
          />
          <Button
            title="Hobby"
            onPress={() => setType('Hobby')}
            color={type === 'Hobby' ? '#007bff' : '#333'}
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Enter date"
          value={date}
          onChangeText={(text) => setDate(text)}
        />
        <Button title="Save" onPress={handleSaveSchedule} />
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#f0f0f0',
    },
    input: {
      width: '100%',
      height: 40,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      paddingHorizontal: 10,
      marginBottom: 10,
    },
    horizontalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
      width: '100%',
    },
  });
  
  export default AddScreen;