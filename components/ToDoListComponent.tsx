import {
    Alert,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { Schedule, ScheduleData } from './Object/Schedule';
import { theme, todoPalette } from './util/color';

import { FontAwesome } from '@expo/vector-icons';
import Realm from 'realm';
import { StatusBar } from 'expo-status-bar';
import { ToDo } from './Object/ToDo';
import { YM } from './Calendar';
import server from './util/saveTodo';
import {useQuery} from '@realm/react';

const {height: SCREEN_HEIGHT, width: SCREEN_WIDTH} = Dimensions.get('window')

const STORAGE_KEY = "@ToDos"
const STORAGE_KEY_TAP = "@tabData"
const dayKorean = ["일", "월", "화", "수", "목", "금", "토"]

interface ToDoData {
  id:string,
  text:string,
  complete:boolean,
  color:number
  completeDate?:string,
};
interface DateData {
  year:number,
  month:number,
  day:number,
}

interface ToDoListComponentProps {
  selectDate:Date,
  onUpdateToDo: (id:string, date:Date, fix:number, color:number) => void;
}

export interface ToDoListComponentRefProps {
  loadToDoServer: (token:string) => void;
  addToDoList: (key:string, text:string, flag:string, color:number) => boolean;
}

export const dateToString = (date:Date) => {
  return date.getFullYear().toString()+date.getMonth().toString()+date.getDate().toString();
}

var realm:Realm;

const ToDoComponent = React.forwardRef<ToDoListComponentRefProps,ToDoListComponentProps>(({selectDate, onUpdateToDo},ref) => {
    const [editing, setEditing] = useState(-1);
    const [editText, setEditText] = useState("");
    const [toDos, setToDos] = useState<ToDoData[]>([]);
    const [schedules, setSchedules] = useState<ToDoData[]>([]);
    const [habits, setHabits] = useState<ToDoData[]>([]);

    // onUpdateToDo에서는 Date를 YM과 day로 나눠서 사용해야한다. 때문에 dateToString는 오로지 ToDo를 위해서만 사용된다.
    const selectDateString = dateToString(selectDate) 

    useEffect(()=>{
      console.log("|ToDo| selectDate - month : " + (selectDate.getMonth()+1) + ", day : " + selectDate.getDate());
      openLocalDB();

      return () => {
        realm?.close();
      };
    },[selectDate])

    const openLocalDB = async () => {
      try {
        realm = await Realm.open({
          schema: [ToDo, Schedule],
          schemaVersion: 12,
        });
      }catch(e) {
        console.log(e);
      }

      realmRoadToDo();
      realmRoadSchedule(selectDateString);
    };

    const readDB = () => {
      //const tasks = realm?.objects('ToDo');
      const tasks1 = realm?.objects('ToDo');
      console.log(tasks1);
    }

    const realmRoadToDo = () => {
      const newToDo:ToDoData[] = [];
      if(selectDateString === dateToString(new Date())){
        const tasks = realm?.objects('ToDo').filtered(`complete = false`);
        console.log("|ToDoList| road ToDos");
        console.log(tasks);

        tasks.map((ob:any)=>{
          newToDo.push({"id":ob["id"],
            "text":ob["text"], "complete":ob["complete"],
            "color":ob["color"] 
          });
        })
      }
      console.log("|ToDoList| road ToDos not today");
      const tasks2 = realm?.objects('ToDo')
        .filtered("completeDate == $0",selectDateString);
      console.log("|ToDoList| road ToDos");
      console.log(tasks2);
      tasks2.map((ob:any)=>{
        newToDo.push({"id":ob["id"],
          "text":ob["text"], "complete":ob["complete"],
          "color":ob["color"], "completeDate":ob["completeDate"]
        });
      }) 
      setToDos(newToDo);
    }

    const realmRoadSchedule = (date:string) => {
      console.log("|ToDoList| road schedule - " + date);
      const tasks = realm?.objects('Schedule').filtered(`date = '${date}'`);
      console.log("|ToDoList| road complete schedule");
      console.log(tasks);

      const newSchedule:ToDoData[] = [];
      tasks.map((ob:any)=>{
        newSchedule.push({"id":ob["id"],
          "text":ob["text"], "complete":ob["complete"],
          "color":ob["color"] });
      })
      setSchedules(newSchedule);
    }

    const addToDoInList = () => {
    }

    const realmDeleteDB = () => {
      realm?.write(() => {
        realm.deleteAll();
      });
    }
    const realmDeleteToDo = (key:string) => {
      const del = realm?.objects('ToDo').filtered(`id = '${key}'`)[0];
      console.log(del);

      realm?.write(() => {
        realm.delete(del);
      });
      console.log("|ToDoList| deleteTodo "+key);
    }
    const realmDeleteSchedule = (key:string) => {
      const del = realm?.objects('Schedule').filtered(`id = '${key}'`)[0];
      console.log(del);

      realm?.write(() => {
        realm.delete(del);
      });
      console.log("|ToDoList| deleteSchedule "+key);
    }
    const updateSchedule = (data:ToDoData) => {
      realm?.write(() => {
        realm.create('Schedule', {
            id: data.id,
            text: data.text,
            complete: data.complete,
            color: data.color
        }, Realm.UpdateMode.Modified)
      });
    }
    const updateToDo = (data:ToDoData) => {
      const date = dateToString(selectDate);
      realm?.write(() => {
        realm.create('ToDo', {
            id: data.id,
            text: data.text,
            complete: data.complete,
            completeDate: date,
            color: data.color
        }, Realm.UpdateMode.Modified)
      });
    }

    const loadToDoServer = async (token:string) => {
      console.log("load ToDos");
      // try {
      //   const todo:ToDoData = await server.getToDos(token);
      //   setToDos(todo);
      // } catch(e) {
      //   console.log(e);
      // }
    };


    const addToDo = (id:string, text:string, color:number) => {
      const todayString = dateToString(new Date());
      if(selectDateString === todayString) {
        const newToDos = toDos.slice();
        newToDos.push({id, text, complete: false, color});
        setToDos(newToDos);
      }
      onUpdateToDo(id, new Date(), 0, color);
    }

    const addSchedule = (id:string, text:string, color:number) => {
      const newSchedules = schedules.slice();
      newSchedules.push({id, text, complete: false, color});
      setSchedules(newSchedules);
      onUpdateToDo(id, selectDate, 0, color);
    }
    const addhabit = (key:string, text:string, color:number) => {
      const newHobis = {
        ...habits,
        [key]: { text, complete: false, color },
      };
      setHabits(newHobis);
      onUpdateToDo(key, selectDate, 0, color);
    }
  
    const addToDoList = (key:string, text:string, flag:string, color:number) => {
      if (text === "") {
        return false;
      }
      console.log("|ToDoList| addToDoList "+color);
      switch(flag) {
        case "ToDo":
          addToDo(key, text, color);
          break;
        case "Schedule":
          addSchedule(key, text, color);
          break;
        // case "Habit":
        //   addhabit(key, text, color);
      }
      return true;
    }

    useImperativeHandle(ref, () => ({loadToDoServer, addToDoList}), [
      loadToDoServer,
      addToDoList
    ]); 
  
    const deleteAction = (deleteIdx:number, type:string) => {
      let key = "";
      if(type === "ToDo") {
        key = toDos[deleteIdx].id;
        const newToDos = toDos.slice();
        newToDos.splice(deleteIdx, 1);
        realmDeleteToDo(key);
        setToDos(newToDos);
      }
      else if(type === "Schedule") {
        key = schedules[deleteIdx].id;
        const newSchedules = schedules.slice(); 
        newSchedules.splice(deleteIdx, 1);
        realmDeleteSchedule(key);
        setSchedules(newSchedules);
      }
      console.log("|ToDoList| deleteAction " + key);
      onUpdateToDo(key, selectDate, 1, -1);
      //server.renewUpdate(2, key);
    }
      
    const deleteToDo = (idx:number, type:string) => {
        if(Platform.OS == "web") {
          const ok = confirm("Do you want to delete this To Do?")
          if(ok) {
            deleteAction(idx,type);
          }
        }else {
          Alert.alert(
            "Delete To Do",
            "Are you sure?", [
            { text: "Cancel" },
            {
              text: "I'm Sure",
              style: "destructive",
              onPress: () => deleteAction(idx,type)
            },
          ]);
        }
      }
      
    const completeToDo = async (idx:number, type:string) => {
      if(type === "ToDo") {
        const newToDos = toDos.slice()
        newToDos[idx].complete = !newToDos[idx].complete;
        setToDos(newToDos);
        updateToDo(toDos![idx]);
        onUpdateToDo(toDos![idx].id, selectDate, 2, -1);
      }else if (type === "Schedule") {
        const newSchedule = schedules.slice()
        newSchedule[idx].complete = !newSchedule[idx].complete;
        setSchedules(newSchedule);
        updateSchedule(schedules![idx]);
        onUpdateToDo(schedules![idx].id, selectDate, 2, -1);
      }
      // await server.renewUpdate(1, key, { 
      //     text: toDos[key].text, 
      //     complete: toDos[key].complete,
      //     color: toDos[key].color
      //   });
    }
  
    const editToDo = async (idx:number, type:string) => {
      setEditing(idx);
      if (type === "ToDo")
        setEditText(toDos![idx].text);
      else if (type === "Schedule")
        setEditText(schedules![idx].text);
    }

    const inputEditText = (payload:string) => setEditText(payload);

    //
    // 변경 필요 schedule로 확장
    //
    const sumitEditToDo = async (idx:number, type:string) => {
      if (editText != null) {
        if(type === "ToDo"){
          const newToDos = toDos.slice();
          newToDos[idx].text = editText;
          setToDos(newToDos);
          // await server.renewUpdate(1, key, { 
          //     text: editText, 
          //     complete: toDos[key].complete,
          //     color: toDos[key].color
          //   });
        }else if(type==="Schedule") {
          const newSchdules = schedules.slice();
          newSchdules[idx].text = editText
          setSchedules(newSchdules);
        }
      } else {
        if(Platform.OS == "web") {
          const ok = confirm("To Do is Empty.")
        }else {
          Alert.alert(
            "To Do is Empty.",
            "You must fill text", [
            { text: "Cancel" },
            {
              text: "Okay",
              style: "destructive"
            },
          ]);
        }
      }
      setEditing(-1);
    }

    const borderTodoColor = (color:number) => {
      return({
        borderColor:todoPalette[color],
      })
    }

    //
    // ToDo 관련 => 모양 다르게는 추후에 생각해보자.
    // 언젠가 할일 (ToDo)

    //
    // schedule 관련 => 언젠가 할일보다는 앞순위로 출력
    // 날짜를 선택하고, 이날 할일(ToDo)로 설정하도록 한다.

    //
    // habitㅡ=> 
    // 습관 만들기 - 반복 방식 확인.(마지막 업데이트 날짜 확인). 마지막 업데이트 날짜부터 ~ 오늘로 부터 1달 (31일 뒤)까지 미리 ToDo 추가 생성

    const printToDoList = (printList:ToDoData[]|undefined, type:string) => {
      if(printList === undefined)
        return(null);
      return (printList.map((val, idx) => (  // Object.keys(printList)의 output : [key1, key2,...] 자세한건 notion에
        <View key={val.id}>
          <View style={styles.toDo}>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity style={[styles.toDoCheckBox, borderTodoColor(printList[idx].color)]} onPress={() => completeToDo(idx, type)}>
                <FontAwesome name="check" size={20} color={printList[idx].complete ? theme.isCheck : theme.notCheck} />
              </TouchableOpacity>
              {idx === editing ? (
                <TextInput
                  autoFocus={true}
                  onChangeText={inputEditText}
                  onEndEditing={() => sumitEditToDo(idx, type)}
                  onSubmitEditing={() => sumitEditToDo(idx, type)}
                  value={editText}
                  style={{
                    ...styles.toDoText,
                    color: printList[idx].complete ? theme.toDoText : theme.toDoText,
                    textDecorationLine: printList[idx].complete ? 'line-through' : 'none'
                  }} />
              ) : (
                <Text style={{
                  ...styles.toDoText,
                  color: printList[idx].complete ? theme.toDoText : theme.toDoText,
                  textDecorationLine: printList[idx].complete ? 'line-through' : 'none'
                }}>
                  {printList[idx].text}
                </Text>
              )}
            </View>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={{ paddingRight: 10 }}
                onPress={() => editToDo(idx, type)}>
                <FontAwesome name="edit" size={20} color={theme.todoButton} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteToDo(idx, type)}>
                <FontAwesome name="trash" size={18} color={theme.todoButton} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.toDoUnderLine}/>
        </View>
      ))
      )
    }

    const printDate = () => selectDate.getDate().toString() + " ("+ dayKorean[selectDate.getDay()] +")";
  
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.header}>
          <Text style={styles.dateText}>{printDate()}</Text>
        </View>
        <ScrollView>
          {schedules!==undefined?(Object.keys(schedules).length != 0?(
            <View style={styles.toDoBox}>
              <Text style={styles.toDoBoxText}>Schedule</Text>
              {printToDoList(schedules, "Schedule")}
            </View>
            ):null):null}
          {toDos!==undefined?(Object.keys(toDos).length != 0?(
            <View style={styles.toDoBox}>
            <Text style={styles.toDoBoxText}>ToDo</Text>
              {printToDoList(toDos, "ToDo")}
            </View>
            ):null):null}
        </ScrollView>
      </View>
    );
  }
)
  
export default ToDoComponent

  const styles = StyleSheet.create({
    container: {
      borderTopWidth:2,
      borderColor:theme.calBorder,
      flex: 1,
      width: '100%',
      backgroundColor: theme.todoListContainer,
      paddingHorizontal: 10,
    },
    header: {
      justifyContent: "space-between",
      flexDirection: "row",
    },
    btnText: {
      fontSize: 38,
      fontWeight: "600",
    },
    dateText: {
      paddingHorizontal: 13,
      paddingVertical: 15,
      paddingBottom:10,
      color: theme.todoDateText,
      fontSize: 20,
      fontWeight: "800",
    },
    toDoBoxText: {
      top: -25,
      left: 10,
      paddingHorizontal: 13,
      position:"absolute",
      fontFamily:"KCC-Hanbit",
      fontSize:30,
      fontWeight:"500",
      backgroundColor: theme.todoListContainer
    },
    toDoBox: {
      marginTop: 30,
      paddingTop:15,
      paddingHorizontal:10,
      borderWidth:3,
      borderRadius:10,
      borderColor: theme.toDoText,
    },
    toDo: {
      marginBottom: 10,
      paddingVertical: 10,
      paddingHorizontal: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    toDoUnderLine: {
      top:-SCREEN_HEIGHT/60,
      left:60,
      backgroundColor: theme.toDoText,
      height:2,
      width:SCREEN_WIDTH/2,
    },
    toDoCheckBox: {
      position:"absolute",
      top:-SCREEN_HEIGHT/150,
      borderWidth:4,
      borderRadius:4,
      borderColor: theme.toDoBg,
    },
    toDoText: {
      marginLeft:SCREEN_WIDTH/10,
      fontFamily:"KCC-Hanbit",
      color: theme.toDoText,
      fontSize: 16,
      fontWeight: "500",
      paddingHorizontal: 10,
      maxWidth: 205
    }
  });