import { Dimensions, LayoutChangeEvent, NativeUIEvent, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import {bodyDatas, heads, property} from '../resources/test'

import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated'
import { theme } from './util/color';

interface DayData {
    date:number,
    thisM:boolean,
    color:number, // 0: 회색, 1: 흰색, 2: 빨간색, 3: 파란색
};
interface Position {
    col:number,
    row:number
};

const dayPalette = ['gray', 'white', 'red', 'blue'];

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window')
type CalendarProps = {
    setFocusLine: (target:number) => void,
    setFocusDay: (target:Date) => void,
}

export interface YMD {
    year:number,
    month:number,
    day:number
}

export interface CalendarRefProps {
    changeDate: (target:Date) => void; //target으로 렌더링될 날짜 변경
}

const Calendar = React.forwardRef<CalendarRefProps, CalendarProps>(({setFocusLine, setFocusDay}, ref) => {

    // targetMonth에는 목표 달의 1일 혹은 마지막일로 설정된다.
    const [pageTarget, setPageTarget] = useState<Date>(new Date());
    const [focusBlock, setFocusBlock] = useState<Position>();
    const toDayBlock:Position = {
        col:0,
        row:0
    }

    const initFocusBlock = useMemo(() => {
        console.log("|Calender| Memo call");
        // 첫날 계산.
        const firstDate = new Date(pageTarget.getFullYear(), pageTarget.getMonth(), 1)
        const temp = firstDate.getDay()+pageTarget.getDate()-1; //getDate는 시작이 1이기에 1을 빼줌.
        console.log("|Calendar| temp : " + temp);
        var row:number, col:number;
        row = Math.floor(temp/7)
        col = pageTarget.getDay();
        setFocusLine(row);
        setFocusBlock({
            row:row,
            col:col
        })
    },[pageTarget]);

    const changeDate = useCallback((target:Date)=>{
        console.log("|Calendar| change Date");
        setPageTarget(target);
    },[]);

    //네비게이션의 버튼이 targetDate를 변경시킴
    useImperativeHandle(ref, () => ({changeDate}), [
        changeDate,
    ]); 

    const recentCal:DayData[][] = 
        new Array(6).fill([]).map(() => 
            new Array(7).fill({}).map(() => ({
                    'date' : 0,
                    'thisM' : false,
                    'color' : 0,
                }))
        );

    //해당 달의 달력을 생성
    const getRecentCal = () => { 
        if (!pageTarget || !focusBlock){
            console.log("|Calendar| 날짜 불러오기 실패")
            return;
        }
        console.log("|Calendar| call getRecentCal");
        console.log(focusBlock);
        const today = new Date();   //현재 시간을 받아옴
        const todayDate = today.getDate();
        const thisYear = pageTarget.getFullYear();
        const thisMonth = pageTarget.getMonth();
        
        const preLastDateD = new Date(thisYear, thisMonth, 0).getDate();    //작년으로 넘어가도 문제 없음
        const firstDate = new Date(thisYear, thisMonth, 1);
        const lastDateD = new Date(thisYear, thisMonth + 1, 0).getDate();

        let day = -firstDate.getDay(); //sunday = 0, saturday = 6
        let nextMCount = 1;

        recentCal.map((array,row)=> {
            array.map((value:DayData,col)=> {
                value.color = 0;
                if ( day++ < 0 )
                    value.date = preLastDateD + day;
                else if( day <= lastDateD ) {
                    if(day === todayDate){
                        if(today.getMonth() == thisMonth && today.getFullYear() == thisYear){
                            toDayBlock['row'] = row;
                            toDayBlock['col'] = col;
                        }else {
                            toDayBlock['row'] = -1;
                            toDayBlock['col'] = -1;
                        }
                    }
                    value.date = day;
                    value.thisM = true;
                    if(col == 0)    // 일요일
                        value.color = 2;
                    else if(col == 6)   //토요일
                        value.color = 3;    
                    else    //평일
                        value.color = 1;
                }else 
                    value.date = nextMCount++;
            })
        })
    }
    
    getRecentCal();

    const blockStyle = (test:number, test2:number) => {
        if(test==focusBlock?.row && test2==focusBlock?.col)
            return {borderColor: 'red'} 
        else if(test==toDayBlock['row'] && test2 == toDayBlock['col'])
            return {borderColor: 'blue'}
        else 
            return {}
    }

    const onPress = () => {
        
    }

    return (
        <View style={styles.test}>
            {recentCal.map((array, index) => ( // 가로줄, 행을 생성
                <View key={index} style={styles.row}>  
                    {array.map((value, index2) => (
                        <TouchableOpacity key={index2} onPress={()=>{
                            console.log("Focus" + index);
                            setFocusBlock({
                                row:index,
                                col:index2
                            });
                            setFocusDay(
                                new Date(
                                    pageTarget.getFullYear(), 
                                    pageTarget.getMonth(), 
                                    recentCal[index][index2].date
                                    )
                                )
                            setFocusLine(index);
                            }} style={[styles.rowItem, blockStyle(index, index2)]}>
                            <Text style={{...styles.text, color: dayPalette.at(value.color)}}>
                                {value.date}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ))}
        </View>
    )
})

export default Calendar

const styles = StyleSheet.create({
    test: {
        height : SCREEN_HEIGHT*9/10, 
        bottom : 0,
        backgroundColor: theme.background
    },
    text : {
        color: 'white',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rowItem: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        width: SCREEN_WIDTH/7,
        paddingVertical: 8,
        paddingHorizontal: 4,
        height: SCREEN_HEIGHT * 27/200, // 상단 여백 1/10, 하단여백 9/100, 여백 제외 81/100 * 1/6 = 27/200
        borderTopWidth: 1,
        borderColor:'white',
        backgroundColor : theme.background,
    },
})