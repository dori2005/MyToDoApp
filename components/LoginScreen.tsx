import { Alert, Button, Platform, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'

import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../App';
import { StackScreenProps } from '@react-navigation/stack';
import signAlert from './util/Tools';

export type TestScreenProps = StackScreenProps<RootStackParamList, "Login">; 

const STORAGE_KEY_LOGIN = "@LoginData"

const LoginScreen = ({ navigation } : TestScreenProps) => {
    const [idText, setIdText] = useState('');
    const [pwText, setPwText] = useState('');
    
    const saveLoginToken = async (token : string) => { // 저장
      try {
        const data = {'token' : token};
        await AsyncStorage.setItem(STORAGE_KEY_LOGIN, JSON.stringify(data)) //Json으로 저장
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
          signAlert('로그인 성공', '로그인되었습니다.');
          console.log("로그인 성공");
          return response.json();
        } 
        if (response.status === 400) {
          signAlert('로그인 실패', 'ID 혹은 PW가 틀렸습니다.');
          console.log("로그인 실패");
        }
      })
      .then((data) => {
        if(data !== undefined){
          console.log(data);
          saveLoginToken(data);
        }
      })
      .catch((error) => {
        console.error('Error message:', error.message);
      })
        
      setIdText('');
      setPwText('');
      //로그인 시 이전의 네비게이션 스택은 필요없을 뿐더러,
      //Home 화면 리렌더링을 위해 reset 해줌.
      navigation.reset({routes:[{name: 'Home'}]});
    }
    const signUp = async() => {
      await fetch('http://localhost:3001/user', {
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
              signAlert('회원가입 성공', '회원가입에 성공하였습니다.');
              console.log("회원가입 성공");
            }
            return response.json();
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