import { Button, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'

import { RootStackParamList } from '../App';
import { StackScreenProps } from '@react-navigation/stack';

export type TestScreenProps = StackScreenProps<RootStackParamList, "Login">; 

const LoginScreen = ({ navigation } : TestScreenProps) => {
    const [idText, setIdText] = useState<string>();
    const [pwText, setPwText] = useState<string>();
    const onClick = async () => {
        await fetch('http://localhost:3000/login-token', {
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
        <TextInput placeholder='ID' onChangeText={inputID}/>
        <TextInput placeholder='PW' onChangeText={inputPW} secureTextEntry/>
        <Button title='Login' onPress={()=> onClick()}></Button>
    </View>
  )
}

export default LoginScreen

const styles = StyleSheet.create({})