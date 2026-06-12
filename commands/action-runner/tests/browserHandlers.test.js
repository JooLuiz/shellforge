"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { handleNavigate } = require("../handlers/browserHandlers/navigateHandler");
const { handleType } = require("../handlers/browserHandlers/typeHandler");
const { handleClick } = require("../handlers/browserHandlers/clickHandler");
const { handleWaitForPageState } = require("../handlers/browserHandlers/waitForPageStateHandler");
const { handleSetWebStorage } = require("../handlers/browserHandlers/setWebStorageHandler");
const { handleCloseBrowser } = require("../handlers/browserHandlers/closeBrowserHandler");
const { prepareForSelectorAction } = require("../handlers/browserHandlers/browserCommon");

function createMockResources(initialPage) {
  let activePage = initialPage;
  let browserClosed = false;

  return {
    async getBrowser() {
      return {
        pages: async () => [activePage],
      };
    },
    async getPage() {
      return activePage;
    },
    setPage(nextPage) {
      activePage = nextPage;
    },
    async closeBrowser() {
      browserClosed = true;
    },
    wasBrowserClosed() {
      return browserClosed;
    },
  };
}

function createInteractivePage(options = {}) {
  const logMessages = [];

  return {
    logMessages,
    isClosed: () => false,
    goto: async () => {},
    focus: async () => {},
    click: async () => {},
    keyboard: {
      type: async () => {},
    },
    evaluate: async () => options.evaluateResult ?? true,
    $: async () => ({
      click: async () => {},
      evaluate: async (callback) => callback({ click: () => {} }),
      contentFrame: () => options.contentFrame ?? null,
    }),
    waitForNavigation: async () => {},
  };
}

test("handleNavigate opens url and optionally waits for loading overlays", async () => {
  const navigatedUrls = [];
  const page = createInteractivePage();
  page.goto = async (url) => {
    navigatedUrls.push(url);
  };
  const resources = createMockResources(page);
  const logMessages = [];

  await handleNavigate(
    resources,
    { action: "navigate", url: "https://example.com", waitForLoading: true },
    (message) => logMessages.push(message)
  );

  assert.deepEqual(navigatedUrls, ["https://example.com"]);
  assert.match(logMessages.join("\n"), /Navigated to https:\/\/example.com/);
});

test("handleType focuses selector and types value on the main page", async () => {
  const focusedSelectors = [];
  const typedValues = [];
  const page = createInteractivePage();
  page.focus = async (selector) => {
    focusedSelectors.push(selector);
  };
  page.keyboard.type = async (value) => {
    typedValues.push(value);
  };
  const resources = createMockResources(page);

  await handleType(
    resources,
    { action: "type", selector: "#email", value: "user@example.com" },
    () => {}
  );

  assert.deepEqual(focusedSelectors, ["#email"]);
  assert.deepEqual(typedValues, ["user@example.com"]);
});

test("handleType supports iframe selectors via frame typing", async () => {
  const frameTypedValues = [];
  const matchingFrame = {
    focus: async () => {},
    type: async (_selector, value) => {
      frameTypedValues.push(value);
    },
    evaluate: async () => true,
    childFrames: () => [],
  };
  const page = createInteractivePage();
  page.evaluate = async () => false;
  page.$ = async () => ({
    contentFrame: () => matchingFrame,
  });
  const resources = createMockResources(page);

  await handleType(
    resources,
    {
      action: "type",
      selector: "#email",
      value: "iframe-user",
      iframe: "#app-frame",
      timeout: 1000,
    },
    () => {}
  );

  assert.deepEqual(frameTypedValues, ["iframe-user"]);
});

test("handleClick uses clickSelectorSafe path when waiting for interactable element", async () => {
  let clicked = false;
  const page = createInteractivePage();
  page.$ = async () => ({
    click: async () => {
      clicked = true;
    },
    evaluate: async () => {},
  });
  const resources = createMockResources(page);

  await handleClick(
    resources,
    { action: "click", selector: "#submit", timeout: 1000 },
    () => {}
  );

  assert.equal(clicked, true);
});

test("handleClick supports waitForNavigation branch", async () => {
  let navigationWaitStarted = false;
  let clicked = false;
  const page = createInteractivePage();
  page.waitForNavigation = async () => {
    navigationWaitStarted = true;
  };
  page.click = async () => {
    clicked = true;
  };
  const resources = createMockResources(page);

  await handleClick(
    resources,
    {
      action: "click",
      selector: "#submit",
      waitForNavigation: true,
      timeout: 1000,
    },
    () => {}
  );

  assert.equal(navigationWaitStarted, true);
  assert.equal(clicked, true);
});

test("handleClick skips interactable wait when waitForInteractable is false", async () => {
  let clicked = false;
  const page = createInteractivePage();
  page.click = async () => {
    clicked = true;
  };
  const resources = createMockResources(page);

  await handleClick(
    resources,
    {
      action: "click",
      selector: "#submit",
      waitForInteractable: false,
      timeout: 1000,
    },
    () => {}
  );

  assert.equal(clicked, true);
});

test("handleWaitForPageState waits for urlContains", async () => {
  const page = createInteractivePage();
  const resources = createMockResources(page);
  const logMessages = [];

  await handleWaitForPageState(
    resources,
    { action: "waitForPageState", urlContains: "/dashboard", timeout: 1000 },
    (message) => logMessages.push(message)
  );

  assert.match(logMessages.join("\n"), /URL contains \/dashboard/);
});

test("handleWaitForPageState waits for loading overlays only", async () => {
  const page = createInteractivePage();
  const resources = createMockResources(page);
  const logMessages = [];

  await handleWaitForPageState(
    resources,
    { action: "waitForPageState", waitForLoading: true, timeout: 1000 },
    (message) => logMessages.push(message)
  );

  assert.match(logMessages.join("\n"), /Loading overlays finished/);
});

test("handleSetWebStorage writes localStorage sessionStorage and cookies", async () => {
  const evaluateCalls = [];
  const cookies = [];
  const page = createInteractivePage();
  page.evaluate = async (callback, payload) => {
    evaluateCalls.push(payload);
  };
  page.setCookie = async (...nextCookies) => {
    cookies.push(...nextCookies);
  };
  const resources = createMockResources(page);

  await handleSetWebStorage(
    resources,
    {
      action: "setWebStorage",
      localStorage: { token: "abc" },
      sessionStorage: { mode: "test" },
      cookies: [{ name: "sid", value: "1" }],
    },
    () => {}
  );

  assert.equal(evaluateCalls.length, 2);
  assert.deepEqual(cookies, [{ name: "sid", value: "1" }]);
});

test("handleCloseBrowser closes resources browser", async () => {
  const page = createInteractivePage();
  const resources = createMockResources(page);

  await handleCloseBrowser(resources, { action: "closeBrowser" }, () => {});

  assert.equal(resources.wasBrowserClosed(), true);
});

test("prepareForSelectorAction returns page when waitForLoading is false", async () => {
  const page = createInteractivePage();
  const browser = { pages: async () => [page] };

  const result = await prepareForSelectorAction(browser, page, {}, () => {});

  assert.equal(result, page);
});

test("prepareForSelectorAction waits for loading overlays when configured", async () => {
  const page = createInteractivePage();
  const browser = { pages: async () => [page] };

  const result = await prepareForSelectorAction(
    browser,
    page,
    { waitForLoading: true, timeout: 1000 },
    () => {}
  );

  assert.equal(result, page);
});

test("handleClick supports iframe clicks", async () => {
  let frameClicked = false;
  const matchingFrame = {
    evaluate: async () => true,
    childFrames: () => [],
    $: async () => ({
      evaluate: async (callback) => {
        callback({ click: () => {
          frameClicked = true;
        } });
      },
    }),
  };
  const parentFrame = {
    evaluate: async () => false,
    childFrames: () => [matchingFrame],
  };
  const page = createInteractivePage();
  page.$ = async (selector) => {
    if (selector === "#app-frame") {
      return { contentFrame: () => parentFrame };
    }

    return {
      click: async () => {},
      evaluate: async () => {},
    };
  };
  page.evaluate = async () => false;
  const resources = createMockResources(page);
  const logMessages = [];

  await handleClick(
    resources,
    {
      action: "click",
      selector: "#submit",
      iframe: "#app-frame",
      timeout: 1000,
    },
    (message) => logMessages.push(message)
  );

  assert.equal(frameClicked, true);
  assert.match(logMessages.join("\n"), /inside iframe/);
});

test("handleClick waits for post-click url and selector conditions", async () => {
  const page = createInteractivePage();
  page.evaluate = async (evaluateFn, ...args) => {
    if (args.length === 1 && typeof args[0] === "string") {
      if (args[0] === "/done") {
        global.window = { location: { href: "https://example.com/done" } };
        return evaluateFn(args[0]);
      }

      global.document = {
        querySelector: () => ({
          getBoundingClientRect: () => ({ width: 10, height: 10 }),
        }),
      };
      global.window = {
        ...global.window,
        getComputedStyle: () => ({
          display: "block",
          visibility: "visible",
          pointerEvents: "auto",
        }),
      };
      return evaluateFn(args[0]);
    }

    return true;
  };
  const resources = createMockResources(page);
  const logMessages = [];

  await handleClick(
    resources,
    {
      action: "click",
      selector: "#submit",
      waitForUrl: "/done",
      waitForSelector: "#confirmation",
      timeout: 1000,
    },
    (message) => logMessages.push(message)
  );

  assert.match(logMessages.join("\n"), /URL contains \/done/);
  assert.match(logMessages.join("\n"), /Waited for visible selector #confirmation/);
});

test("handleClick logs when waitForNavigation rejects", async () => {
  const page = createInteractivePage();
  page.waitForNavigation = async () => {
    throw new Error("navigation timeout");
  };
  page.click = async () => {};
  const resources = createMockResources(page);
  const logMessages = [];

  await handleClick(
    resources,
    {
      action: "click",
      selector: "#submit",
      waitForNavigation: true,
      timeout: 1000,
    },
    (message) => logMessages.push(message)
  );

  assert.match(logMessages.join("\n"), /waitForNavigation did not resolve cleanly/);
});

test("handleWaitForPageState resolves selector inside iframe", async () => {
  const matchingFrame = {
    evaluate: async () => true,
    childFrames: () => [],
  };
  const parentFrame = {
    evaluate: async () => false,
    childFrames: () => [matchingFrame],
  };
  const page = createInteractivePage();
  page.$ = async () => ({
    contentFrame: () => parentFrame,
  });
  page.evaluate = async () => false;
  const resources = createMockResources(page);
  const logMessages = [];

  await handleWaitForPageState(
    resources,
    {
      action: "waitForPageState",
      iframe: "#app-frame",
      selector: ".loaded",
      timeout: 1000,
    },
    (message) => logMessages.push(message)
  );

  assert.match(logMessages.join("\n"), /found in iframe/);
});

test("handleSetWebStorage serializes non-string storage values", async () => {
  const evaluateCalls = [];
  const page = createInteractivePage();
  page.evaluate = async (callback, payload) => {
    evaluateCalls.push(payload);
  };
  const resources = createMockResources(page);

  await handleSetWebStorage(
    resources,
    {
      action: "setWebStorage",
      localStorage: { profile: { role: "admin" } },
      sessionStorage: { mode: ["a", "b"] },
    },
    () => {}
  );

  assert.deepEqual(evaluateCalls[0], { profile: { role: "admin" } });
  assert.deepEqual(evaluateCalls[1], { mode: ["a", "b"] });
});
