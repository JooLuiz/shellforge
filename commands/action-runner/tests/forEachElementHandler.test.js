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
