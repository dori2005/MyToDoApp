import BottomSheet, { BottomSheetRefProps } from './BottomSheet';
import { Button, Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Calendar, { CalendarRefProps } from './Calendar';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import { StackScreenProps, createStackNavigator } from '@react-navigation/stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../App';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { enableLayoutAnimations } from 'react-native-reanimated';
import signAlert from './util/Tools';
import { theme } from './util/color';

const {height: SCREEN_HEIGHT, width: SCREEN_WIDTH} = Dimensions.get('window')

export type HomeScreenProps = StackScreenProps<RootStackParamList, 'Home'>;

const STORAGE_KEY_LOGIN = "@LoginData"
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT*153/200

type LOGIN_DATA = {
  token : string,
}

export interface YMD {
  year:number,
  month:number,
  day:number
}

const HomeScreen = ({navigation} : HomeScreenProps) => {
  const [loginData, setLoginData] = useState<LOGIN_DATA>();
  const [login, setLogin] = useState(false);
  const [focusLine, setFocusLine] = useState(0);
  const [focusDate, setFocusDate] = useState<Date>(new Date());

  const loadLoginData = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY_LOGIN)
      if (s!=null) {
        setLoginData(JSON.parse(s));
        setLogin(true);
        loadToDoList();
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
      refBS?.current?.scrollTo(MAX_TRANSLATE_Y); // 스크롤을 -200으로 그럼 scrollTo에서 0이 아니여서 active를 활성화 한다.
    }
  }, []);


  const onFocusLine = (target:number) => {
    console.log("|Home| onFocusLine")
    setFocusLine(target);

    const isActive = refBS?.current?.isActive();
    if(!isActive) {
      refBS?.current?.scrollTo(MAX_TRANSLATE_Y)
    }
  }

  const onFocusDate = (target:Date) => {
    console.log("|Home| onFocusDate")
    // const ymd:YMD = {
    //   year:target.getFullYear(),
    //   month:target.getMonth(),
    //   day:target.getDate()
    // }
    setFocusDate(target);
  }

  const loadToDoList = useCallback(()=>{
    console.log("called loadTodoList");
    console.log(loginData);
    if (loginData !== undefined) 
      refBS?.current?.loadToDoList(loginData['token']);
  },[loginData])

  const refCal = useRef<CalendarRefProps>(null);
  let page = 0;
  const today = new Date();

  const toStringYM = (day:Date) => 
    day.getFullYear().toString() + "." + (day.getMonth()+1).toString();
    
  const [targetYM, setTargetYM] = useState(toStringYM(today));

  const onPressNext = useCallback(()=> {
    page++;
    const targetday = new Date(today.getFullYear(), today.getMonth()+page, 1);
    setFocusDate(targetday);
    setTargetYM(toStringYM(targetday));
    refCal?.current?.changeDate(targetday);
  },[]);

  const onPressPre = useCallback(()=> {
    page--;
    const targetday = new Date(today.getFullYear(), today.getMonth()+page+1, 0);
    setFocusDate(targetday);
    setTargetYM(toStringYM(targetday));
    refCal?.current?.changeDate(targetday);
  },[]);
  
  const rightButton = () => {
    if (login) {
      return(
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={()=> onPressNext()}>
            <Text style={styles.headerButton}>▶</Text>
          </TouchableOpacity>
            <Button onPress={()=>{
              setLogin(false);
              removeLoginData();
            }} title="Logout"/>
            <Button onPress={()=> onPress()} title="UP"/>
        </View>);
    }
    return(
      <View style={styles.headerRight}>
        <TouchableOpacity onPress={()=> onPressNext()}>
          <Text style={styles.headerButton}>▶</Text>
        </TouchableOpacity>
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
    navigation.setOptions({
      // Header 블록에 대한 스타일
      headerStyle: { 
        backgroundColor: theme.background,
      },
      // Header의 텍스트, 버튼 색상
      headerTintColor: '#ffffff',
      // 타이틀 텍스트의 스타일
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 20,
      },
    })
    navigation.setOptions({headerLeft: () => (
      <View style={styles.headerLeft}>
        <TouchableOpacity onPress={()=> onPressPre()}>
          <Text style={{...styles.headerButton, textAlign:'right'}}>◀</Text>
        </TouchableOpacity>
      </View>
    )});
    navigation.setOptions({headerRight: rightButton});
  }, [navigation, login, targetYM]);

  
  const data = useMemo(()=>[1,2,3,4,5],[]);
  /* 캘린더 슬라이드
          <FlatList
            data={data}
            renderItem={(({item})=> (
              <Calendar setFocusLine={onFocusLine} targetDay={item} ref={refCal}/>
            ))}
            horizontal
            pagingEnabled
            />
  */
 /* 마법봉
        <TouchableOpacity onPress={()=>{}}>
          <Image style={styles.magic_wand_button}
            source={require('../assets/magic-wand.png')}/>
        </TouchableOpacity>
   */

  return (
    <GestureHandlerRootView style={{flex:1}}>
      <View style={styles.container}>  
        <StatusBar style="light" />
        <BottomSheet focusLine={focusLine} focusDate={focusDate} ref={refBS}>
          <Calendar setFocusLine={onFocusLine} setFocusDay={onFocusDate} ref={refCal}/>
        </BottomSheet>
      </View>
      <View style={styles.add_button_view}>
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
  right_top: {
      flexDirection: "row",
  },
  add_button_view: {
    width: 60,
    height: 60,
    position: 'absolute',
    flexDirection: "column-reverse",
    right: 20,
    bottom: 20,
  },
  magic_wand_button: {
    width: 60,
    height: 60,
    marginBottom: 20,
  },
  add_todo_button: {
    width: 60,
    height: 60,
    borderRadius: 60/2,
    backgroundColor: 'grey',
    alignItems:"center",
    justifyContent: "center"
  },
  crossVertical: {
    backgroundColor: "white",
    height: 36,
    width: 6,
    borderRadius: 2,
  },
  crossHorizon: {
    backgroundColor: "white",
    height: 6,
    width: 36,
    borderRadius: 2,
    position: "absolute",
    left: -15,
    top: 15,
  },
  headerLeft: {
    width:SCREEN_WIDTH*3/8,
    flexDirection:"row-reverse",
  },
  headerRight: {
    width:SCREEN_WIDTH*3/8,
    flexDirection:"row",
    alignItems:'center'
  },
  headerButton: {
    width:SCREEN_WIDTH/5,
    fontSize: 30,
    color:"white",
  }
});
