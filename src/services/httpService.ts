import { IFetchInit } from "../interfaces/fetchInit";

const APIURL = "http://localhost:3000";

export class HttpService {
  async get(url: string, token?: string): Promise<Response> {
    const fetchInit: IFetchInit = {
      method: "GET",

      headers: {},
    };

    if (token) {
      fetchInit.headers["Authorization"] = token;
    }

    const res = await fetch(`${APIURL}${url}`, fetchInit);

    return res;
  }

  async post(url: string, data: any, token?: string): Promise<Response> {
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

    const response = await fetch(`${APIURL}${url}`, fetchInit);

    return response;
  }
}
