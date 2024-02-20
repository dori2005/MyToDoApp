import BottomSheet, { BottomSheetRefProps } from './BottomSheet';
import { Button, Dimensions, StyleSheet, Text, View } from 'react-native';
import Calendar, { CalendarRefProps } from './Calendar';
import { StackScreenProps, createStackNavigator } from '@react-navigation/stack';
import { useCallback, useEffect, useRef, useState } from 'react';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootStackParamList } from '../App';
import { StatusBar } from 'expo-status-bar';
import { TestScreenProps } from './TestComponent';
import { TouchableOpacity } from '@gorhom/bottom-sheet';

const {height: SCREEN_HEIGHT} = Dimensions.get('window')

export type HomeScreenProps = StackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({navigation} : HomeScreenProps) => {
  const refBS = useRef<BottomSheetRefProps>(null);
  const onPress = useCallback(() => {   //버튼을 누르면
    const isActive = refBS?.current?.isActive();
    if (isActive) { //만일 액티브가 활성화 되어있으면
      refBS?.current?.scrollTo(0);   // 스크롤을 0으로 내려 없앤다. 그럼 scrollTo에서 0이 되면서 active를 비활성화 한다.
    }else {  // 비활성화 되어있으면
      refBS?.current?.scrollTo(-200); // 스크롤을 -200으로 그럼 scrollTo에서 0이 아니여서 active를 활성화 한다.
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
    console.log(targetday.getMonth());
  },[]);

  const onPressPre = useCallback(()=> {
    page--;
    const today = new Date();
    const targetday = new Date(today.getFullYear(), today.getMonth()+page, today.getDate());
    refCal?.current?.changeDate(targetday);
  },[]);
  
  useEffect(() => {
    navigation.setOptions({title: targetYM});
    navigation.setOptions({headerLeft: () => (
      <View>
        <Button onPress={()=> onPressPre()} title="Pre"/>
        <Button onPress={()=> onPressNext()} title="Next"/>
      </View>
    )});
    navigation.setOptions({headerRight: () => (
      <View>
        <Button onPress={()=> {
          navigation.push('Login');
        }} title="Login"/>
        <Button onPress={()=> onPress()} title="UP"/>
      </View>
    )});
  }, [navigation]);

  return (
    <GestureHandlerRootView style={{flex:1}}>
    <View style={styles.container}>  
      <View style={styles.header}>
        <TouchableOpacity onPress={onPressPre}>
          <Text style={styles.calBtnText}>Test</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.calBtnText}>{targetYM}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressNext}>
          <Text style={styles.calBtnText}>Test2</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="light" />
      <BottomSheet ref={refBS}>
        <View style={styles.panel}>
          <Calendar ref={refCal}/>
        </View>
      </BottomSheet>
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
});
