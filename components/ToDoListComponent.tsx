import {
    Alert,
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

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import Realm from 'realm';
import { StatusBar } from 'expo-status-bar';
import { ToDo } from './Object/ToDo';
import { YM } from './Calendar';
import { theme } from './util/color';
import {useQuery} from '@realm/react';

import server from './util/saveTodo';

const STORAGE_KEY = "@toDos"
const STORAGE_KEY_TAP = "@tabData"
const dayKorean = ["일", "월", "화", "수", "목", "금", "토"]

interface TodoData {
  text:string,
  complete:boolean,
};
interface DateData {
  year:number,
  month:number,
  day:number,
}

interface TodoList {
  [key:string] : TodoData,
}
interface ToDoListComponentProps {
  selectDate:Date,
  onUpdateToDo: (id:string, date:Date, fix:number) => void;
}

export interface ToDoListComponentRefProps {
  loadToDos: (token:string) => void;
  addToDo: (key:string, text:string) => boolean;
}


var realm:Realm;

const ToDoComponent = React.forwardRef<ToDoListComponentRefProps,ToDoListComponentProps>(({selectDate, onUpdateToDo},ref) => {
    const [editing, setEditing] = useState("");
    const [editText, setEditText] = useState("");
    const [toDos, setToDos] = useState<TodoList>();

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
          schemaVersion: 11,
        });
      }catch(e) {
        console.log(e);
      }

      const select = selectDate.getFullYear().toString()+selectDate.getMonth().toString()+selectDate.getDate().toString()
      roadSchedule(select);
    };

    const readDB = () => {
      //const tasks = realm?.objects('Todo');
      const tasks1 = realm?.objects('Todo');
      console.log(tasks1);
    }
    const roadDB = (date:string) => {
      const tasks = realm?.objects('Todo').filtered(`complete = false`);
      console.log(tasks);
    }
    const roadSchedule = (date:string) => {
      console.log("|ToDo| road schedule - " + date);
      const tasks = realm?.objects('Schedule').filtered(`date = '${date}'`);
      console.log("|ToDo| road complete schedule");
      console.log(tasks);

      const todo:TodoList = {};
      tasks.map((ob:any)=>{
        todo[ob["id"]] = { "text":ob["text"], "complete":ob["complete"] };
      })
      setToDos(todo);
    }

    const addToDoInList = () => {
    }

    const realmDeleteDB = () => {
      realm?.write(() => {
        realm.deleteAll();
      });
    }
    const realmDeleteTodo = (key:string) => {
      const del = realm?.objects('Todo').filtered(`id = '${key}'`)[0];
      console.log(del);

      realm?.write(() => {
        realm.delete(del);
      });
    }
    const realmDeleteSchedule = (key:string) => {
      const del = realm?.objects('Schedule').filtered(`id = '${key}'`)[0];
      console.log(del);

      realm?.write(() => {
        realm.delete(del);
      });
    }
    const updateSchedule = (key:string, data:TodoData) => {
      realm?.write(() => {
        realm.create('Schedule', {
            id: key,
            text: data.text,
            complete: data.complete,
        }, Realm.UpdateMode.Modified)
      });
    }
    const updateTodo = (key:string, data:TodoData) => {
      realm?.write(() => {
        realm.create('Todo', {
            id: key,
            text: data.text,
            complete: data.complete,
        }, Realm.UpdateMode.Modified)
      });
    }

    const loadToDos = async (token:string) => {
      console.log("load ToDos");
      try {
        const todo:TodoList = await server.getToDos(token);
        setToDos(todo);
      } catch(e) {
        console.log(e);
      }
    };
  
    const addToDo = (key:string, text:string) => {
      if (text === "") {
        return false;
      }
      const newToDos = {
        ...toDos,
        [key]: { text, complete: false },
      };
  
      setToDos(newToDos);
      onUpdateToDo(key, selectDate, 0);

      return true;
    }

    useImperativeHandle(ref, () => ({loadToDos, addToDo}), [
      loadToDos,
      addToDo
    ]); 
  
    const deleteAction = async(key:string) => {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        console.log("delete ToDo");
        realmDeleteSchedule(key);
        console.log("delete ToDo2");
        server.renewUpdate(2, key);
        
        onUpdateToDo(key, selectDate, 1);
      }
      
    const deleteToDo = (key:string) => {
        if(Platform.OS == "web") {
          const ok = confirm("Do you want to delete this To Do?")
          if(ok) {
            deleteAction(key);
          }
        }else {
          Alert.alert(
            "Delete To Do",
            "Are you sure?", [
            { text: "Cancel" },
            {
              text: "I'm Sure",
              style: "destructive",
              onPress: () => deleteAction(key)
            },
          ]);
        }
      }
      
    const completeToDo = async (key:string) => {
      if (toDos === undefined)
        return null;
      
      const newToDos = { ...toDos }
      if (newToDos[key].complete)
        newToDos[key].complete = false;
      else
        newToDos[key].complete = true;
  
      setToDos(newToDos);
      updateSchedule(key, toDos[key]);
      onUpdateToDo(key, selectDate, 2);
      await server.renewUpdate(1, key, { 
          text: toDos[key].text, 
          complete: toDos[key].complete
        });
        
    }
  
    const editToDo = async (key:string) => {
      setEditing(key);
      if (toDos !== undefined)
        setEditText(toDos[key].text);
    }

    const inputEditText = (payload:string) => setEditText(payload);

    const sumitEditToDo = async (key:string) => {
      if (editText && toDos !== undefined) {
        const newToDos = { ...toDos }
        newToDos[key].text = editText
        setToDos(newToDos);
        await server.renewUpdate(1, key, { 
            text: editText, 
            complete: toDos[key].complete
          });
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
      setEditing("");
    }

    //
    // Todo 관련 => 모양 다르게는 추후에 생각해보자.
    // 언젠가 할일 (Todo)

    //
    // schedule 관련 => 언젠가 할일보다는 앞순위로 출력
    // 날짜를 선택하고, 이날 할일(Todo)로 설정하도록 한다.

    //
    // hobitㅡ=> 
    // 습관 만들기 - 반복 방식 확인.(마지막 업데이트 날짜 확인). 마지막 업데이트 날짜부터 ~ 오늘로 부터 1달 (31일 뒤)까지 미리 ToDo 추가 생성

    const printTodo = () => {
      if(toDos === undefined)
        return(null);
      return (Object.keys(toDos).map((key) => (  // Object.keys(toDos)의 output : [key1, key2,...] 자세한건 notion에
        <View style={styles.toDo} key={key}>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity onPress={() => completeToDo(key)}>
              <FontAwesome name="check" size={20} color={toDos[key].complete ? "white" : theme.grey} />
            </TouchableOpacity>
            {key === editing ? (
              <TextInput
                autoFocus={true}
                onChangeText={inputEditText}
                onEndEditing={() => sumitEditToDo(key)}
                onSubmitEditing={() => sumitEditToDo(key)}
                value={editText}
                style={{
                  ...styles.toDoText,
                  color: toDos[key].complete ? theme.grey : "white",
                  textDecorationLine: toDos[key].complete ? 'line-through' : 'none'
                }} />
            ) : (
              <Text style={{
                ...styles.toDoText,
                color: toDos[key].complete ? theme.grey : "white",
                textDecorationLine: toDos[key].complete ? 'line-through' : 'none'
              }}>
                {toDos[key].text}
              </Text>
            )}
          </View>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={{ paddingRight: 10 }}
              onPress={() => editToDo(key)}>
              <FontAwesome name="edit" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteToDo(key)}>
              <FontAwesome name="trash" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      ))
      )
    }

    const printDate = () => selectDate.getDate().toString() + " ("+ dayKorean[selectDate.getDay()] +")";
  
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.header}>
          <Text style={styles.input}>{printDate()}</Text>
        </View>
        <ScrollView>
          {printTodo()}
        </ScrollView>
      </View>
    );
  }
)
  
export default ToDoComponent

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: 20,
    },
    header: {
      justifyContent: "space-between",
      flexDirection: "row",
    },
    btnText: {
      fontSize: 38,
      fontWeight: "600",
    },
    input: {
      paddingVertical: 15,
      paddingHorizontal: 13,
      paddingBottom: 30,
      fontSize: 20,
      fontWeight: "800",
      color:"white"
    },
    toDo: {
      backgroundColor: theme.toDoBg,
      marginBottom: 10,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    toDoText: {
      //color: "white",
      fontSize: 16,
      fontWeight: "500",
      paddingHorizontal: 10,
      maxWidth: 250
    }
  });