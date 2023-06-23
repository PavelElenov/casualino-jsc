export declare class HttpService {
    get(url: string, token?: string): Promise<Response>;
    post(url: string, data: any, token?: string): Promise<Response>;
}
