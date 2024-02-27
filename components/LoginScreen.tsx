import { Button, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'

import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../App';
import { StackScreenProps } from '@react-navigation/stack';

export type TestScreenProps = StackScreenProps<RootStackParamList, "Login">; 

const STORAGE_KEY_LOGIN = "@LoginData"

const LoginScreen = ({ navigation } : TestScreenProps) => {
    const [idText, setIdText] = useState('');
    const [pwText, setPwText] = useState('');
    
    const saveLoginData = async (saveData : string) => { // 저장
      try {
        await AsyncStorage.setItem(STORAGE_KEY_LOGIN, JSON.stringify(saveData)) //Json으로 저장
      } catch (e) {
        // saving error
      }
    };
    const onClick = async () => {
        await fetch('http://localhost:3001/login-token', {
            method: "POST",
            headers: {
              'Content-Type' : 'application/json',
            },
            body: JSON.stringify({
              id : idText,
              pw : pwText,
            })
          })
          .then((response) => {
            if (response.status === 200) {
              console.log("로그인 성공");
            } else if (response.status === 403) {
              return response.json();
            }
          })
          .then((data) => {
            console.log(data);
            saveLoginData(data);
          })
          .catch((error) => {
            console.error('Error message:', error.message);
          })

        setIdText('');
        setPwText('');
    }
    const signUp = async() => {
      await fetch('http://localhost:3001/sign', {
            method: "POST",
            headers: {
              'Content-Type' : 'application/json',
            },
            body: JSON.stringify({
              id : idText,
              pw : pwText,
            })
          })
          .then((response) => {
            if (response.status === 200) {
              console.log("회원가입 성공");
            }
          })
          .then((data) => {
            console.log(data);
          })
          .catch((error) => {
            console.error('Error message:', error.message);
          })

        setIdText('');
        setPwText('');
    }
    const inputID = (text:string) => {
        setIdText(text)
        console.log(idText);
    }
    const inputPW = (text:string) => {
        setPwText(text)
        console.log(pwText);
    }

  return (
    <View>
        <TextInput placeholder='ID' onChangeText={inputID} value={idText}/>
        <TextInput placeholder='PW' onChangeText={inputPW} value={pwText} secureTextEntry/>
        <Button title='Login' onPress={()=> onClick()}></Button>
        <Button title='Sign UP' onPress={()=> signUp()}></Button>
    </View>
  )
}

export default LoginScreen

const styles = StyleSheet.create({})