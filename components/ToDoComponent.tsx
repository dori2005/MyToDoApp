import {
    Alert,
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
import { theme } from './color';

const STORAGE_KEY = "@toDos"
  const STORAGE_KEY_TAP = "@tabData"
  
  export default function App() {
    const [working, setWorking] = useState(true);
    const [editing, setEditing] = useState("");
    const [text, setText] = useState("");
    const [editText, setEditText] = useState("");
    const [toDos, setToDos] = useState({})
  
    const saveTabData = async (saveData) => {
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
  
  
    const saveToDos = async (toSave) => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)) //Object를 String으로
      } catch (e) {
        // saving error
      }
    };
  
    const loadToDos = async () => {
      try {
        const s = await AsyncStorage.getItem(STORAGE_KEY)
        if (s!=null)
          setToDos(JSON.parse(s));  // string >> javascript object
      } catch (e) {
        // error reading value
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
      //save to do
      //Object assign
      /*const newToDos = Object.assign({}, toDos, {
        [Date.now()]: {text, work:working}
      });*/
  
      //ES6
      const newToDos = {
        ...toDos,
        [Date.now()]: { text, working, complete: false, edit: false },
      };
  
      setToDos(newToDos);
      await saveToDos(newToDos);
      setText("");
    }
  
    const deleteToDo = (key:string) => {
      Alert.alert(
        "Delete To Do",
        "Are you sure?", [
        { text: "Cancel" },
        {
          text: "I'm Sure",
          style: "destructive",
          onPress: async () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            setToDos(newToDos);
            await saveToDos(newToDos);
          }
        },
      ]);
    }
  
    const completeToDo = async (key:string) => {
      const newToDos = { ...toDos }
      if (newToDos[key].complete)
        newToDos[key].complete = false;
      else
        newToDos[key].complete = true;
  
      setToDos(newToDos);
      await saveToDos(newToDos);
    }
  
    const editToDo = async (key:string) => {
      //if (editing != "") setEditing("");
      setEditing(key);
      setEditText(toDos[key].text);
    }
    const inputEditText = (payload) => setEditText(payload);
  
    const sumitEditToDo = async (key:string) => {
      const newToDos = { ...toDos }
      newToDos[key].text = editText
      setToDos(newToDos);
      await saveToDos(newToDos);
      setEditing("");
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
          {Object.keys(toDos).map((key) => (  // Object.keys(toDos)의 output : [key1, key2,...] 자세한건 notion에
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
          ))}</ScrollView>
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
      marginTop: 100,
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