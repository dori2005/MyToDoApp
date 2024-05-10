import Realm, { ObjectSchema } from "realm";

export class Group extends Realm.Object<Group> {
    id!: string;
    title!: string;
    text!: string;
    color!: number;
    ispublic!: boolean;
    timestamp: number = Math.round(new Date().getTime() / 1000);
    static schema: ObjectSchema = {
      name: 'Group',
      properties: {
        id: 'string',
        title: 'string',
        text: 'string',
        color: 'int',
        ispublic: { type: 'bool', default: false },
        timestamp: {
          type: 'int',
          default: () => Math.round(new Date().getTime() / 1000),
        },
      },
      primaryKey: 'id',
    };
  }

export interface Group {
  //id: string,
    title: string,
    text: string,
    date: string,
  complete: boolean,
  color: number,
}