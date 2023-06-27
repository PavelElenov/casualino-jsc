import { IUser, IUserSomeInfo } from "../../interfaces/user";


let users: IUser[] = [
  {
    email: "pavel@gmail.com",
    password: "12345",
    username: "Pavel",
    level:10,
    img: ''
  },
  {
    email: "plamen@gmail.com",
    password: "12345",
    username: "Plamen",
    level:11,
    img: ''
  },
  {
    email: "marto@gmail.com",
    password: "12345",
    username: "Marto",
    level:12,
    img: ''
  },
];

export const login = (
  email: string,
  password: string
): { username: string; email: string }  => {
  const user = users.find((user) => user.email == email);

  if (!user || user.password !== password) {
    throw new Error("Incorrect email or password");
  }

  return { username: user.username, email: user.email };
};

module.exports = {
  login,
};

export const getUserByUsername = (username: string): IUserSomeInfo => {
  const user:IUser = users.find(u => u.username = username)!;
  return {username: user.username, level: user.level, img: user.img};
}
