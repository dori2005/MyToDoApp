import Realm, { ObjectSchema } from "realm";

export class Schedule extends Realm.Object<Schedule> {
    id!: string;
    text!: string;
    date!: string;
    complete!: boolean;
    habit_id?:string;
    timestamp: number = Math.round(new Date().getTime() / 1000);
    static schema: ObjectSchema = {
      name: 'Schedule',
      properties: {
        id: 'string',
        text: 'string',
        date: 'string',
        complete: { type: 'bool', default: false },
        habit_id: 'string?',
        timestamp: {
          type: 'int',
          default: () => Math.round(new Date().getTime() / 1000),
        },
      },
      primaryKey: 'id',
    };
  }

export interface ScheduleData {
  //id: string,
  text: string,
  date: string,
  complete: boolean
}