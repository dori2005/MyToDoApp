
import { View, TextInput, Button, StyleSheet, Alert, TouchableHighlight, Text, Modal, Platform, Dimensions } from 'react-native';
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../App";
import React, { useEffect, useState } from 'react';
import Realm from 'realm'


interface AddToDoProps {   // 하위 컴포넌트가 삽입되었을때, 연동시키는 부분
    selectDate:Date;
    swichAddAction:(canceled:boolean)=>void;
}

interface AddToDoRefProps {    //TS에서 메소드를 export하기위한 type 선언 같이 보임. 
}   //이후 useImperativeHandle로 input과 output을 조립하는듯 하다.

const {height: SCREEN_HEIGHT} = Dimensions.get('window')

const AddToDoComponent = React.forwardRef<AddToDoRefProps, AddToDoProps>(({selectDate, swichAddAction}, ref) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('ToDo');
    const [date, setDate] = useState('');
    //의문인건 이전처럼 depth에 넣어서 변경시 처리를 할 수 있을지 의문이다.
    const handleSaveAdd = () => {
        //trim 으로 양쪽 공백을 제거한 문자열만 반환
        if (title.trim() === '' || type === null || date.trim() === '') {
            Alert.alert('Error', 'Please enter all fields.');
        } else {
            // Save schedule logic here (e.g., send to backend or store locally)
            console.log('Title:', title);
            console.log('Type:', type);
            console.log('Date:', date);

            swichAddAction(false);
        }
    };
    const handleCancelAdd = () => {
        swichAddAction(true);
    }
  
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
            <View style={styles.horizontalButtons}>
                <Button 
                    title="Cancel" onPress={handleCancelAdd}
                    color={'red'}
                />
                <Button title="Save" onPress={handleSaveAdd} />
            </View>
        </View>
    );
  });
  
  const styles = StyleSheet.create({
    container: {
        height: SCREEN_HEIGHT*153/200,
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
  
  export default AddToDoComponent;