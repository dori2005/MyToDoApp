import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import React, { useCallback, useEffect, useImperativeHandle } from 'react'

import ToDoComponent from './ToDoComponent'
import Calendar from './Calendar'

const {height: SCREEN_HEIGHT} = Dimensions.get('window')

//BOTTOM SHEET의 최고 높이 제한. web에서는 오류 자주남
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT+100  //맨 아래가 0에서부터 맨 위가 -SCREEN_HEIGHT

type BottomSheetProps = {   // 하위 컴포넌트가 삽입되었을때, 연동시키는 부분
    children?: React.ReactNode
}

export type BottomSheetRefProps = {    //TS에서 메소드를 export하기위한 type 선언 같이 보임. 
    scrollTo: (destination: number) => void;
    isActive: () => boolean;
}   //이후 useImperativeHandle로 input과 output을 조립하는듯 하다.

const BottomSheet = React.forwardRef<BottomSheetRefProps, BottomSheetProps>(
    ({children}, ref) => {  //(하위 컴포넌트, 파라미터)
    const translateY = useSharedValue(0)
    const active = useSharedValue(false);
    let test = true;

    const scrollTo = useCallback((destination: number) => { // 그저 callback 함수 생성
        //tried to synchronously call anonymous function from a different thread.
        //'worklet';  // 위 에러 방지, 과거엔 쓰였는데, 지금은 필요없어진듯

        active.value = destination !== 0;

        translateY.value = withSpring(destination, { damping: 50 }); //자매품 withTiming
    }, []);

    const isActive = useCallback(() => {
        return active.value;
    }, []);

    // TS로 인한 코드
    // BottomSheetRefProps와 관련있는듯
    useImperativeHandle(ref, () => ({scrollTo, isActive}), [
        scrollTo,
        isActive //모든 외부 사용 함수를 넣어줘야 되는듯 함
    ]);   //외부에 ref를 내부 scrollTo 함수에 넣어주는 과정같은데 알아봐야함.

    const context = useSharedValue({ y: 0});
    const gesture = Gesture.Pan().onStart(() => { //터치 시작점 입력 | 항상 시작점에서 드래그량 만큼만 움직이던 것을 해결하기 위함
        context.value = { y : translateY.value};  //y에 translateY.value값을 미리 저장해둠. 이때는 이전 마지막 움직임 값이 입력되있을것임.
    }).onUpdate((event) => {
        //translate Y 는 위로 드래그시 -를 아래로 드래그시 + 값을 가진다.
        translateY.value = event.translationY + context.value.y;    //중간부터 터치하더라도 항상 초기값으로 시작하는 것을 방지
        translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y); // 둘중에 더 큰값 반환 - MAX_TRANSLATE_Y는 마이너스 값이다.
        translateY.value = Math.min(translateY.value, 0);  //둘중에 작은값 반환
        console.log(event.translationY);
    }).onEnd(() => {
        if (active.value) {
            if (translateY.value > -SCREEN_HEIGHT/1.13) {
                scrollTo(0);
            } else if (translateY.value < -SCREEN_HEIGHT /1.13) {
                scrollTo(MAX_TRANSLATE_Y);
            }
        } else {
            if (translateY.value > -25) {
                scrollTo(0);
            } else if (translateY.value < -25) {
                scrollTo(MAX_TRANSLATE_Y);
            }
        }
    })

    // useEffect(() => {
    //     scrollTo(-SCREEN_HEIGHT / 2);
    // }, []);

    const rBottomSheetStyle = useAnimatedStyle(() => {
        //a가 범위 1에서부터 2까지 변할때, 3에서 4의 값이 반환된다.
        const borderRadius = interpolate( //interpolate란 뭐지? 
            translateY.value,   // a
            [MAX_TRANSLATE_Y+50, MAX_TRANSLATE_Y], //범위 1, 2
            [25, 5], //범위 3, 4
            Extrapolation.CLAMP //Extrapolation이 무엇일까? 범위를 한정하는 함수라고 한다. 
            //이게 없으면 범위 밖에서도 범위 내의 조건과 동일하게 변경된다.
            );   
        return {
            borderRadius,
            transform: [{translateY: translateY.value}],
        };
    })

  return (
    <GestureDetector gesture={gesture}>
        <View style={styles.touchBaseSheet}>
            <Animated.View style={[styles.bottomSheetContainer, rBottomSheetStyle]}>
                <View style={styles.line}/>
                {children}
                <ToDoComponent></ToDoComponent>
            </Animated.View>
        </View>
    </GestureDetector>
  )
})

export default BottomSheet

const styles = StyleSheet.create({
    bottomSheetContainer: {
        height: SCREEN_HEIGHT,
        width: '100%',
        backgroundColor: 'white',
        position: 'absolute',
        top: SCREEN_HEIGHT,
        borderRadius: 25,
    },
    line: {
        width: 75,
        height: 4,
        backgroundColor: 'grey',
        alignSelf: 'center',
        marginVertical: 15,
        borderRadius: 2,
    },
    touchBaseSheet: {
        height: SCREEN_HEIGHT,
        width: '100%',
        position: 'absolute',
        top: 50,
    },
})