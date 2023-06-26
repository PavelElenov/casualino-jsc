export interface IToken{
    user: string,
    token: string
}

let tokens:IToken[] = []


export function compareToken(data: IToken): boolean{
    const userData = tokens.find(t => t.user = data.user);
    if(userData?.token == data.token){
        return true;
    }else{
        throw new Error();
    }
}

export function addToken(data: IToken): void{
    tokens.push(data);
}