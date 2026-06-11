"use strict";

/**
 * Role: Executes HTTP API requests and stores response data in runtime context.
 * Not in this file: Template interpolation and step orchestration.
 * Key dependencies: Node.js fetch API and action-runner shared context.
 * See also: action-runner/interpolateContext.js, action-runner/runSteps.js
 */

function appendParamsToUrl(baseUrl, params = {}) {
  const parsedUrl = new URL(baseUrl);

  Object.entries(params).forEach(([parameterName, parameterValue]) => {
    if (parameterValue === undefined || parameterValue === null) {
      return;
    }

    if (Array.isArray(parameterValue)) {
      parameterValue.forEach((value) => parsedUrl.searchParams.append(parameterName, String(value)));
      return;
    }

    parsedUrl.searchParams.set(parameterName, String(parameterValue));
  });

  return parsedUrl.toString();
}

function buildRequestHeaders(step) {
  const requestHeaders = { ...(step.headers ?? {}) };

  if (step.auth?.type === "basic") {
    const username = step.auth.username ?? "";
    const password = step.auth.password ?? "";
    const encodedCredentials = Buffer.from(`${username}:${password}`, "utf8").toString("base64");

    requestHeaders.Authorization = `Basic ${encodedCredentials}`;
  }

  return requestHeaders;
}

function buildRequestBody(step, requestHeaders) {
  if (step.body === undefined) {
    return undefined;
  }

  const hasJsonContentType = Object.keys(requestHeaders).some((headerName) => {
    return headerName.toLowerCase() === "content-type";
  });

  if (typeof step.body === "string") {
    return step.body;
  }

  if (!hasJsonContentType) {
    requestHeaders["Content-Type"] = "application/json";
  }

  return JSON.stringify(step.body);
}

async function parseResponseBody(response) {
  const responseContentType = response.headers.get("content-type") ?? "";

  if (responseContentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

async function handleApiRequest(_resources, step, logInfo, runtimeContext) {
  const requestMethod = (step.method ?? "GET").toUpperCase();
  const requestUrl = appendParamsToUrl(step.url, step.params);
  const requestHeaders = buildRequestHeaders(step);
  const requestBody = buildRequestBody(step, requestHeaders);

  logInfo(`${requestMethod} ${requestUrl}`);

  const requestOptions = {
    method: requestMethod,
    headers: requestHeaders,
  };

  if (requestBody !== undefined && !["GET", "HEAD", "OPTIONS"].includes(requestMethod)) {
    requestOptions.body = requestBody;
  }

  if (typeof step.timeout === "number" && step.timeout > 0) {
    requestOptions.signal = AbortSignal.timeout(step.timeout);
  }

  const response = await fetch(requestUrl, requestOptions);
  const responseBody = await parseResponseBody(response);

  if (!response.ok && step.ignoreHttpErrors !== true) {
    const serializedResponseBody =
      typeof responseBody === "string" ? responseBody : JSON.stringify(responseBody);

    throw new Error(
      `[Action Runner] API request failed with status ${response.status} (${response.statusText}). Response: ${serializedResponseBody}`
    );
  }

  if (typeof step.storeAs === "string" && step.storeAs.length > 0) {
    const responseHeaders = {};
    response.headers.forEach((headerValue, headerName) => {
      responseHeaders[headerName] = headerValue;
    });

    runtimeContext[step.storeAs] = {
      status: response.status,
      headers: responseHeaders,
      body: responseBody,
    };

    logInfo(`Stored API response in context.${step.storeAs} (status ${response.status})`);
  }

  return null;
}

module.exports = {
  handleApiRequest,
};
