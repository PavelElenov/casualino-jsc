export declare class HttpService {
    get(url: string, token?: string): Promise<any>;
    post(url: string, data: any, token?: string): Promise<any>;
    checkResStatus(status: number): void;
}
