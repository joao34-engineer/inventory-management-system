import { type CleanUser } from "./user.schema.ts"

export type RegisterResult = 
| { type: 'success'; data: CleanUser}
| { type: 'error'; message: string}

export type LoginResult = 
| { type: 'success'; data: CleanUser} 
| { type: 'error'; message: string}