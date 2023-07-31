export interface IUser {
  username: string;
  email: string;
  level: number;
  img: string;
}

export interface ISmallUserInfo {
  username: string;
  level: number;
  img: string;
}

export interface IUserData {
  user: IUser;
  token: string;
}

export class User implements IUser {
  constructor(
    public username: string,
    public email: string,
    public level: number,
    public img: string
  ) {}

  getUsername(){
    return this.username;
  }
}
