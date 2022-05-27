
export type ResponseHeaders = Record<string, string> & {
    "set-cookie"?: string[]
};

export type Method =
    | 'get' | 'GET'
    | 'delete' | 'DELETE'
    | 'head' | 'HEAD'
    | 'options' | 'OPTIONS'
    | 'post' | 'POST'
    | 'put' | 'PUT'
    | 'patch' | 'PATCH'
    | 'purge' | 'PURGE'
    | 'link' | 'LINK'
    | 'unlink' | 'UNLINK';

export type FuInterceptorCallback = (option: object, config: object, res: any) => void;

export interface FuInterceptorhandler {
    type: string;
    cb: FuInterceptorCallback;
    options: object;
}

export interface RequestConfig<D = any> {
    url?: string;
    connector: any,
    method?: Method | string;
    interceptor: FuInterceptor,
    //TO COMPLETE
}

export interface Response<T = any, D = any>  {
    status: number;
    statusText: string;
    data: T;
    body: string;
    headers: ResponseHeaders;
    config: RequestConfig<D>;
    request?: any;
    isFromCache: boolean;
}

export interface WebSocketConfig<D = any> {
    connector: any,
    protocol: string[],
    reconnect: boolean,
    maxReconnect: number,
    reconnectInterval: number,
    interceptor: FuInterceptor,
    reconnectIntervalByPower: boolean
}

export interface Config<D = any> {
    httpConfig: RequestConfig;
    wsConfig: WebSocketConfig;
}

export interface FuInterceptor {
    constructor(config?: RequestConfig);
    register(type: string, cb: FuInterceptorCallback, options?: object): number;
    filter(predicate: (value: any, index: number, array: any[]) => void, thisArg?: any): FuInterceptorhandler[];
    forEach(cb: (param: FuInterceptorhandler) => void, type: string): void;
    //TO COMPLETE
}

export interface KyofuucHttp {
    constructor(config?: RequestConfig);
    getUri(config?: RequestConfig): string;
    request<T = any, R = Response<T>, D = any>(config: RequestConfig<D>): Promise<R>;
    get<T = any, R = Response<T>, D = any>(url: string, config?: RequestConfig<D>): Promise<R>;
    delete<T = any, R = Response<T>, D = any>(url: string, config?: RequestConfig<D>): Promise<R>;
    head<T = any, R = Response<T>, D = any>(url: string, config?: RequestConfig<D>): Promise<R>;
    options<T = any, R = Response<T>, D = any>(url: string, config?: RequestConfig<D>): Promise<R>;
    post<T = any, R = Response<T>, D = any>(url: string, data?: D, config?: RequestConfig<D>): Promise<R>;
    put<T = any, R = Response<T>, D = any>(url: string, data?: D, config?: RequestConfig<D>): Promise<R>;
    patch<T = any, R = Response<T>, D = any>(url: string, data?: D, config?: RequestConfig<D>): Promise<R>;
}

export interface KyofuucWS {
    constructor(config?: WebSocketConfig);
}

export interface FFS extends KyofuucHttp {
    kfWS: KyofuucWS;
    queueManager: KyofuucWS;
    ws: (url: string, config?: WebSocketConfig) => KyofuucWS;
    // to fix static types
}

export interface FFSStatic extends FFS {
    init: (config?: Config | RequestConfig | WebSocketConfig) => FFS;
    KyofuucHttp: KyofuucHttp;
    KyofuucWS: KyofuucWS;
    FuInterceptor: FuInterceptor;
}

declare const ffs: FFSStatic;

export default ffs;
//TO COMPLETE
