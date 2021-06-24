/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from 'events';
import express from 'express';

export type headers = {
  [header: string]: string | string[] | undefined;
};

export default class Response extends EventEmitter {
  public statusCode: number;
  public headersSent: boolean;

  public setHeader: any;
  public status: any;
  public json: any;

  private _closed: boolean;
  private _headers: headers;

  constructor(statusCode: number, headers?: headers) {
    super();
    this._closed = false;
    this._headers = headers || {};
    this.statusCode = statusCode;
    this.headersSent = false;

    this.setHeader = jest.fn((key: string, value: string) => {
      this._headers[key] = value;
      return this;
    });

    this.status = jest.fn((statusCode: number): this => {
      this.statusCode = statusCode;
      return this;
    });

    this.json = jest.fn((): this => {
      this.headersSent = true;
      return this;
    });
  }

  close(error?: Error) {
    if (this._closed) {
      return;
    }
    this._closed = true;
    if (error) {
      this.emit('error', error);
    } else {
      this.emit('finish');
    }
  }

  getHeader(key: string): string | string[] | undefined {
    return this._headers[key];
  }

  getHeaders() {
    return this._headers;
  }

  append(key: string, value: string) {
    this._headers[key] = value;
  }

  reset() {
    this.removeAllListeners();
    this.setHeader.mockReset();
    this.status.mockReset();
  }

  asResponse(): express.Response {
    return this as any as express.Response;
  }
}
