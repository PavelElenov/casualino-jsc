import { IFetchInit } from "../interfaces/fetchInit";

const APIURL = "http://localhost:3000";

export class HttpService {
  async get(url: string, token?: string): Promise<any> {
    const fetchInit: IFetchInit = {
      method: "GET",

      headers: {},
    };

    if (token) {
      fetchInit.headers["Authorization"] = token;
    }

    const res = await fetch(`${APIURL}${url}`, fetchInit);
    const data = await res.json();

    if (res.ok) {
      return data;
    }else{
      return this.checkResStatus(res.status);
    }
  }

  async post(url: string, data: any, token?: string): Promise<any> {
    const fetchInit: IFetchInit = {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    };

    if (token) {
      fetchInit.headers["Authorization"] = token;
    }

    const res = await fetch(`${APIURL}${url}`, fetchInit);
    const resData = await res.json();

    if (res.ok) {
      return resData;
    }else{
      return this.checkResStatus(res.status);
    }
  }

  checkResStatus(status: number) {
    if (status == 400) {
      throw new Error('Not found');
    } else if (status == 401) {
      throw new Error('Unauthorized');
    } else {
      throw new Error('Server Error'); 
    }
  }
}
