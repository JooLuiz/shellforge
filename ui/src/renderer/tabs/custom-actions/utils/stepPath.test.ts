import { describe, expect, it } from "vitest";
import type { ActionStep } from "../../../../shared/types";
import type { InsertionPoint, StepPath } from "../types";
import {
  addStepAtPath,
  deleteStepAtPath,
  getStepAtPath,
  setStepAtPath,
  stepPathToKey,
} from "./stepPath";

const rootSteps: ActionStep[] = [
  { action: "wait", ms: 100 },
  {
    action: "forEach",
    list: [1],
    steps: [{ action: "click", selector: "#inner" }],
  },
];

describe("stepPath", () => {
  describe("getStepAtPath", () => {
    it("returns null for an empty path", () => {
      expect(getStepAtPath(rootSteps, [])).toBeNull();
    });

    it("returns null when the root index is out of range", () => {
      expect(getStepAtPath(rootSteps, [{ arrayKey: "steps", stepIndex: 99 }])).toBeNull();
    });

    it("returns a root step", () => {
      expect(getStepAtPath(rootSteps, [{ arrayKey: "steps", stepIndex: 0 }])).toEqual({
        action: "wait",
        ms: 100,
      });
    });

    it("returns a nested step", () => {
      const nestedPath: StepPath = [
        { arrayKey: "steps", stepIndex: 1 },
        { arrayKey: "steps", stepIndex: 0 },
      ];

      expect(getStepAtPath(rootSteps, nestedPath)).toEqual({
        action: "click",
        selector: "#inner",
      });
    });
  });

  describe("setStepAtPath", () => {
    it("returns the original array for an empty path", () => {
      expect(setStepAtPath(rootSteps, [], { action: "wait", ms: 1 })).toBe(rootSteps);
    });

    it("replaces a root step immutably", () => {
      const nextStep: ActionStep = { action: "wait", ms: 500 };
      const updated = setStepAtPath(rootSteps, [{ arrayKey: "steps", stepIndex: 0 }], nextStep);

      expect(updated[0]).toEqual(nextStep);
      expect(rootSteps[0]).toEqual({ action: "wait", ms: 100 });
    });

    it("replaces a nested step immutably", () => {
      const nestedPath: StepPath = [
        { arrayKey: "steps", stepIndex: 1 },
        { arrayKey: "steps", stepIndex: 0 },
      ];
      const nextStep: ActionStep = { action: "type", selector: "#field", value: "hello" };
      const updated = setStepAtPath(rootSteps, nestedPath, nextStep);

      expect(getStepAtPath(updated, nestedPath)).toEqual(nextStep);
      expect(getStepAtPath(rootSteps, nestedPath)).toEqual({
        action: "click",
        selector: "#inner",
      });
    });

    it("returns the original array when the parent step is missing", () => {
      const missingParentPath: StepPath = [
        { arrayKey: "steps", stepIndex: 99 },
        { arrayKey: "steps", stepIndex: 0 },
      ];

      expect(
        setStepAtPath(rootSteps, missingParentPath, { action: "wait", ms: 1 }),
      ).toBe(rootSteps);
    });
  });

  describe("addStepAtPath", () => {
    it("inserts at the root level", () => {
      const insertionPoint: InsertionPoint = {
        parentPath: [],
        arrayKey: "steps",
        insertionIndex: 1,
      };
      const newStep: ActionStep = { action: "shell", command: "echo added" };
      const updated = addStepAtPath(rootSteps, insertionPoint, newStep);

      expect(updated.map((step) => step.action)).toEqual(["wait", "shell", "forEach"]);
    });

    it("inserts inside a nested array", () => {
      const insertionPoint: InsertionPoint = {
        parentPath: [{ arrayKey: "steps", stepIndex: 1 }],
        arrayKey: "steps",
        insertionIndex: 1,
      };
      const newStep: ActionStep = { action: "wait", ms: 50 };
      const updated = addStepAtPath(rootSteps, insertionPoint, newStep);
      const nestedPath: StepPath = [
        { arrayKey: "steps", stepIndex: 1 },
        { arrayKey: "steps", stepIndex: 1 },
      ];

      expect(getStepAtPath(updated, nestedPath)).toEqual(newStep);
    });

    it("returns the original array when the parent step is missing", () => {
      const insertionPoint: InsertionPoint = {
        parentPath: [{ arrayKey: "steps", stepIndex: 99 }],
        arrayKey: "steps",
        insertionIndex: 0,
      };

      expect(
        addStepAtPath(rootSteps, insertionPoint, { action: "wait", ms: 1 }),
      ).toBe(rootSteps);
    });

    it("inserts through a deeply nested parent path", () => {
      const nestedRoot: ActionStep[] = [
        {
          action: "forEach",
          list: [1],
          steps: [
            {
              action: "forEach",
              list: [2],
              steps: [{ action: "wait", ms: 1 }],
            },
          ],
        },
      ];
      const insertionPoint: InsertionPoint = {
        parentPath: [
          { arrayKey: "steps", stepIndex: 0 },
          { arrayKey: "steps", stepIndex: 0 },
        ],
        arrayKey: "steps",
        insertionIndex: 1,
      };
      const newStep: ActionStep = { action: "click", selector: "#done" };
      const updated = addStepAtPath(nestedRoot, insertionPoint, newStep);

      expect(
        getStepAtPath(updated, [
          { arrayKey: "steps", stepIndex: 0 },
          { arrayKey: "steps", stepIndex: 0 },
          { arrayKey: "steps", stepIndex: 1 },
        ]),
      ).toEqual(newStep);
    });
  });

  describe("deleteStepAtPath", () => {
    it("removes a root step", () => {
      const updated = deleteStepAtPath(rootSteps, [{ arrayKey: "steps", stepIndex: 0 }]);

      expect(updated).toHaveLength(1);
      expect(updated[0]?.action).toBe("forEach");
    });

    it("removes a nested step", () => {
      const nestedPath: StepPath = [
        { arrayKey: "steps", stepIndex: 1 },
        { arrayKey: "steps", stepIndex: 0 },
      ];
      const updated = deleteStepAtPath(rootSteps, nestedPath);
      const parent = getStepAtPath(updated, [{ arrayKey: "steps", stepIndex: 1 }]);

      expect(parent?.steps).toEqual([]);
    });

    it("returns the original array for an empty path", () => {
      expect(deleteStepAtPath(rootSteps, [])).toBe(rootSteps);
    });

    it("returns the original array when deleting from a missing parent", () => {
      expect(
        deleteStepAtPath(rootSteps, [
          { arrayKey: "steps", stepIndex: 99 },
          { arrayKey: "steps", stepIndex: 0 },
        ]),
      ).toBe(rootSteps);
    });
  });

  describe("stepPathToKey", () => {
    it("serialises nested paths into stable keys", () => {
      expect(
        stepPathToKey([
          { arrayKey: "steps", stepIndex: 1 },
          { arrayKey: "try", stepIndex: 0 },
        ]),
      ).toBe("steps.1/try.0");
    });
  });
});
