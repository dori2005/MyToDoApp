import { Alert, Platform } from "react-native";

const signAlert = (a:string, b:string) => {
    if(Platform.OS == "web") {
      const ok = confirm(b)
      if(ok) {
      }
    }else {
      Alert.alert(a,b, [
        {text: 'OK', onPress: () => console.log('OK Pressed')},
      ],
      {cancelable: false});
    }
}

export default signAlert