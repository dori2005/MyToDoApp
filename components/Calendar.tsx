import { Dimensions, LayoutChangeEvent, NativeUIEvent, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useImperativeHandle, useState } from 'react'
import {bodyDatas, heads} from '../resources/test'

import { useSharedValue } from 'react-native-reanimated'

type DayData = {
    date:number,
    thisM:boolean,
    color:number, // 0: 회색, 1: 흰색, 2: 빨간색, 3: 파란색
};
const dayPalette = ['gray', 'white', 'red', 'blue'];

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window')

export type CalendarRefProps = {
    changeDate: (target:Date) => void;
}

const Calendar = React.forwardRef<CalendarRefProps>(({}, ref) => {
    // const [parentHeight, setParentHeight] = useState(0);
    // const onLayout = (event:LayoutChangeEvent) => {
    //   const {height} = event.nativeEvent.layout;
    //   setParentHeight(height);
    // };
    const [targetDate, setTargetDate] = useState<Date>(new Date());
    const changeDate = useCallback((target:Date)=>{
        setTargetDate(target);
    },[]);
    
    useImperativeHandle(ref, () => ({changeDate}), [
        changeDate,
    ]); 

    const recentCal:DayData[][] = 
        new Array(6).fill([]).map(() => 
            new Array(7).fill({}).map(() => { 
                const dd:DayData = {
                    'date' : 0,
                    'thisM' : false,
                    'color' : 0,
                }
                return dd;
            })
        );
    const getRecentCal = () => { 
        if (!targetDate){
            console.log("날짜 불러오기 실패")
            return;
        }
        const today = new Date();   //현재 시간을 받아옴
        const thisYear = targetDate.getFullYear();
        const thisMonth = targetDate.getMonth();
        
        const preLastDateD = new Date(thisYear, thisMonth, 0).getDate();    //작년으로 넘어가도 문제 없음
        const firstDate = new Date(thisYear, thisMonth, 1);
        const lastDateD = new Date(thisYear, thisMonth + 1, 0).getDate();

        let day = -firstDate.getDay(); //sunday = 0, saturday = 6
        let nextMCount = 1;

        recentCal.map((array)=> {
            array.map((value:DayData,index)=> {
                value.color = 0;
                if ( day++ < 0 )
                    value.date = preLastDateD + day;
                else if( day <= lastDateD ) {
                    value.date = day;
                    value.thisM = true;
                    if(index == 0)
                        value.color = 2;
                    else if(index == 6)
                        value.color = 3;
                    else 
                        value.color = 1;
                }else 
                    value.date = nextMCount++;
            })
        })
    }
    getRecentCal();
    console.log(SCREEN_HEIGHT);

  return (
    <View style={styles.test}>
        {recentCal.map((array, index) => ( // 가로줄, 행을 생성
            <View key={index} style={styles.row}>  
                {array.map((value, index2) => (
                    <View key={index2} style={styles.rowItem}>
                        <Text style={{...styles.text, color: dayPalette.at(value.color)}}>
                            {value.date}
                        </Text>
                    </View>
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
        bottom : 0
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
        height: SCREEN_HEIGHT*3/20,
        borderWidth: 1,
        borderColor: 'white',
    },
})