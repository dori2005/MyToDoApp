import BottomSheet, { BottomSheetRefProps } from './components/BottomSheet';
import Calendar, { CalendarRefProps } from './components/Calendar';
import { StyleSheet, Text, View } from 'react-native';
import { useCallback, useRef, useState } from 'react';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity } from '@gorhom/bottom-sheet';

export default function App() {
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
    setTargetYM(toStringYM(targetday));
  },[]);
  const onPressPre = useCallback(()=> {
    page--;
    const today = new Date();
    const targetday = new Date(today.getFullYear(), today.getMonth()+page, today.getDate());
    refCal?.current?.changeDate(targetday);
    setTargetYM(toStringYM(targetday));
  },[]);
  
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
      <View style={{height:500}}>
        <Calendar ref={refCal}/>
      </View>
      <BottomSheet ref={refBS}>
        <View style={{flex:1, backgroundColor: 'orange'}}/>
      </BottomSheet>
    </View>
    </GestureHandlerRootView>
  );
}

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
  }
});
