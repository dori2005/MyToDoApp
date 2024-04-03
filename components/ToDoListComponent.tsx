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
import React, { useCallback, useEffect, useImperativeHandle, useState } from "react";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { theme } from './util/color';
import Realm from 'realm';
import { ToDo } from './Object/ToDo';
import {useQuery} from '@realm/react';
import { Schedule, ScheduleData } from './Object/Schedule';


const server = require('./util/saveTodo');

const STORAGE_KEY = "@toDos"
const STORAGE_KEY_TAP = "@tabData"

interface TodoData {
  text:string,
  complete:boolean,
};
interface TodoList {
  [key:string] : TodoData,
}
interface ToDoListComponentProps {
  selectDate:Date,
}

export interface ToDoListComponentRefProps {
  loadToDos: (token:string) => void;
}


var realm:Realm;

const ToDoComponent =React.forwardRef<ToDoListComponentRefProps,ToDoListComponentProps>(({selectDate},ref) => {
    const [working, setWorking] = useState(true);
    const [editing, setEditing] = useState("");
    const [text, setText] = useState("");
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
          schema: [ToDo.schema, Schedule.schema],
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
      const tasks = realm?.objects('Schedule').filtered(`date=${date}`);
      console.log("|ToDo| road complete schedule");
      console.log(tasks);
    }

    const createTodo = (key:string, data:TodoData) => {
      realm?.write(() => {
        realm.create('Todo', {
            id: key,
            text: data.text,
            complete: data.complete,
        })
      });
    }

    const createSchedule = (key:string, data:ScheduleData) => {
      realm?.write(() => {
        realm.create('Schedule', {
            id: key,
            text: data.text,
            date: data.date,
            complete: data.complete,
        })
      });
    }

    const deleteDB = () => {
      realm?.write(() => {
        realm.deleteAll();
      });
    }
    const deleteTodo = (key:string) => {
      const del = realm?.objects('Todo').filtered(`id = '${key}'`)[0];
      console.log(del);

      realm?.write(() => {
        realm.delete(del);
      });
    }
    const updateTodo = (key:string, data:TodoData) => {
      realm?.write(() => {
        realm.create('Todo', {
            id: key,
            text: 'data.text',
            complete: 'data.complete',
        }, Realm.UpdateMode.Modified)
      });
    }

    const inputText = (payload:string) => setText(payload);

    const loadToDos = async (token:string) => {
      console.log("load ToDos");
      try {
        const todo:TodoList = await server.getToDos(token);
        setToDos(todo);
      } catch(e) {
        console.log(e);
      }
    };

    useImperativeHandle(ref, () => ({loadToDos}), [
      loadToDos,
    ]); 
  
    const addToDo = async () => {
      if (text === "") {
        return
      }
      const time = new Date();
      const key = time.getFullYear().toString()+time.getMonth().toString()+time.getDate().toString();
      console.log(key);
      const newToDos = {
        ...toDos,
        [key]: { text, complete: false },
      };
      const data = { text, complete: false };
      const schedule_data = { text, date:key, complete: false,  };
  
      setToDos(newToDos);
      createSchedule(key, schedule_data);
      //createTodo(key, data);
      await server.renewUpdate(0, time, data);
      setText("");
    }
  
    const deleteAction = async(key:string) => {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        console.log("delete ToDo");
        deleteTodo(key);
        console.log("delete ToDo2");
        server.renewUpdate(2, key);
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
  
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.header}>
        </View>
        <TextInput
          onSubmitEditing={addToDo}
          onChangeText={inputText}
          returnKeyType='done'
          value={text}
          placeholder={working ? "Add a To Do" : "Where do you want?"}
          style={styles.input}></TextInput>
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
      backgroundColor: "white",
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 30,
      marginVertical: 20,
      fontSize: 18,
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