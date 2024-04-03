import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import React, { useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import ToDoListComponent, { ToDoListComponentRefProps } from './ToDoListComponent'
import {focus, focus2, heads, property} from '../resources/test'

import Calendar from './Calendar'
import { theme } from './util/color'

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window')

//BOTTOM SHEET의 최고 높이 제한. web에서는 오류 자주남
//상단 여백 1/10, 하단여백 9/100, 캘린더 칸당 81/100 * 1/6 = 27/200
//상단 여백 + 캘린더 한칸 = 27/200 + 1/10 = 47/200
//-(1 - 47/200) = -153/200
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT*153/200  //맨 아래가 0에서부터 맨 위가 -SCREEN_HEIGHT

type BottomSheetProps = {   // 하위 컴포넌트가 삽입되었을때, 연동시키는 부분
    children?: React.ReactNode,
    focusLine: number,
    focusDate: Date,
}

export type BottomSheetRefProps = {    //TS에서 메소드를 export하기위한 type 선언 같이 보임. 
    scrollTo: (destination: number) => void,
    isActive: () => boolean,
    loadToDoList: (token:string) => void,
}   //이후 useImperativeHandle로 input과 output을 조립하는듯 하다.

const BottomSheet = React.forwardRef<BottomSheetRefProps, BottomSheetProps>(({children, focusLine, focusDate}, ref) => {  //(하위 컴포넌트, 파라미터)
    const translateY = useSharedValue(0)
    const active = useSharedValue(false);
    
    const scrollTo = useCallback((destination: number) => { // 그저 callback 함수 생성
        //tried to synchronously call anonymous function from a different thread. 에러 방지
        //IOS에선 없을경우 어떠한 동작도 없이 팅긴다.
        //gesture를 통한 호출시에 팅김현상 발생
        //worklet은 Reanimated에 필수적인듯 함.
        //동기적으로 호출이 가능하게 된다고 한다.
        'worklet';  
        
        active.value = destination !== 0;

        translateY.value = withSpring(destination, { damping: 50 }); //자매품 withTiming
    }, []);

    const isActive = useCallback(() => {
        return active.value;
    }, []);

    const refToDo = useRef<ToDoListComponentRefProps>(null);
    const loadToDoList = (token:string)=>refToDo?.current?.loadToDos(token);

    // TS로 인한 코드
    // BottomSheetRefProps와 관련있는듯
    useImperativeHandle(ref, () => ({scrollTo, isActive, loadToDoList}), [
        scrollTo,
        isActive, //모든 외부 사용 함수를 넣어줘야 되는듯 함
        loadToDoList
    ]);   //외부에 ref에 내부 함수를 대입하는 과정같다.

    const context = useSharedValue({ y: 0});
    const gesture = Gesture.Pan().onStart(() => { //터치 시작점 입력 | 항상 시작점에서 드래그량 만큼만 움직이던 것을 해결하기 위함
        context.value = { y : translateY.value};  //y에 translateY.value값을 미리 저장해둠. 이때는 이전 마지막 움직임 값이 입력되있을것임.
    }).onUpdate((event) => {
        //translate Y 는 위로 드래그시 -를 아래로 드래그시 + 값을 가진다.
        translateY.value = event.translationY + context.value.y;    //중간부터 터치하더라도 항상 초기값으로 시작하는 것을 방지
        translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y); // 둘중에 더 큰값 반환 - MAX_TRANSLATE_Y는 마이너스 값이다.
        translateY.value = Math.min(translateY.value, 0);  //둘중에 작은값 반환
    }).onEnd(() => {
        if (active.value) {
            if (translateY.value > -SCREEN_HEIGHT/1.13) 
                scrollTo(0);
            else 
                scrollTo(MAX_TRANSLATE_Y);
        } else {
            if (translateY.value > -25) 
                scrollTo(0);
            else
                scrollTo(MAX_TRANSLATE_Y);
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

    const focusOnDay = useAnimatedStyle(() => {
        if(focusLine >= 0 && focusLine <= 5) 
            return {transform: [{translateY: -translateY.value*(focus2[focusLine])}]};
        return {};
    })

    return (
        <GestureDetector gesture={gesture}>
            <View style={styles.touchBaseSheet}>
                <Animated.View style={[styles.bottomSheetContainer, rBottomSheetStyle]}>
                    <View style={styles.underPanel}>
                        <Animated.View style={[styles.calendarBody, focusOnDay]}>
                            {children}
                        </Animated.View>
                    </View>
                    <ToDoListComponent selectDate={focusDate} ref={refToDo}/>
                    <View style={styles.line}/>
                </Animated.View>
                <View style={[styles.headerRow]}>  
                {heads.map((value, index) => (
                    <View key={index} style={styles.headItem}>
                        <Text style={styles.text}>{value}</Text>
                    </View>           
                ))}
                </View>
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
        top: SCREEN_HEIGHT-(SCREEN_HEIGHT/15),
        borderRadius: 25,
    },
    line: {
        width: 75,
        height: 4,
        backgroundColor: 'white',
        alignSelf: 'center',
        marginVertical: 15,
        borderRadius: 2,
        position: 'absolute',
    },
    touchBaseSheet: {
        height: SCREEN_HEIGHT,
        width: '100%',
        position: 'absolute',
        top: 0,
    },
    underPanel: {
      height: SCREEN_HEIGHT,
      width: '100%',
      backgroundColor: 'black',
      position: 'absolute',
      top: -SCREEN_HEIGHT+(SCREEN_HEIGHT/15),
    },
    calendarBody : {
        height: SCREEN_HEIGHT,
        top:SCREEN_HEIGHT/30,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      position:'absolute'
    },
    headItem: {
        justifyContent: 'center',
        alignItems: 'center',
        width: SCREEN_WIDTH/7,
        height: SCREEN_HEIGHT/30,
        borderTopWidth: 1,
        borderColor: 'white',
        backgroundColor : theme.background,
    },
    text : {
        color: 'white',
    },
})