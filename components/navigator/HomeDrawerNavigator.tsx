import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "../HomeScreen";
import LoginScreen from "../LoginScreen";

export type RootDrawerParamList = {
    Home: undefined;
    Login: undefined;
    Profile: { userId: string };
  };
const Drawer = createDrawerNavigator<RootDrawerParamList>();

// 사이드 메뉴.
// 사용자 정보 [ 프로필 수정 ] || 로그인
// 그룹 
// 로그아웃 버튼
const HomeDrawerNavigator = () => {
    return (
        <Drawer.Navigator
            initialRouteName="Home">
            <Drawer.Screen name="Home" component={HomeScreen} />    
            <Drawer.Screen name="Login" component={LoginScreen} />
        </Drawer.Navigator>
    );
}

export default HomeDrawerNavigator;