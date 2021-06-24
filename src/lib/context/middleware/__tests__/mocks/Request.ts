/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from 'events';
import express from 'express';
import { headers } from './Response';
import { parse } from 'url';

interface IRequestOptions {
  method?:
    | 'GET'
    | 'POST'
    | 'DELETE'
    | 'PATCH'
    | 'PUT'
    | 'HEAD'
    | 'OPTIONS'
    | 'CONNECT';
  headers?: headers;
  app?: express.Express;
}

export default class Request extends EventEmitter {
  private _closed: boolean;

  // Properties
  public baseUrl: string;
  public body: any;
  public cookies: any;
  public fresh: boolean;
  public headers: headers;
  public hostname: string;
  public host: string;
  public ip: string;
  public httpVersion: string;
  public ips: string[];
  public method: string;
  public url: string;
  public originalUrl: string;
  public params: any;
  public path: string;
  public protocol: string;
  public query: any;
  public route: any;
  public secure: boolean;
  public signedCookies: any;
  public stale: boolean;
  public subdomains: string[];
  public xhr: boolean;
  // Methods
  public accepts: any;
  public acceptsCharsets: any;
  public acceptsEncodings: any;
  public acceptsLanguages: any;
  public get: any;
  public header: any;
  public param: any;
  public is: any;
  public range: any;
  // Application
  public app: express.Express;

  private defaultUrl: string | undefined;
  private defaultOptions: IRequestOptions | undefined;

  constructor(url?: string | null, options?: IRequestOptions) {
    super();
    // Properties
    this.url = url ?? '';
    this.baseUrl = '';
    this.body = '';
    this.httpVersion = 'HTTP/1.1';
    this.cookies = {};
    this.fresh = false;
    this.headers = {};
    this.hostname = '';
    this.host = '';
    this.ip = '::1';
    this.ips = [];
    this.method = 'GET';
    this.originalUrl = '';
    this.params = {};
    this.path = '';
    this.protocol = 'http';
    this.query = {};
    this.route = {};
    this.secure = false;
    this.signedCookies = {};
    this.stale = false;
    this.subdomains = [];
    this.xhr = false;
    // Methods
    this.accepts = jest.fn();
    this.acceptsCharsets = jest.fn();
    this.acceptsEncodings = jest.fn();
    this.acceptsLanguages = jest.fn();
    this.get = jest.fn((header: string) => this.headers[header]);
    this.header = this.get;
    this.param = jest.fn((name: string) => this.params[name]);
    this.is = jest.fn();
    this.range = jest.fn();

    // Application
    this.app = options && options.app ? options.app : ({} as express.Express);

    if (typeof url === 'string') {
      this.defaultUrl = url;
      this.originalUrl = url;
      this.defaultOptions = options;
      this.setUrl(this.defaultUrl, this.defaultOptions);
    }

    this._closed = false;
  }

  public setUrl(url: string, options?: IRequestOptions) {
    this.url = url;
    const parsedUrl = parse(url, true);

    this.path = parsedUrl.pathname || '/';
    this.hostname = parsedUrl.hostname || '';
    this.host = this.hostname;
    this.originalUrl = this.path + (parsedUrl.search || '');
    this.query = parsedUrl.query;
    this.protocol = parsedUrl.protocol
      ? parsedUrl.protocol.slice(0, parsedUrl.protocol.length - 1)
      : 'http';
    this.secure = parsedUrl.protocol === 'https:';

    const hostnameParts = this.hostname.split('.');
    if (hostnameParts.length > 2) {
      this.subdomains = hostnameParts.slice(0, hostnameParts.length - 2);
    }

    if (options) {
      if (options.headers) {
        const headers: any = {};
        for (const k of Object.keys(options.headers)) {
          const key = k.toLowerCase();
          headers[key] = options.headers[k];
        }

        this.headers = Object.assign({}, headers);
      }
      if (options.method) {
        this.method = options.method;
      }
    }
  }

  reset() {
    this.accepts.mockReset();
    this.acceptsCharsets.mockReset();
    this.acceptsEncodings.mockReset();
    this.acceptsLanguages.mockReset();
    this.get.mockReset();
    this.is.mockReset();
    this.range.mockReset();
    this.removeAllListeners();
  }

  asRequest(): express.Request {
    return this as any as express.Request;
  }
}
