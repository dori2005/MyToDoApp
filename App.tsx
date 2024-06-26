import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import DrawerContent from './components/DrawerContent';
import GroupAddScreen from './components/group/GroupAddScreen';
import GroupMenuScreen from './components/group/GroupMenuScreen';
import { HeaderHeightContext } from '@react-navigation/elements';
import HomeScreen from './components/HomeScreen';
import LoginScreen from './components/LoginScreen';
import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import TestScreen from './components/TestScreen';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack'

export type RootStackParamList = {
  Test: undefined;
  Home: undefined;
  Login: undefined;
  Group: undefined;
  Profile: { userId: string };
  GroupTest:undefined;
};

//const Stack = createStackNavigator();
const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window')

const StackNav = () => {
  const Stack = createStackNavigator<RootStackParamList>();
  // headerHeight 왜인지 동작하지 않는다.
  var headerHeight = 0;
  if(Platform.OS == "web") 
    headerHeight = SCREEN_HEIGHT/15;
  else if(Platform.OS == "ios")  //적어도 IOS에서는 쓸모가 없다.
    headerHeight = SCREEN_HEIGHT/8; //하지만 UI는 1/8로 전부 맞췄었다. 이상하다.

  return(
    <Stack.Navigator initialRouteName='Home'>
      <Stack.Screen 
        name='Home' 
        component={HomeScreen}
      />
      <Stack.Screen 
        name='Login' 
        component={LoginScreen}
      />
      <Stack.Screen 
        name='Group' 
        options={{
          title: "그룹 메뉴"
        }}
        component={GroupMenuScreen}
      />
      <Stack.Screen 
        name='Test' 
        component={TestScreen}
      />
      <Stack.Screen 
        name='GroupTest' 
        options={{
          title: "그룹 생성"
        }}
        component={GroupAddScreen}
      />
    </Stack.Navigator>
  )
}

const DrawerNav = () => {
  const Drawer = createDrawerNavigator();
  return(
    <Drawer.Navigator 
    drawerContent={props => <DrawerContent {...props}/>}
    screenOptions={{
      drawerPosition: "right",
      headerShown:false
    }}>
      <Drawer.Screen name='Stack' component={StackNav}/>
    </Drawer.Navigator>
    );
}


export default function App() {
  return (
    <NavigationContainer>
      <DrawerNav/>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({})