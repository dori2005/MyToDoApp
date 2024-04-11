import { Dimensions, LayoutChangeEvent, NativeUIEvent, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import {bodyDatas, heads, property} from '../resources/test'

import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated'
import { theme } from './util/color';
import { ToDo } from './Object/ToDo';
import { Schedule } from './Object/Schedule';

import Realm from 'realm';

interface DayData {
    date:number,
    thisM:boolean,
    select:boolean,
    color:number, // 0: 회색, 1: 흰색, 2: 빨간색, 3: 파란색
};
interface Position {
    col:number,
    row:number
};
interface MiniTodo {
    id:string,
    color:number,
    complete:boolean,
}

const dayPalette = ['gray', 'white', 'red', 'blue'];
var realm:Realm;

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window')
type CalendarProps = {
    setFocusDay: (target:Date, line:number, activeBottom:boolean) => void,
    pageTarget: Date
}

export interface YMD {
    year:number,
    month:number,
    day:number
}

export interface CalendarRefProps {
    changeDate: (target:Date) => void; //target으로 렌더링될 날짜 변경
}

//
// Calendar 컴포넌트 정의
//
const Calendar = React.forwardRef<CalendarRefProps, CalendarProps>(({setFocusDay, pageTarget}, ref) => {

    // targetMonth에는 목표 달의 1일 혹은 마지막일로 설정된다.
    const [miniTodoList, setMiniTodoList] = useState<MiniTodo[][]>(new Array(31).fill([]));
    const toDayBlock:Position = {
        col:-1,
        row:-1
    }

    useEffect(()=>{
        openLocalDB();

        return () => {
          realm?.close();
        };
    },[pageTarget])

    const openLocalDB = async () => {
        try {
          realm = await Realm.open({
            schema: [ToDo, Schedule],
            schemaVersion: 11,
          });
        }catch(e) {
          console.log(e);
        }
        roadAllSchedule();
    }

    const roadSchedule = (date:string) => {
      const tasks = realm?.objects('Schedule').filtered(`date = '${date}'`);

      const todoList:MiniTodo[] = [];
      tasks.map((ob:any)=>{
        todoList.push({ "id":ob["id"], "color":0, "complete":ob["complete"] });
      })
      return todoList;
    }

    const roadAllSchedule = () => {
        const ym = pageTarget.getFullYear().toString() + pageTarget.getMonth().toString();
        const lastDate = new Date(pageTarget.getFullYear(), pageTarget.getMonth() + 1, 0).getDate();
        const todoListOfMon:MiniTodo[][] = new Array(31).fill([]);
        for (let i = 1; i <= lastDate; i++) {
            todoListOfMon[i-1] = roadSchedule(ym+i.toString());
        }
        setMiniTodoList(todoListOfMon);
    }

    const recentCal:DayData[][] = 
        new Array(6).fill([]).map(() => 
            new Array(7).fill({}).map(() => ({
                    'date' : 0,
                    'thisM' : false,
                    'select' : false,
                    'color' : 0,
                }))
        );

    //해당 달의 달력을 생성
    const getRecentCal = () => { 
        if (!pageTarget){
            console.log("|Calendar| 날짜 불러오기 실패")
            return;
        }
        console.log("|Calendar| call getRecentCal");
        const today = new Date();   //현재 시간을 받아옴
        const todayDate = today.getDate();
        const thisYear = pageTarget.getFullYear();
        const thisMonth = pageTarget.getMonth();
        const targetDay = pageTarget.getDate();
        
        const preMonLastDate = new Date(thisYear, thisMonth, 0).getDate();    //작년으로 넘어가도 문제 없음
        const firstDay = new Date(thisYear, thisMonth, 1);
        const lastDate = new Date(thisYear, thisMonth + 1, 0).getDate();

        let day = -firstDay.getDay(); //sunday = 0, saturday = 6
        let nextMCount = 1;

        recentCal.map((array,row)=> {
            array.map((value:DayData,col)=> {
                value.color = 0;
                if ( day++ < 0 )
                    value.date = preMonLastDate + day;
                else if( day <= lastDate ) {
                    if(day === todayDate){
                        if(today.getMonth() == thisMonth && today.getFullYear() == thisYear){
                            toDayBlock['row'] = row;
                            toDayBlock['col'] = col;
                        }
                    }
                    if (day === targetDay) {
                        console.log(value);
                        value.select = true;
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

    const blockStyle = (select:boolean, test:number, test2:number) => {
        if (select) {
            console.log(select);
            return {borderColor: 'red'} 
        }else if(test==toDayBlock['row'] && test2 == toDayBlock['col']) {
            console.log(select);
            return {borderColor: 'blue'}
        }else 
            return {}
    }

const onPressDate = useCallback((value:DayData, idx:number, idx2:number)=>{
    console.log("Focus" + value.date);
    if(value.thisM) {
        setFocusDay(
            new Date(
                pageTarget.getFullYear(), 
                pageTarget.getMonth(), 
                recentCal[idx][idx2].date
                ), idx, true)
    }},[])

const renderMiniToDo = (today:number) => {
    miniTodoList[today].length  //3, 6, 9 보다 클때를 구분
    return(
    <View>

    </View>
    )
}

    return (
        <View style={styles.test}>
            {recentCal.map((array, index) => ( // 가로줄, 행을 생성
                <View key={index} style={styles.row}>  
                    {array.map((value, index2) => (
                        <TouchableOpacity key={index2} onPress={()=>onPressDate(value,index,index2)}
                         style={[styles.rowItem, blockStyle(value.select, index, index2)]}>
                                <Text style={{...styles.text, color: dayPalette.at(value.color)}}>
                                    {value.date}
                                </Text>
                                {value.thisM?(
                                <FlatList
                                data={miniTodoList[value.date-1]}
                                style={styles.miniToDoViewRow}
                                numColumns={3}
                                renderItem={({item})=>{
                                    return(
                                    <View style={styles.miniToDoView}>
                                        <View style={{...styles.miniToDo,
                                            backgroundColor:item.complete?"blue":theme.background}}/>
                                    </View>)}
                                }/>):null}
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
    miniToDoViewRow: {
        width: SCREEN_WIDTH/9,
        height: SCREEN_HEIGHT * 3/40, // 27/200* 5/9
    },
    miniToDoView : {
        width: SCREEN_WIDTH/27,
        height: SCREEN_HEIGHT * 1/40,
        padding:2
    },
    miniToDo : {
        borderWidth:3,
        borderColor:"blue",
        borderRadius:3,
        flex:1,
    }
})