export interface IUser {
    username: string;
    email: string;
    level: number;
    img: string;
}
export interface IUserData {
    user: IUser;
    token: string;
}
