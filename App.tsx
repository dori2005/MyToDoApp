import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import HomeScreen from './components/HomeScreen';
import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import TestComponent from './components/TestComponent';
import { createStackNavigator } from '@react-navigation/stack'

export type RootStackParamList = {
  Test: undefined;
  Profile: { userId: string };
  Feed: { sort: 'latest' | 'top' } | undefined;
};

//const Stack = createStackNavigator();
const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Test'>
        <Stack.Screen 
          name='Test' 
          component={TestComponent}
          options={{
            headerLeft: ({onPress}) => (
              <TouchableOpacity onPress={onPress}>
                <Text>Left</Text>
              </TouchableOpacity>
            ),
            headerTitle: ({children}) => (
              <View>
                <Text>{children}</Text>
              </View>
            ),
            headerRight: () => (
              <View>
                <Text>Right</Text>
              </View>
            ),
          }}
        />
        <Stack.Screen 
          name='Test' 
          component={HomeScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({})