interface IToken{
    user: string,
    token: string
}

let tokens:IToken[] = []


export function compareToken(data: IToken): boolean{
    const userData = tokens.find(t => t.user = data.user);
    return userData?.token === data.token ? true : false;
}

export function addToken(data: IToken): void{
    tokens.push(data);
}