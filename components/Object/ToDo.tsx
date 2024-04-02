import Realm, { ObjectSchema } from "realm";

export class ToDo extends Realm.Object<ToDo> {
    id!: string;
    text!: string;
    complete!: boolean;
    completeDate?: string;
    static schema: ObjectSchema = {
      name: 'Todo',
      properties: {
        id: 'string',
        text: 'string',
        complete: { type: 'bool', default: false },
        completeDate: 'string?', // == 'string?'
      },
      primaryKey: 'id',
    };
  }