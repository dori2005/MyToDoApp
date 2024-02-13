import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { RootStackParamList } from '../App';
import { StackScreenProps } from '@react-navigation/stack';

export type TestScreenProps = StackScreenProps<RootStackParamList, "Test">; // RootStackParamList에 선언된 Key 중 하나여야 함

const TestComponent = ({ navigation } : TestScreenProps) => {
    useEffect(() => {
      navigation.setOptions({title: '테스트'});
    }, [navigation]);
  return (
    <View>
      <Text>TestNavigator</Text>
    </View>
  )
}

export default TestComponent

const styles = StyleSheet.create({})