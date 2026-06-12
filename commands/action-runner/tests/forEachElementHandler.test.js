"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { handleForEachElement } = require("../handlers/browserHandlers/forEachElementHandler");

function createMockPage(validEntries) {
  return {
    async evaluate(_evaluateFn, ...args) {
      if (args.length === 4) {
        return validEntries;
      }

      return undefined;
    },
  };
}

function createMockResources(page) {
  let activePage = page;

  return {
    async getBrowser() {
      return {};
    },
    async getPage() {
      return activePage;
    },
    setPage(nextPage) {
      activePage = nextPage;
    },
  };
}

test("forEachElement runtime allows wait sub-step", async () => {
  const page = createMockPage([{ index: 0, text: "entry-1" }]);
  const resources = createMockResources(page);
  const runtimeContext = {};

  await assert.doesNotReject(() =>
    handleForEachElement(
      resources,
      {
        action: "forEachElement",
        selector: ".row",
        steps: [{ action: "wait", ms: 1 }],
      },
      () => {},
      runtimeContext
    )
  );
});

test("forEachElement runtime allows apiRequest sub-step", async () => {
  const page = createMockPage([{ index: 0, text: "entry-1" }]);
  const resources = createMockResources(page);
  const runtimeContext = {};
  const originalFetch = global.fetch;

  global.fetch = async () => ({
    ok: true,
    status: 200,
    statusText: "OK",
    headers: {
      get(headerName) {
        if (headerName.toLowerCase() === "content-type") {
          return "application/json";
        }
        return null;
      },
      forEach(callback) {
        callback("application/json", "content-type");
      },
    },
    async json() {
      return { tracked: true };
    },
    async text() {
      return "";
    },
  });

  try {
    await assert.doesNotReject(() =>
      handleForEachElement(
        resources,
        {
          action: "forEachElement",
          selector: ".row",
          steps: [{ action: "apiRequest", url: "https://example.com/track", storeAs: "apiResult" }],
        },
        () => {},
        runtimeContext
      )
    );

    assert.equal(runtimeContext.apiResult.status, 200);
    assert.deepEqual(runtimeContext.apiResult.body, { tracked: true });
  } finally {
    global.fetch = originalFetch;
  }
});

test("forEachElement runtime rejects disallowed shell sub-step", async () => {
  const page = createMockPage([{ index: 0, text: "entry-1" }]);
  const resources = createMockResources(page);

  await assert.rejects(
    () =>
      handleForEachElement(
        resources,
        {
          action: "forEachElement",
          selector: ".row",
          steps: [{ action: "shell", command: "echo invalid" }],
        },
        () => {},
        {}
      ),
    /Unsupported sub-step action "shell"/
  );
});

test("forEachElement skips processing when no valid entries are found", async () => {
  const page = createMockPage([]);
  const resources = createMockResources(page);
  const logMessages = [];

  await handleForEachElement(
    resources,
    {
      action: "forEachElement",
      selector: ".row",
      steps: [{ action: "wait", ms: 1 }],
    },
    (message) => logMessages.push(message),
    {}
  );

  assert.match(logMessages.join("\n"), /Found 0 valid element\(s\) to process/);
});

test("forEachElement runs clickSelector before sub-steps when configured", async () => {
  const evaluateCalls = [];
  const page = {
    async evaluate(evaluateFn, ...args) {
      evaluateCalls.push(args);

      if (args.length === 4) {
        return [{ index: 0, text: "entry-1" }];
      }

      return undefined;
    },
  };
  const resources = createMockResources(page);

  await handleForEachElement(
    resources,
    {
      action: "forEachElement",
      selector: ".row",
      clickSelector: ".action-button",
      steps: [{ action: "wait", ms: 1 }],
    },
    () => {},
    {}
  );

  assert.equal(evaluateCalls.some((args) => args[0] === ".action-button"), true);
});

test("forEachElement supports navigate browser sub-step", async () => {
  const navigatedUrls = [];
  const page = createMockPage([{ index: 0, text: "entry-1" }]);
  page.goto = async (url) => {
    navigatedUrls.push(url);
  };
  page.isClosed = () => false;
  const resources = createMockResources(page);

  await handleForEachElement(
    resources,
    {
      action: "forEachElement",
      selector: ".row",
      steps: [{ action: "navigate", url: "https://example.com/item" }],
    },
    () => {},
    {}
  );

  assert.deepEqual(navigatedUrls, ["https://example.com/item"]);
});

test("forEachElement excludes entries matching excludeTextPatterns", async () => {
  const page = {
    async evaluate(evaluateFn, ...args) {
      if (args.length === 4) {
        global.document = {
          querySelectorAll: () => [
            {
              setAttribute: () => {},
              textContent: "skip-me",
              querySelector: () => ({ textContent: "skip-me" }),
              style: {},
              closest: () => null,
            },
            {
              setAttribute: () => {},
              textContent: "keep-me",
              querySelector: () => ({ textContent: "keep-me" }),
              style: {},
              closest: () => null,
            },
          ],
        };

        return evaluateFn(...args);
      }

      if (args.length === 2) {
        global.document = {
          querySelectorAll: () => [{ setAttribute: () => {} }],
        };
        return evaluateFn(...args);
      }

      return undefined;
    },
  };
  const resources = createMockResources(page);
  const logMessages = [];

  await handleForEachElement(
    resources,
    {
      action: "forEachElement",
      selector: ".row",
      excludeTextPatterns: ["skip"],
      steps: [{ action: "wait", ms: 1 }],
    },
    (message) => logMessages.push(message),
    {}
  );

  assert.match(logMessages.join("\n"), /Found 1 valid element\(s\) to process/);
});

test("forEachElement clickSelector clicks nested target including svg parent fallback", async () => {
  let clickedTarget = null;
  global.SVGElement = function SVGElement() {};
  const svgTarget = Object.create(global.SVGElement.prototype);
  svgTarget.click = () => {
    clickedTarget = "svg-child";
  };
  svgTarget.parentElement = {
    click: () => {
      clickedTarget = "svg-parent";
    },
  };

  const page = {
    async evaluate(evaluateFn, ...args) {
      if (args.length === 4) {
        return [{ index: 0, text: "entry-1" }];
      }

      if (args.length === 1 && args[0] === ".action-button") {
        global.document = {
          querySelector: () => ({
            querySelector: () => svgTarget,
          }),
        };

        return evaluateFn(args[0]);
      }

      if (args.length === 2) {
        global.document = {
          querySelectorAll: () => [{ setAttribute: () => {} }],
        };
        return evaluateFn(...args);
      }

      return undefined;
    },
  };
  const resources = createMockResources(page);

  await handleForEachElement(
    resources,
    {
      action: "forEachElement",
      selector: ".row",
      clickSelector: ".action-button",
      steps: [{ action: "wait", ms: 1 }],
    },
    () => {},
    {}
  );

  assert.equal(clickedTarget, "svg-parent");
});
