import { Dimensions, LayoutChangeEvent, NativeUIEvent, StyleSheet, Text, View } from 'react-native'
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import {bodyDatas, heads, property} from './resources/test'

import Realm from 'realm';
import { Schedule } from './Object/Schedule';
import { ToDo } from './Object/ToDo';
import { theme } from './util/color';
import { useSharedValue } from 'react-native-reanimated'

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

export interface YM {
    year:number,
    month:number
}

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window')
type CalendarProps = {
    setFocusDay: (target:Date, line:number, activeBottom:boolean) => void,
    pageTarget: Date,
    targetYM : String,
}


export interface CalendarRefProps {
    onUpdateToDo: (id:string, ym:string, day:number, fix:number) => void;
}

//
// Calendar 컴포넌트 정의
//
const Calendar = React.forwardRef<CalendarRefProps, CalendarProps>(({setFocusDay, pageTarget, targetYM}, ref) => {

    // targetMonth에는 목표 달의 1일 혹은 마지막일로 설정된다.
    const [miniTodoList, setMiniTodoList] = useState<MiniTodo[][]>(new Array(31).fill([]));
    const [,updateState] = useState({});
    const forceUpdate = useCallback(()=>updateState({}),[]);
    const toDayBlock:Position = {
        col:-1,
        row:-1
    }

    useEffect(()=>{
        openLocalDB();

        return () => {
          realm?.close();
        };
    },[targetYM])   // 날짜 선택시마다 DB 로드 방지
    
    const onUpdateToDo = (id:string, ym:string, day:number, fix:number) => {
        const updateList:MiniTodo[] = [];
        if(ym != targetYM)
            return;
        if (fix == 0) {
            miniTodoList[day-1].push({ "id":id, "color":0, "complete": false })
            forceUpdate()
            return;
        }
        for(let i = 0; i < miniTodoList[day-1].length; i++) {
            if(miniTodoList[day-1][i].id == id) {
                if (fix == 1) {
                    continue;
                }else if (fix == 2) {
                    updateList.push({ "id":id, "color":miniTodoList[day-1][i].color, "complete": !miniTodoList[day-1][i].complete })
                }
            }
            else 
                updateList.push(miniTodoList[day-1][i])
        }
        miniTodoList[day-1] = updateList;
        forceUpdate()
    }

    useImperativeHandle(ref, () => ({onUpdateToDo}), [
        onUpdateToDo,
      ]); 

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

    //월 변경시 이전 schedule 잔상 남는거 제거
    const resetAllSchedule = useMemo(() => {
        const todoListOfMon:MiniTodo[][] = new Array(31).fill([]);
        setMiniTodoList(todoListOfMon);
    },[targetYM]);

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
    const getRecentCal = useCallback(() => { 
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
    }, [pageTarget, toDayBlock]) // pageTarget만 했을때는 안됐는데, 왜 toDayBlock 추가하니까 되는거니?
    
    getRecentCal();

    const blockStyle = (select:boolean, test:number, test2:number) => {
        if (select) {
            console.log("|Calendar| BlockStyle : red");
            return {borderColor: 'red'} 
        }else if(test==toDayBlock['row'] && test2 == toDayBlock['col']) {
            console.log("|Calendar| BlockStyle : blue");
            return {borderColor: 'blue'}
        }else 
            return {}
    }

    const onPressDate = useCallback((value:DayData, idx:number, idx2:number)=>{
        console.log("|Calendar| Focus" + value.date);
        console.log(pageTarget)
        if(value.thisM) {
            setFocusDay(
                new Date(
                    pageTarget.getFullYear(), 
                    pageTarget.getMonth(), 
                    value.date
                    ), idx, true)
    }},[pageTarget]) //**depth에 pageTarget을 설정안하면, 해당 함수 내에서 pageTarget은 초기값으로 고정된다.
    //useCallback으로 감싸주면 react가 함수를 저장하고 
    //두 번째 매개변수인 dependencies가 변경되지 않는다면 함수를 재생성하지 않기 때문에
    //해당 함수를 props로 가지는 자식 컴포넌트들은 함수가 바뀌었다고 생각하지 않게 된다

    const renderMiniToDo = (today:number) => {  //today = 날짜 - 1
        const todayidx = today-1;
        const len = Math.floor(miniTodoList[todayidx].length/3)  //3, 6, 9 보다 클때를 구분
        const sub_len = miniTodoList[todayidx].length%3;
        const subArray:MiniTodo[][] = new Array(len+1).fill([]);

        let i = 0;
        for(; i < len; i++) {
            subArray[i] = miniTodoList[todayidx].slice(i*3, i*3+3);
        }
        if (sub_len != 0)
            subArray[i] = miniTodoList[todayidx].slice(i*3, i*3+sub_len);

        return(
            <View style={styles.miniToDoBlock}>
                {subArray.map((rows, idx1)=>(
                    <View key={idx1} style={styles.miniToDoRow}>
                        {rows.map((item, idx2)=>{
                            return(<View key={idx2} style={styles.miniToDoView}>
                                <View style={{...styles.miniToDo,
                                    backgroundColor:item.complete?"blue":theme.background}}/>
                            </View>
                        )})}
                    </View>
                ))}
            </View>
        )
    }

    //컴포넌트 렌더링
    return (
        <View style={styles.test}>
            {recentCal.map((array, idx1) => ( // 가로줄, 행을 생성
                <View key={idx1} style={styles.row}>  
                    {array.map((value, idx2) => (
                        <TouchableOpacity key={idx2} onPress={()=>onPressDate(value,idx1,idx2)}
                         style={[styles.rowItem, blockStyle(value.select, idx1, idx2)]}>
                                <Text style={{...styles.text, color: dayPalette.at(value.color)}}>
                                    {value.date}
                                </Text>
                                {value.thisM?(renderMiniToDo(value.date)):null}
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
    miniToDoBlock: {
        width: SCREEN_WIDTH/9,
        height: SCREEN_HEIGHT * 3/40, // 27/200* 5/9
    },
    miniToDoRow: {
        flexDirection: 'row',
    },
    miniToDoView: {
        width: SCREEN_WIDTH/27,
        height: SCREEN_HEIGHT * 1/40,
        padding:2,
    },
    miniToDo : {
        borderWidth:3,
        borderColor:"blue",
        borderRadius:3,
        flex:1,
    }
})