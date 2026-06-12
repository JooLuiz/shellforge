"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { handleApiRequest } = require("../handlers/apiRequestHandler");

const noopLogInfo = () => {};

function createMockResponse({ status = 200, headersMap = {}, body = {} }) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: "OK",
    headers: {
      get: (name) => {
        const lowercaseName = name.toLowerCase();
        const entry = Object.entries(headersMap).find(
          ([key]) => key.toLowerCase() === lowercaseName
        );
        return entry ? entry[1] : null;
      },
      forEach: (callback) => {
        Object.entries(headersMap).forEach(([headerName, headerValue]) => {
          callback(headerValue, headerName);
        });
      },
    },
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}

test("apiRequest stores { status, headers, body } under storeAs key", async (testContext) => {
  const responseBody = { id: 42, name: "Alice" };
  const responseHeaders = { "content-type": "application/json", "x-request-id": "abc123" };
  const mockResponse = createMockResponse({ status: 200, headersMap: responseHeaders, body: responseBody });

  testContext.mock.method(globalThis, "fetch", async () => mockResponse);

  const runtimeContext = {};
  const step = {
    url: "https://api.example.com/users/1",
    storeAs: "userResponse",
  };

  await handleApiRequest({}, step, noopLogInfo, runtimeContext);

  assert.ok(runtimeContext.userResponse, "storeAs key must be set in runtimeContext");
  assert.strictEqual(runtimeContext.userResponse.status, 200, "status must match response status");
  assert.deepStrictEqual(
    runtimeContext.userResponse.body,
    responseBody,
    "body must match parsed response JSON"
  );
  assert.strictEqual(
    runtimeContext.userResponse.headers["content-type"],
    "application/json",
    "headers must include content-type"
  );
  assert.strictEqual(
    runtimeContext.userResponse.headers["x-request-id"],
    "abc123",
    "headers must include x-request-id"
  );
});

test("apiRequest does not set runtimeContext when storeAs is absent", async (testContext) => {
  const mockResponse = createMockResponse({ status: 200, headersMap: { "content-type": "application/json" }, body: {} });
  testContext.mock.method(globalThis, "fetch", async () => mockResponse);

  const runtimeContext = {};
  const step = { url: "https://api.example.com/items" };

  await handleApiRequest({}, step, noopLogInfo, runtimeContext);

  assert.deepStrictEqual(runtimeContext, {}, "runtimeContext must remain empty when storeAs is absent");
});

test("apiRequest throws when HTTP error and ignoreHttpErrors is not set", async (testContext) => {
  const mockResponse = createMockResponse({
    status: 404,
    headersMap: { "content-type": "application/json" },
    body: { error: "Not found" },
  });
  mockResponse.ok = false;
  mockResponse.status = 404;
  mockResponse.statusText = "Not Found";

  testContext.mock.method(globalThis, "fetch", async () => mockResponse);

  const step = { url: "https://api.example.com/missing" };

  await assert.rejects(
    () => handleApiRequest({}, step, noopLogInfo, {}),
    /API request failed with status 404/,
    "must throw when response is not ok"
  );
});

test("apiRequest stores body on HTTP error when ignoreHttpErrors is true", async (testContext) => {
  const responseBody = { error: "Unprocessable" };
  const mockResponse = createMockResponse({
    status: 422,
    headersMap: { "content-type": "application/json" },
    body: responseBody,
  });
  mockResponse.ok = false;
  mockResponse.status = 422;
  mockResponse.statusText = "Unprocessable Entity";

  testContext.mock.method(globalThis, "fetch", async () => mockResponse);

  const runtimeContext = {};
  const step = {
    url: "https://api.example.com/validate",
    storeAs: "validationError",
    ignoreHttpErrors: true,
  };

  await handleApiRequest({}, step, noopLogInfo, runtimeContext);

  assert.strictEqual(runtimeContext.validationError.status, 422);
  assert.deepStrictEqual(runtimeContext.validationError.body, responseBody);
});

test("apiRequest does not attach body for HEAD requests", async (testContext) => {
  let capturedRequestOptions = null;
  const mockResponse = createMockResponse({ status: 200, headersMap: {}, body: "" });
  mockResponse.text = async () => "";

  testContext.mock.method(globalThis, "fetch", async (_url, requestOptions) => {
    capturedRequestOptions = requestOptions;
    return mockResponse;
  });

  const step = {
    method: "HEAD",
    url: "https://api.example.com/resource",
    body: { should: "not-send" },
  };

  await handleApiRequest({}, step, noopLogInfo, {});

  assert.strictEqual(capturedRequestOptions.method, "HEAD");
  assert.equal(capturedRequestOptions.body, undefined);
});

test("apiRequest does not attach body for OPTIONS requests", async (testContext) => {
  let capturedRequestOptions = null;
  const mockResponse = createMockResponse({ status: 204, headersMap: {}, body: "" });
  mockResponse.text = async () => "";

  testContext.mock.method(globalThis, "fetch", async (_url, requestOptions) => {
    capturedRequestOptions = requestOptions;
    return mockResponse;
  });

  const step = {
    method: "OPTIONS",
    url: "https://api.example.com/resource",
    body: { should: "not-send" },
  };

  await handleApiRequest({}, step, noopLogInfo, {});

  assert.strictEqual(capturedRequestOptions.method, "OPTIONS");
  assert.equal(capturedRequestOptions.body, undefined);
});

test("apiRequest supports query params basic auth string body and text responses", async (testContext) => {
  let capturedUrl = "";
  let capturedRequestOptions = null;
  const mockResponse = createMockResponse({
    status: 200,
    headersMap: { "content-type": "text/plain" },
    body: "plain-text-response",
  });
  mockResponse.json = async () => {
    throw new Error("should not parse json");
  };
  mockResponse.text = async () => "plain-text-response";

  testContext.mock.method(globalThis, "fetch", async (url, requestOptions) => {
    capturedUrl = url;
    capturedRequestOptions = requestOptions;
    return mockResponse;
  });

  const runtimeContext = {};
  const step = {
    url: "https://api.example.com/search",
    method: "post",
    params: {
      q: "shellforge",
      tags: ["a", "b"],
      ignored: null,
    },
    auth: {
      type: "basic",
      username: "user",
      password: "secret",
    },
    body: "raw-body",
    timeout: 1000,
    storeAs: "searchResponse",
  };

  await handleApiRequest({}, step, noopLogInfo, runtimeContext);

  assert.match(capturedUrl, /q=shellforge/);
  assert.match(capturedUrl, /tags=a/);
  assert.equal(capturedRequestOptions.body, "raw-body");
  assert.equal(capturedRequestOptions.headers.Authorization, "Basic dXNlcjpzZWNyZXQ=");
  assert.equal(runtimeContext.searchResponse.body, "plain-text-response");
});

test("apiRequest stringifies object bodies and sets json content type when missing", async (testContext) => {
  let capturedRequestOptions = null;
  const mockResponse = createMockResponse({
    status: 201,
    headersMap: { "content-type": "application/json" },
    body: { created: true },
  });

  testContext.mock.method(globalThis, "fetch", async (_url, requestOptions) => {
    capturedRequestOptions = requestOptions;
    return mockResponse;
  });

  await handleApiRequest(
    {},
    {
      method: "POST",
      url: "https://api.example.com/items",
      body: { name: "widget" },
    },
    noopLogInfo,
    {}
  );

  assert.equal(capturedRequestOptions.headers["Content-Type"], "application/json");
  assert.equal(capturedRequestOptions.body, JSON.stringify({ name: "widget" }));
});

test("apiRequest preserves an existing json content type header", async (testContext) => {
  let capturedRequestOptions = null;
  const mockResponse = createMockResponse({
    status: 200,
    headersMap: { "content-type": "application/json" },
    body: { ok: true },
  });

  testContext.mock.method(globalThis, "fetch", async (_url, requestOptions) => {
    capturedRequestOptions = requestOptions;
    return mockResponse;
  });

  await handleApiRequest(
    {},
    {
      method: "POST",
      url: "https://api.example.com/items",
      headers: { "Content-Type": "application/vnd.api+json" },
      body: { name: "widget" },
    },
    noopLogInfo,
    {}
  );

  assert.equal(capturedRequestOptions.headers["Content-Type"], "application/vnd.api+json");
});
