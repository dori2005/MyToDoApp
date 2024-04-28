
import { View, TextInput, Button, StyleSheet, Alert, TouchableHighlight, Text, Modal, Platform, Dimensions } from 'react-native';
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../App";
import React, { useEffect, useState } from 'react';
import Realm from 'realm'
import server from './util/saveTodo';
import { Schedule, ScheduleData } from './Object/Schedule';
import { ToDo, ToDoData } from './Object/ToDo';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { theme, todoPalette } from './util/color';
import { dateToString } from './ToDoListComponent';
import { heads } from './resources/test';


interface AddToDoProps {   // 하위 컴포넌트가 삽입되었을때, 연동시키는 부분
    selectDate:Date;
    onAddToDo: (key:string, text:string, flag:string, color:number) => boolean;
    swichAddAction:(canceled:boolean)=>void;
}

interface AddToDoRefProps {    //TS에서 메소드를 export하기위한 type 선언 같이 보임. 
}   //이후 useImperativeHandle로 input과 output을 조립하는듯 하다.

const {height: SCREEN_HEIGHT, width:SCREEN_WIDTH} = Dimensions.get('window')

var realm:Realm;
const AddToDoComponent = React.forwardRef<AddToDoRefProps, AddToDoProps>(({selectDate, onAddToDo, swichAddAction}, ref) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('Schedule');
    const [date, setDate] = useState(selectDate.getDate().toString());
    const [color, setColor] = useState(0);

    //의문인건 이전처럼 depth에 넣어서 변경시 처리를 할 수 있을지 의문이다.
    const handleSaveAdd = async() => {
        //trim 으로 양쪽 공백을 제거한 문자열만 반환
        if (title.trim() === '' || type === null ) {
            Alert.alert('Error', 'Please enter all fields.');
        } else {
            // Save schedule logic here (e.g., send to backend or store locally)
            console.log('Title:', title);
            console.log('Type:', type);
            addToDo();
            swichAddAction(false);
        }
    };

    const handleCancelAdd = () => {
        swichAddAction(true);
    }

    useEffect(()=>{
        setDate(selectDate.getDate().toString());
        
        if(dateToString(selectDate) === dateToString(new Date())) {
          console.log("TESTESTETSE");
          setType("ToDo");
        }else 
          setType("Schedule");
      },[selectDate])

    useEffect(()=>{
      openLocalDB();
      //현재 AddToDoComponent는 항상 ToDoList가 열려있는 상태에서 동작된다.
      //때문에 굳이 Realm을 닫아줄 필요가 없다.
      // return () => {
      //   realm?.close();
      // };
    },[])

    const openLocalDB = async () => {
      try {
        realm = await Realm.open({
          schema: [ToDo, Schedule],
          schemaVersion: 12,
        });
      }catch(e) {
        console.log(e);
      }
    };

    const realmCreateToDo = (key:string, data:ToDoData) => {
        realm?.write(() => {
          realm.create('ToDo', {
              id: key,
              text: data.text,
              complete: data.complete,
              completeDate: null,
              color: data.color,
          })
        });
      }

    const realmCreateSchedule = (key:string, data:ScheduleData) => {
        realm?.write(() => {
          realm.create('Schedule', {
              id: key,
              text: data.text,
              date: data.date,
              complete: data.complete,
              color: data.color,
          })
        });
      }
  
    
    const addToDo = () => {
        const time = Date.now().toString();
        let date = selectDate.toString();
        console.log("Key : "+time);

        if(type === "ToDo") {
          console.log("|AddToDo| createToDo");
          const todo_data = { text:title, complete: false, color};
          realmCreateToDo(time, todo_data);
        }else if (type === "Schedule") {
          const select = selectDate.getFullYear().toString()+selectDate.getMonth().toString()+selectDate.getDate().toString();
          console.log("|AddToDo| createToDo - select date : "+select);
          const schedule_data = { text:title, date:select, complete: false, color};
          realmCreateSchedule(time, schedule_data);
        }
        console.log("|AddToDo| AddToDo color "+color);
        onAddToDo(time, title, type, color);

        setTitle('');
        setType('ToDo');
        setDate('');
        setColor(0);
    }

    const [selectedDays, setSelectedDays] = useState([false, false, false, false, false, false, false]);
    const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일'];

    const toggleDay = (index:number) => {
        const updatedDays = [...selectedDays];
        updatedDays[index] = !updatedDays[index];
        setSelectedDays(updatedDays);
    };

    const selectColor = (index:number) => {
  };


      const renderAdditionalInput = () => {
        if (type === 'ToDo') {
          return (
            <Text style={styles.dateText}>
              ToDo : 이룰 때까지
            </Text>
          );
        }else if (type === 'Schedule') {
          return (
            <Text style={styles.dateText}>
              Schedule : {
              selectDate.getFullYear().toString()
              +"."+selectDate.getMonth().toString()
              +"."+date+" ("+heads[selectDate.getDay()]+")"
              }
            </Text>
          );
        } else if (type === 'Habit') {
          return (
            <View style={styles.selectContainer}>
              <Text style={styles.heading}>Select Days:</Text>
              <View style={styles.buttonContainer}>
                {daysOfWeek.map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.dayButton, selectedDays[index] ? styles.selectedButton : null]}
                    onPress={() => toggleDay(index)}
                    >
                    <Text style={[styles.buttonText, selectedDays[index] ? styles.selectedText : null]}>{day}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
          //<Text>{selectedDays.map((selected, index) => (selected ? daysOfWeek[index] + ' ' : null))}</Text>
        }
        return null;
      };

    return (
        <View style={styles.container}>
            <TextInput
            onChangeText={(text)=>setTitle(text)}
            returnKeyType='done'
            value={title}
            placeholder={ "Enter To Do" }
            style={styles.input}
            />
            {renderAdditionalInput()}
            <View style={styles.selectContainer}>
              <Text style={styles.heading}>Select Color:</Text>
              <View style={styles.buttonContainer}>
                {todoPalette.map((tcolor, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.colorButton,{backgroundColor:tcolor}, color === index ? styles.selectedColorButton : null]}
                    onPress={() => setColor(index)}
                    />
                ))}
              </View>
            </View>
            <View style={styles.horizontalButtons}>
                <Button
                    title="Habit"
                    onPress={() => setType('Habit')}
                    color={type === 'Habit' ? '#007bff' : '#333'}
                />
                <Button
                    title="Schedule"
                    onPress={() => setType('Schedule')}
                    color={type === 'Schedule' ? '#007bff' : '#333'}
                />
                <Button
                    title="ToDo"
                    onPress={() => setType('ToDo')}
                    color={type === 'ToDo' ? '#007bff' : '#333'}
                />
            </View>
            <View style={styles.horizontalButtons}>
                <Button 
                    title="Cancel" onPress={handleCancelAdd}
                    color={'red'}
                />
                <Button title="Save" onPress={handleSaveAdd} />
            </View>
        </View>
    );
  });
  
  const styles = StyleSheet.create({
    container: {
      borderTopWidth:2,
      borderColor:theme.calBorder,
      height: SCREEN_HEIGHT*153/200,
      justifyContent: 'flex-end',
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#f0f0f0',
    },
    input: {
      top:SCREEN_HEIGHT/6,
      position:"absolute",
        width: '100%',
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    dateText: {
      top:SCREEN_HEIGHT/18,
      position:"absolute",
      fontFamily: 'KCC-Hanbit',
      fontSize: 22,
      padding:20,
      paddingBottom:25,
    },
    horizontalButtons: {
      paddingBottom:20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
      width: '100%',
    },
    
    selectContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    heading: {
        fontSize: 18,
        marginBottom: 10,
    },    
    buttonContainer: {
        width:SCREEN_WIDTH,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    colorButton: {
        paddingVertical: 10,
        margin: 5,
        borderRadius: 5,
        borderColor: '#333',
        alignItems: 'center',
        width: SCREEN_WIDTH / 12,
        height: SCREEN_WIDTH / 12
    },
    dayButton: {
        paddingVertical: 10,
        margin: 5,
        borderRadius: 5,
        borderColor: '#333',
        alignItems: 'center',
        width: SCREEN_WIDTH / 12,
    },
    selectedColorButton: {
      borderWidth:2,
      borderColor: '#007bff',
    },
    selectedButton: {
      backgroundColor: '#007bff',
    },
    buttonText: {
      fontFamily: 'KCC-Hanbit',
      fontSize: 16,
    },
    selectedText: {
      fontFamily: 'KCC-Hanbit',
      color: '#fff',
    },
    
});
  
  export default AddToDoComponent;