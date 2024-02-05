import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'

const TestNavigator = ({ navigation }) => {
    useEffect(() => {
      navigation.setOptions({title: '테스트'});
    }, [navigation]);
  return (
    <View>
      <Text>TestNavigator</Text>
    </View>
  )
}

export default TestNavigator

const styles = StyleSheet.create({})