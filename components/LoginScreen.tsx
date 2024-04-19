import { Alert, Button, Dimensions, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'

import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../App';
import { StackScreenProps } from '@react-navigation/stack';
import signAlert from './util/Tools';

export type LoginScreenProps = StackScreenProps<RootStackParamList, "Login">; 

const STORAGE_KEY_LOGIN = "@LoginData"

const {height: SCREEN_HEIGHT} = Dimensions.get('window')

const LoginScreen = ({ navigation } : LoginScreenProps) => {
    const [idText, setIdText] = useState('');
    const [pwText, setPwText] = useState('');
    const [currentTab, setCurrentTab] = useState('login'); // 'login' 또는 'signup'
    
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
      <View style={styles.container}>
          <View style={styles.tabContainer}>
              <TouchableOpacity
                  style={[styles.tab, currentTab === 'login' ? styles.activeTab : null]}
                  onPress={() => setCurrentTab('login')}>
                  <Text style={[styles.tabText, currentTab === 'login' ? styles.activeTabText : null]}>로그인</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={[styles.tab, currentTab === 'signup' ? styles.activeTab : null]}
                  onPress={() => setCurrentTab('signup')}>
                  <Text style={[styles.tabText, currentTab === 'signup' ? styles.activeTabText : null]}>회원가입</Text>
              </TouchableOpacity>
          </View>
          {currentTab === 'login' && (
              <>
                  <TextInput
                      style={styles.input}
                      placeholder="ID"
                      onChangeText={inputID}
                      value={idText}
                  />
                  <TextInput
                      style={styles.input}
                      placeholder="PW"
                      onChangeText={inputPW}
                      value={pwText}
                      secureTextEntry
                  />
                  <TouchableOpacity style={styles.button}>
                      <Text style={styles.buttonText}>로그인</Text>
                  </TouchableOpacity>
                  <View style={styles.divider}></View>
                  <TouchableOpacity style={styles.socialButton}>
                      <Image source={require('./resources/google-icon-white.png')} style={styles.socialButtonIcon} />
                      <Text style={styles.socialButtonText}>Google로 로그인</Text>
                  </TouchableOpacity>
              </>
          )}
          {currentTab === 'signup' && (
              <>
                  <TextInput
                      style={styles.input}
                      placeholder="ID"
                      onChangeText={inputID}
                      value={idText}
                  />
                  <TextInput
                      style={styles.input}
                      placeholder="PW"
                      onChangeText={inputPW}
                      value={pwText}
                      secureTextEntry
                  />
                  <TouchableOpacity style={styles.button}>
                      <Text style={styles.buttonText}>회원가입</Text>
                  </TouchableOpacity>
                  <View style={styles.divider}></View>
                  <TouchableOpacity style={styles.socialButton}>
                      <Image source={require('./resources/google-icon-white.png')} style={styles.socialButtonIcon} />
                      <Text style={styles.socialButtonText}>Google로 가입</Text>
                  </TouchableOpacity>
              </>
          )}
      </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
      paddingBottom: SCREEN_HEIGHT/10,
  },
  tabContainer: {
      flexDirection: 'row',
      marginBottom: 20,
  },
  tab: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 10,
      marginRight: 10,
      borderWidth: 0, // 버튼 테두리 없앰
  },
  tabText: {
      color: '#888',
      fontSize: 18,
  },
  activeTab: {
      borderRadius: 5,
  },
  activeTabText: {
      color: '#000',
      fontWeight: 'bold', // 선택된 탭의 텍스트 강조
      fontSize: 20,
  },
  input: {
      width: '80%',
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      borderRadius: 10,
      marginBottom: 10,
      paddingHorizontal: 10,
  },
  button: {
      width: '80%',
      height: 50,
      justifyContent: 'center',
      backgroundColor: '#007AFF',
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 20,
      marginBottom: 10,
  },
  buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
  },
  divider: {
      height: 1,
      width: '80%',
      backgroundColor: '#ccc',
      marginVertical: 20,
  },
  socialButton: {
      width: '80%',
      height: 50,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#DB4437',
      borderRadius: 10,
  },
  socialButtonIcon: {
      width: 20,
      height: 20,
      marginRight: 10,
  },
  socialButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
  },
});