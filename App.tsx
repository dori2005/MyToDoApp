import BottomSheet, { BottomSheetRefProps } from './components/BottomSheet';
import { StyleSheet, View } from 'react-native';
import { useCallback, useRef } from 'react';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity } from '@gorhom/bottom-sheet';

export default function App() {
  const ref = useRef<BottomSheetRefProps>(null);
  const onPress = useCallback(() => {   //버튼을 누르면
    const isActive = ref?.current?.isActive();
    if (isActive) { //만일 액티브가 활성화 되어있으면
      ref?.current?.scrollTo(0);   // 스크롤을 0으로 내려 없앤다. 그럼 scrollTo에서 0이 되면서 active를 비활성화 한다.
    }else {  // 비활성화 되어있으면
      ref?.current?.scrollTo(-200); // 스크롤을 -200으로 그럼 scrollTo에서 0이 아니여서 active를 활성화 한다.
    }
  }, []);
  
  return (
    <GestureHandlerRootView style={{flex:1}}>
    <View style={styles.container}>  
      <StatusBar style="light" />
      <TouchableOpacity style={styles.button} onPress={onPress}/>
      <BottomSheet ref={ref}>
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
  button: {
    height:50,
    borderRadius:25,
    aspectRatio: 1,
    backgroundColor: "white",
    opacity: 0.6,
  }
});