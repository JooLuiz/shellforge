"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  isRecoverableError,
  getStepTimeout,
  getActivePage,
  pollPageCondition,
  waitForSelectorSafe,
  waitForUrlSafe,
  waitForLoadingOverlaySafe,
  waitForInteractableSafe,
  pollFrameForSelector,
  clickSelectorSafe,
  DEFAULT_PAGE_RECOVERY_TIMEOUT_MS,
} = require("../pageContext");

const noopLogInfo = () => {};

function createOpenPage(evaluateResult = true) {
  return {
    isClosed: () => false,
    evaluate: async () => evaluateResult,
    $: async () => ({
      click: async () => {},
      evaluate: async (callback) => callback({ click: () => {} }),
    }),
  };
}

function createBrowser(pages = []) {
  return {
    pages: async () => pages,
    waitForTarget: async () => ({
      page: () => pages[0] ?? createOpenPage(),
    }),
  };
}

test("isRecoverableError detects known recoverable browser failures", () => {
  assert.equal(isRecoverableError({ name: "TargetCloseError", message: "x" }), true);
  assert.equal(isRecoverableError(new Error("Target closed while waiting")), true);
  assert.equal(isRecoverableError(new Error("Session closed unexpectedly")), true);
  assert.equal(isRecoverableError(new Error("Protocol error (Runtime)")), true);
  assert.equal(isRecoverableError(new Error("Execution context was destroyed")), true);
  assert.equal(isRecoverableError(new Error("Cannot find context with specified id")), true);
  assert.equal(isRecoverableError(new Error("frame got detached from document")), true);
  assert.equal(isRecoverableError(new Error("Element not found")), false);
});

test("getStepTimeout uses step timeout or default recovery timeout", () => {
  assert.equal(getStepTimeout({ timeout: 1500 }), 1500);
  assert.equal(getStepTimeout({}), DEFAULT_PAGE_RECOVERY_TIMEOUT_MS);
});

test("getActivePage returns preferred page when it is still open", async () => {
  const preferredPage = createOpenPage();
  const browser = createBrowser([]);

  const activePage = await getActivePage(browser, preferredPage);

  assert.equal(activePage, preferredPage);
});

test("getActivePage falls back to the latest open browser page", async () => {
  const closedPage = { isClosed: () => true };
  const openPage = createOpenPage();
  const browser = createBrowser([closedPage, openPage]);

  const activePage = await getActivePage(browser, closedPage);

  assert.equal(activePage, openPage);
});

test("getActivePage waits for a new page target when none are open", async () => {
  const recoveredPage = createOpenPage();
  const browser = {
    pages: async () => [],
    waitForTarget: async () => ({
      page: () => recoveredPage,
    }),
  };

  const activePage = await getActivePage(browser, null, 1000);

  assert.equal(activePage, recoveredPage);
});

test("pollPageCondition resolves when evaluate returns true", async () => {
  const page = createOpenPage(true);
  const browser = createBrowser([page]);

  const activePage = await pollPageCondition(
    browser,
    page,
    () => true,
    [],
    { timeout: 1000 },
    noopLogInfo
  );

  assert.equal(activePage, page);
});

test("pollPageCondition retries recoverable errors and eventually succeeds", async () => {
  let evaluateAttempts = 0;
  const page = {
    isClosed: () => false,
    evaluate: async () => {
      evaluateAttempts += 1;

      if (evaluateAttempts === 1) {
        throw new Error("Execution context was destroyed");
      }

      return true;
    },
  };
  const browser = createBrowser([page]);

  const activePage = await pollPageCondition(
    browser,
    page,
    () => true,
    [],
    { timeout: 2000 },
    noopLogInfo
  );

  assert.equal(activePage, page);
  assert.equal(evaluateAttempts, 2);
});

test("pollPageCondition throws non-recoverable errors immediately", async () => {
  const page = {
    isClosed: () => false,
    evaluate: async () => {
      throw new Error("Selector not found");
    },
  };
  const browser = createBrowser([page]);

  await assert.rejects(
    () =>
      pollPageCondition(
        browser,
        page,
        () => true,
        [],
        { timeout: 1000 },
        noopLogInfo
      ),
    /Selector not found/
  );
});

test("pollPageCondition times out when condition never becomes true", async () => {
  const page = createOpenPage(false);
  const browser = createBrowser([page]);

  await assert.rejects(
    () =>
      pollPageCondition(
        browser,
        page,
        () => false,
        [],
        { timeout: 50 },
        noopLogInfo
      ),
    /Timed out after 50ms waiting for page condition/
  );
});

test("wait helper exports delegate to pollPageCondition", async () => {
  const page = createOpenPage(true);
  const browser = createBrowser([page]);
  const step = { timeout: 1000 };

  await waitForSelectorSafe(browser, page, "#submit", step, noopLogInfo);
  await waitForUrlSafe(browser, page, "/dashboard", step, noopLogInfo);
  await waitForLoadingOverlaySafe(browser, page, step, noopLogInfo);
  await waitForInteractableSafe(browser, page, "#submit", step, noopLogInfo);
});

test("pollFrameForSelector resolves when selector exists in iframe tree", async () => {
  const matchingFrame = {
    evaluate: async () => true,
    childFrames: () => [],
  };
  const parentFrame = {
    evaluate: async () => false,
    childFrames: () => [matchingFrame],
  };
  const page = {
    isClosed: () => false,
    $: async () => ({
      contentFrame: () => parentFrame,
    }),
  };
  const browser = createBrowser([page]);
  const logMessages = [];
  const step = { iframe: "#app-frame", selector: ".target", timeout: 1000 };

  const result = await pollFrameForSelector(
    browser,
    page,
    ".target",
    step,
    (message) => logMessages.push(message)
  );

  assert.equal(result.frame, matchingFrame);
  assert.equal(result.page, page);
  assert.match(logMessages.join("\n"), /content frame obtained/);
});

test("pollFrameForSelector times out when iframe never resolves", async () => {
  const page = {
    isClosed: () => false,
    $: async () => null,
  };
  const browser = createBrowser([page]);
  const step = { iframe: "#missing", selector: ".target", timeout: 50 };

  await assert.rejects(
    () => pollFrameForSelector(browser, page, ".target", step, noopLogInfo),
    /Timed out after 50ms waiting for \.target in iframe #missing/
  );
});

test("clickSelectorSafe clicks element with native click by default", async () => {
  let clicked = false;
  const page = {
    isClosed: () => false,
    evaluate: async () => true,
    $: async () => ({
      click: async () => {
        clicked = true;
      },
      evaluate: async () => {},
    }),
  };
  const browser = createBrowser([page]);

  await clickSelectorSafe(browser, page, "#submit", { timeout: 1000 }, noopLogInfo);

  assert.equal(clicked, true);
});

test("clickSelectorSafe uses jsClick when configured", async () => {
  let jsClicked = false;
  const page = {
    isClosed: () => false,
    evaluate: async () => true,
    $: async () => ({
      click: async () => {
        throw new Error("native click should not run");
      },
      evaluate: async (callback) => {
        callback({ click: () => {
          jsClicked = true;
        } });
      },
    }),
  };
  const browser = createBrowser([page]);

  await clickSelectorSafe(
    browser,
    page,
    "#submit",
    { timeout: 1000, jsClick: true },
    noopLogInfo
  );

  assert.equal(jsClicked, true);
});

test("clickSelectorSafe throws when element handle is missing", async () => {
  const page = {
    isClosed: () => false,
    evaluate: async () => true,
    $: async () => null,
  };
  const browser = createBrowser([page]);

  await assert.rejects(
    () =>
      clickSelectorSafe(browser, page, "#missing", { timeout: 1000 }, noopLogInfo),
    /Element not found for click: #missing/
  );
});

test("waitForLoadingOverlaySafe evaluate callback handles visible loading containers", async () => {
  const page = {
    isClosed: () => false,
    evaluate: async (evaluateFn) => {
      global.document = {
        querySelectorAll: (selector) => {
          if (selector !== ".s-loading-state-container") {
            return [];
          }

          return [
            {
              querySelector: (nestedSelector) => {
                if (nestedSelector === ".loader") {
                  return { style: {} };
                }

                if (nestedSelector === ".overlay") {
                  return { style: {} };
                }

                return null;
              },
            },
          ];
        },
      };
      global.window = {
        getComputedStyle: () => ({
          display: "none",
          visibility: "hidden",
          opacity: "0",
        }),
      };

      return evaluateFn();
    },
  };
  const browser = createBrowser([page]);

  await waitForLoadingOverlaySafe(browser, page, { timeout: 1000 }, noopLogInfo);
});

test("pollFrameForSelector retries after recoverable frame errors", async () => {
  let evaluateAttempts = 0;
  const matchingFrame = {
    evaluate: async () => true,
    childFrames: () => [],
  };
  const parentFrame = {
    evaluate: async () => false,
    childFrames: () => [matchingFrame],
  };
  const page = {
    isClosed: () => false,
    $: async () => {
      evaluateAttempts += 1;

      if (evaluateAttempts === 1) {
        throw new Error("frame got detached");
      }

      return {
        contentFrame: () => parentFrame,
      };
    },
  };
  const browser = createBrowser([page]);
  const step = { iframe: "#app-frame", selector: ".target", timeout: 2000 };

  const result = await pollFrameForSelector(
    browser,
    page,
    ".target",
    step,
    noopLogInfo
  );

  assert.equal(result.frame, matchingFrame);
});
