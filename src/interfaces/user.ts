export interface IUser{
    username:string,
    email:string,
}

export interface IUserData{
    user: IUser,
    token:string,
}