import { test, expect } from '../src/fixtures/merge.fixtures';
import * as http from 'http';
import { AddressInfo } from 'net';
import { httpRequest, APIOptions } from '../src/api/http_methods';

type Seen = { url: string; method: string; headers: http.IncomingHttpHeaders; body: string };
type Reply = { status: number; body: string; contentType: string };

let server: http.Server;
let baseUrl: string;
let onRequest: ((seen: Seen) => void) | undefined;
let reply: Partial<Reply> | undefined;

test.beforeAll(async () => {
  server = http.createServer((req, res) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      res.statusCode = reply?.status ?? 200;
      res.setHeader('content-type', reply?.contentType ?? 'application/json');
      res.end(reply?.body ?? JSON.stringify({ ok: true, echo: body }));
      onRequest?.({ url: req.url || '', method: req.method || '', headers: req.headers, body });
      onRequest = undefined;
    });
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

test.afterAll(async () => {
  await new Promise<void>(resolve => server.close(() => resolve()));
});

test.afterEach(() => {
  reply = undefined;
  onRequest = undefined;
});

function nextRequest(): Promise<Seen> {
  return new Promise(resolve => (onRequest = resolve));
}

test('GET передаёт параметры один раз и разбирает JSON', async () => {
  const seen = nextRequest();
  const options: APIOptions = { url: baseUrl, path: '/users', method: 'GET', params: { page: 1, limit: 5 } };

  const response = await httpRequest('GET /users', options);
  const request = await seen;

  expect(request.method).toBe('GET');
  expect(request.url).toBe('/users?page=1&limit=5');
  expect(response.json).toEqual({ ok: true, echo: '' });
});

test('POST отправляет JSON-тело', async () => {
  const seen = nextRequest();
  const options: APIOptions = {
    url: baseUrl,
    path: '/users',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { name: 'Ivan' },
  };

  await httpRequest('POST /users', options);
  const request = await seen;

  expect(request.headers['content-type']).toBe('application/json');
  expect(JSON.parse(request.body)).toEqual({ name: 'Ivan' });
});

test('POST отправляет FormData как multipart', async () => {
  const seen = nextRequest();
  const form = new FormData();
  form.append('userId', '42');
  const options: APIOptions = { url: baseUrl, path: '/upload', method: 'POST', data: form };

  await httpRequest('POST /upload', options);
  const request = await seen;

  expect(request.headers['content-type']).toMatch(/^multipart\/form-data; boundary=/);
  expect(request.body).toContain('name="userId"');
  expect(request.body).toContain('42');
});

test('не-JSON ответ не ломает запрос', async () => {
  reply = { status: 404, body: 'not found', contentType: 'text/plain' };
  const options: APIOptions = { url: baseUrl, path: '/missing', method: 'GET' };

  const response = await httpRequest('GET /missing', options);

  expect(response.promise.status()).toBe(404);
  expect(response.promise.status()).toBeNumber();
  expect(response.json).toBeNull();
});

test('кастомные матчеры различают типы', () => {
  expect(undefined).toBeUndefined();
  expect(null).toBeNull();
  expect(null).not.toBeObject();
  expect({}).toBeObject();
  expect(42).toBeNumber();
  expect('text').toBeString();
  expect(true).toBeBoolean();
  expect([]).toBeArray();
});
