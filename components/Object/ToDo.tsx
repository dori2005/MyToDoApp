import Realm, { ObjectSchema } from "realm";

export class ToDo extends Realm.Object<ToDo> {
    id!: string;
    text!: string;
    complete!: boolean;
    completeDate?: string;
    timestamp: number = Math.round(new Date().getTime() / 1000);
    static schema: ObjectSchema = {
      name: 'Todo',
      properties: {
        id: 'string',
        text: 'string',
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