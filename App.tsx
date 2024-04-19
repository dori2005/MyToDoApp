import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import AddScreen from './components/AddScreen';
import HomeScreen from './components/HomeScreen';
import LoginScreen from './components/LoginScreen';
import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import SideBarComponent from './components/SideBarComponent';
import { createStackNavigator } from '@react-navigation/stack'

export type RootStackParamList = {
  Test: undefined;
  Home: undefined;
  Login: undefined;
  Add: undefined;
  SideBar: undefined;
  Profile: { userId: string };
  Feed: { sort: 'latest' | 'top' } | undefined;
};

//const Stack = createStackNavigator();
const Stack = createStackNavigator<RootStackParamList>();
const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window')

export default function App() {

  var headerHeight = 0;
  if(Platform.OS == "web") 
    headerHeight = SCREEN_HEIGHT/15;
  else if(Platform.OS == "ios")
    headerHeight = SCREEN_HEIGHT/8;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Home'>
        <Stack.Screen 
          name='Home' 
          component={HomeScreen}
          options={{
            headerStyle: { 
              height: headerHeight,
            },
          }}
        />
        <Stack.Screen 
          name='Login' 
          component={LoginScreen}
        />
        <Stack.Screen 
          name='Add' 
          component={AddScreen}
        />
        <Stack.Screen
          name='SideBar'
          component={SideBarComponent}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({})