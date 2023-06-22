export type IFetchInit = {
  method: string;
  headers: {
    "Content-Type"?: string;
    Authorization?: string;
  };
  body?: string;
}
