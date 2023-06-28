export class AppStorage{
    setToken(tokenName: string, tokenValue: string){
        localStorage.setItem(tokenName, tokenValue);
    }

    getToken(tokenName: string): string | null{
        return localStorage.getItem(tokenName);
    }
}