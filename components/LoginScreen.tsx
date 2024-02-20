import { Button, StyleSheet, Text, TextInput, View } from 'react-native'

import React from 'react'
import { RootStackParamList } from '../App';
import { StackScreenProps } from '@react-navigation/stack';

export type TestScreenProps = StackScreenProps<RootStackParamList, "Login">; 

const LoginScreen = ({ navigation } : TestScreenProps) => {
  return (
    <View>
        <TextInput placeholder='ID'></TextInput>
        <TextInput placeholder='PW' secureTextEntry></TextInput>
        <Button title='Login'></Button>
    </View>
  )
}

export default LoginScreen

const styles = StyleSheet.create({})