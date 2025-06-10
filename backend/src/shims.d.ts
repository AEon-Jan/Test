
declare module 'express' {
  export interface Request {
    body?: any;
    params: any;
    query: any;
    header(name: string): string | undefined;
  }

  export interface Response {
    json(data: any): this;
    send(data: any): this;
    sendFile(path: string): void;
    redirect(url: string): void;
    status(code: number): this;
  }

  export interface Application {
    get(path: string, handler: (req: Request, res: Response) => void): void;
    post(path: string, handler: (req: Request, res: Response) => void): void;
    use(...args: any[]): void;
    listen(port: number, cb?: () => void): void;
  }
  function express(): Application;
  namespace express {
    function json(): any;
    function static(root: string): any;
  }
  export = express;
}

declare module 'querystring';
declare module 'fs';
declare module 'path';
declare module 'crypto';
declare var process: any;
declare var __dirname: string;
declare function fetch(input: any, init?: any): Promise<any>;
declare var console: any;
