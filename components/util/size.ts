import { Dimensions } from "react-native";

export const headerHeight = 1/15;
export const bottomSheetContainerTop = 14/15;
export const dayHeaderHeight = 1/30;


// 비율 calendarblockheight : focus under
// 
// 27/200       : 0.12
// 26/200       : 0.158(?)
// 25/200(1/8)  : 0.195
// 24/200       : 0.233
//상단 여백(밀어냄) [헤더] 1/10
// 
export const calendarBlockHeight = 1/8;
export const miniToDoBlockHeight = calendarBlockHeight * 6/11;
export const miniToDoViewHeight = miniToDoBlockHeight/3;
// 상단여백 1/10, 여백 19/100 => under 0.12
// 20/300 + 57/300 => 77/300
// 상단여백 1/15, 여백 9/100 
// 20/300 + 27/300 = 57/300 = 19/100
// 
// 0.9(180/200) - 27/200
export const bottomSheetHeight = 0.9 - calendarBlockHeight;


export const focus = [1, 0.8, 0.6, 0.4, 0.2, 0]
export const focus2 = [1, 0.824, 0.648, 0.472, 0.296, 0.12]
const under = 0.195;
export const focus_height = [
    1,
    0.8 + under*0.2,
    0.6 + under*0.4,
    0.4 + under*0.6,
    0.2 + under*0.8,
    under]

// 0.8 + 0.2[under bound] * 0.2
// 0.6 + 0.2[under bound] * 0.4
// 0.4 + 0.2[under bound] * 0.6
// 0.2 + 0.2[under bound] * 0.8
// 0 + 0.2[under bound] * 1.0