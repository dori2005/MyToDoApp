import BottomSheet, { BottomSheetRefProps } from './BottomSheet';
import { Button, Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Calendar, { CalendarRefProps } from './Calendar';
import { StackScreenProps, createStackNavigator } from '@react-navigation/stack';
import { useCallback, useEffect, useRef, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootStackParamList } from '../App';
import { StatusBar } from 'expo-status-bar';
import { TestScreenProps } from './TestComponent';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { enableLayoutAnimations } from 'react-native-reanimated';
import signAlert from './util/Tools';

const {height: SCREEN_HEIGHT} = Dimensions.get('window')

export type HomeScreenProps = StackScreenProps<RootStackParamList, 'Home'>;

const STORAGE_KEY_LOGIN = "@LoginData"

const HomeScreen = ({navigation} : HomeScreenProps) => {
  const [loginData, setLoginData] = useState({});
  const [login, setLogin] = useState(false);
  
  const loadLoginData = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY_LOGIN)
      if (s!=null) {
        setLoginData(JSON.parse(s));
        setLogin(true);
      }enableLayoutAnimations
    } catch (e) {
    }
  };
  
  const removeLoginData = async () => {
    try {
      await fetch('http://localhost:3001/login-token', {
        method: "DELETE",
        headers: {
          'Content-Type' : 'application/json',
        },
        body: JSON.stringify(loginData)
      })
      .then((response) => {
        if (response.status === 200) {
          signAlert('로그아웃', '로그아웃 되었습니다.');
          return response.json;
        }
      })
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error('Error message:', error.message);
      })
      await AsyncStorage.removeItem(STORAGE_KEY_LOGIN) //Object를 String으로
      setLogin(false);
    } catch (e) {
      // saving error
    }
  };

  const refBS = useRef<BottomSheetRefProps>(null);
  const onPress = useCallback(() => {   //버튼을 누르면
    const isActive = refBS?.current?.isActive();
    if (isActive) { //만일 액티브가 활성화 되어있으면
      refBS?.current?.scrollTo(0);   // 스크롤을 0으로 내려 없앤다. 그럼 scrollTo에서 0이 되면서 active를 비활성화 한다.
    }else {  // 비활성화 되어있으면
      refBS?.current?.scrollTo(-900); // 스크롤을 -200으로 그럼 scrollTo에서 0이 아니여서 active를 활성화 한다.
    }
  }, []);

  const refCal = useRef<CalendarRefProps>(null);
  let page = 0;
  const today = new Date();
  let targetday:Date;

  const toStringYM = (day:Date) => 
    day.getFullYear().toString() + "." + (day.getMonth()+1).toString();
  const [targetYM, setTargetYM] = useState(toStringYM(today));

  const onPressNext = useCallback(()=> {
    page++;
    const targetday = new Date(today.getFullYear(), today.getMonth()+page, today.getDate());
    refCal?.current?.changeDate(targetday);
  },[]);

  const onPressPre = useCallback(()=> {
    page--;
    const today = new Date();
    const targetday = new Date(today.getFullYear(), today.getMonth()+page, today.getDate());
    refCal?.current?.changeDate(targetday);
  },[]);
  
  const rightButton = () => {
    if (login) {
      return(
        <View>
            <Button onPress={()=>{
              setLogin(false);
              removeLoginData();
            }} title="Logout"/>
            <Button onPress={()=> onPress()} title="UP"/>
        </View>);
    }
    return(
      <View>
        <Button onPress={()=> {
          navigation.push("Login");
        }} title="Login"/>
        <Button onPress={()=> onPress()} title="UP"/>
      </View>
    )
  }

  useEffect(() => {
    loadLoginData();
    navigation.setOptions({title: targetYM});
    navigation.setOptions({headerLeft: () => (
      <View>
        <Button onPress={()=> onPressPre()} title="Pre"/>
        <Button onPress={()=> onPressNext()} title="Next"/>
      </View>
    )});
    navigation.setOptions({headerRight: rightButton});
  }, [navigation, login]);

  return (
    <GestureHandlerRootView style={{flex:1}}>
      <View style={styles.container}>  
        <StatusBar style="light" />
        <BottomSheet ref={refBS}>
          <View style={styles.panel}>
            <Calendar ref={refCal}/>
          </View>
        </BottomSheet>
      </View>
      <View style={styles.add_button_view}>
        <TouchableOpacity onPress={()=>{}}>
          <Image style={styles.magic_wand_button}
            source={require('../assets/magic-wand.png')}/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.add_todo_button} onPress={()=>{}}>
          <View>
            <View style={styles.crossVertical} />
            <View style={styles.crossHorizon} />
          </View>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  header: {
    width: '100%',
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 0,
  },
  calBtnText: {
    fontSize: 38,
    fontWeight: "600",
    color: 'white',
  },
  button: {
    height:50,
    borderRadius:25,
    aspectRatio: 1,
    backgroundColor: "white",
    opacity: 0.6,
  },
  panel: {
      height: SCREEN_HEIGHT,
      width: '100%',
      backgroundColor: 'black',
      position: 'absolute',
      top: -SCREEN_HEIGHT,
  },
  right_top: {
      flexDirection: "row",
  },
  add_button_view: {
    width: 80,
    height: 200,
    position: 'absolute',
    right: 20,
    bottom: 50,
  },
  magic_wand_button: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  add_todo_button: {
    width: 80,
    height: 80,
    borderRadius: 80/2,
    backgroundColor: 'grey',
    alignItems:"center",
    justifyContent: "center"
  },
  crossVertical: {
    backgroundColor: "white",
    height: 48,
    width: 8,
    borderRadius: 3,
  },
  crossHorizon: {
    backgroundColor: "white",
    height: 8,
    width: 48,
    borderRadius: 3,
    position: "absolute",
    left: -20,
    top: 20,
  },
});
