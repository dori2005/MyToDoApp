import {
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import React, { useEffect, useState } from "react";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { theme } from './util/color';

const server = require('./util/saveTodo');

const STORAGE_KEY = "@toDos"
const STORAGE_KEY_TAP = "@tabData"

type TodoData = {
  text:string,
  working:boolean,
  complete:boolean,
};
type TodoList = {
  [key:string] : TodoData,
}
  
export default function ToDoComponent() {
    const [working, setWorking] = useState(true);
    const [editing, setEditing] = useState("");
    const [text, setText] = useState("");
    const [editText, setEditText] = useState("");
    const [toDos, setToDos] = useState<TodoList>();
  
    const saveTabData = async (saveData:Object) => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY_TAP, JSON.stringify(saveData)) //Object를 String으로
      } catch (e) {
        // saving error
      }
    };
  
    const loadTabData = async () => {
      try {
        const s = await AsyncStorage.getItem(STORAGE_KEY_TAP)
        if (s!=null)
          setWorking(JSON.parse(s));  // string >> javascript object
      } catch (e) {
        // error reading value
      }
    };
  
    const travel = () => {
      setWorking(false)
      saveTabData(false)
    };
  
    const work = () => {
      setWorking(true)
      saveTabData(true)
    };
  
    const inputText = (payload:string) => setText(payload);

    const loadToDos = async () => {
      try {
        console.log("test ToDOS");
        const todo:TodoList = await server.getToDos();
        console.log(todo);
        setToDos(todo);
      } catch(e) {
        console.log(e);
      }
    };
  
    useEffect(() => {
      loadToDos();
      loadTabData();
    }, []);
  
  
    const addToDo = async () => {
      if (text === "") {
        return
      }
      const newToDos = {
        ...toDos,
        [Date.now()]: { text, working, complete: false },
      };
      const data = { text, working, complete: false };
      const time = Date.now().toString();
  
  
      setToDos(newToDos);
      await server.renewUpdate(0, time, data);
      setText("");
    }
  
    const deleteAction = async(key:string) => {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
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
          working: toDos[key].working, 
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
            working: toDos[key].working, 
            complete: toDos[key].complete
          });
        //await server.saveEditToDo(key, editText, true);
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
        toDos[key].working === working ? (<View style={styles.toDo} key={key}>
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
        </View>) : null
      ))
      )
    }
  
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.header}>
          <TouchableOpacity onPress={work}>
            <Text style={{ ...styles.btnText, color: working ? "white" : theme.grey }}>Work</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={travel}>
            <Text style={{ ...styles.btnText, color: !working ? "white" : theme.grey }}>Travel</Text>
          </TouchableOpacity>
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