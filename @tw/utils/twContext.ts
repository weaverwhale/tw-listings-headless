import { type SpanContext } from 'dd-trace';
import { projectId } from '@tw/constants';
import { Message } from '@tw/pubsub';
import { AsyncLocalStorage } from 'node:async_hooks';
import { Request } from 'express';
import { traceIdFieldName, twContextSymbol } from './constants';
import { Socket } from 'socket.io';

export interface RequestGlobalKeys {
  logParams?: {
    shopId?: string;
    [traceIdFieldName]?: string;
    pubSubMessageId?: string;
    userId?: string;
    wsEventName?: string;
    wsEventId?: string;
    wsSocketId?: string;
  };
  context?: {
    req?: Request;
    socket?: Socket;
    traceId?: string;
    pubsubMessage?: Message;
    spanContext?: SpanContext;
    parentLogParams?: Record<string, any>;
    uf: boolean;
  };
  contextInput?: any;
}

if (!globalThis[twContextSymbol]) {
  globalThis[twContextSymbol] = new AsyncLocalStorage();
}

export const asyncLocalStorage = globalThis[
  twContextSymbol
] as AsyncLocalStorage<RequestGlobalKeys>;

export function getStore() {
  return asyncLocalStorage.getStore() || {};
}

export function getStoreKey<T extends keyof RequestGlobalKeys>(key: T): RequestGlobalKeys[T] {
  const store = getStore();
  const value = store[key];
  if (!value) {
    store[key] = {};
  }
  return store[key];
}

export function setStoreKey<T extends keyof RequestGlobalKeys>(
  key: T,
  value: RequestGlobalKeys[T]
): void {
  const store = getStore();
  store[key] = value;
}

export function startTrace() {
  const logParams = getStoreKey('logParams');
  const context = getStoreKey('context');
  const traceId = createTraceId();
  logParams[traceIdFieldName] = createTraceField(traceId);
  context.traceId = traceId;
}

export function createTraceId() {
  const traceId = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return traceId;
}

export function createTraceField(traceId: string) {
  return `projects/${projectId}/traces/${traceId}`;
}
