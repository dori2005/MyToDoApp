import Realm, { ObjectSchema } from "realm";

export class ToDo extends Realm.Object<ToDo> {
    id!: string;
    text!: string;
    color!: number;
    complete!: boolean;
    completeDate?: string;
    timestamp: number = Math.round(new Date().getTime() / 1000);
    static schema: ObjectSchema = {
      name: 'ToDo',
      properties: {
        id: 'string',
        text: 'string',
        color: 'int',
        complete: { type: 'bool', default: false },
        completeDate: 'string?', // == 'string?'
        timestamp: {
          type: 'int',
          default: () => Math.round(new Date().getTime() / 1000),
        },
      },
      primaryKey: 'id',
    };
  }

  export interface ToDoData {
    //id: string,
    text: string,
    complete: boolean,
    color: number,
    completeDate?:string
  }