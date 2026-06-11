import type { StepDocEntry } from "./types";

export const coreStepDefinitions: StepDocEntry[] = [
  {
    action: "wait",
    category: "timing",
    fields: [{ key: "ms", type: "number", required: "yes", interpolation: false, example: "2000" }],
    exampleJson: `{ "action": "wait", "ms": 500 }`,
  },
  {
    action: "apiRequest",
    category: "data",
    fields: [
      { key: "url", type: "string", required: "yes", interpolation: true, example: "https://api.example.com/users/{{context.userId}}" },
      { key: "method", type: "select", required: "no", interpolation: false, example: "POST" },
      { key: "params", type: "object", required: "no", interpolation: false },
      { key: "headers", type: "object", required: "no", interpolation: false },
      { key: "auth", type: "object", required: "no", interpolation: false },
      { key: "body", type: "json", required: "no", interpolation: false, example: '{ "name": "Alice" }' },
      { key: "storeAs", type: "string", required: "no", interpolation: false, example: "apiResponse" },
      { key: "timeout", type: "number", required: "no", interpolation: false, example: "10000" },
      { key: "ignoreHttpErrors", type: "boolean", required: "no", interpolation: false },
    ],
    exampleJson: `{ "action": "apiRequest", "method": "GET", "url": "https://api.example.com/v1/tasks", "storeAs": "tasksResponse" }`,
  },
  {
    action: "setVariable",
    category: "data",
    fields: [
      { key: "source", type: "string", required: "yes", interpolation: true, example: "{{context.apiResponse.body.token}}" },
      { key: "storeAs", type: "string", required: "yes", interpolation: false, example: "authToken" },
    ],
    exampleJson: `{ "action": "setVariable", "source": "{{context.tasksResponse.body.data.0.id}}", "storeAs": "taskId" }`,
  },
  {
    action: "shell",
    category: "data",
    fields: [
      { key: "command", type: "string", required: "oneOf", interpolation: true, example: "git status" },
      { key: "commands", type: "string[]", required: "oneOf", interpolation: true },
      { key: "shell", type: "string", required: "no", interpolation: false, example: "powershell.exe" },
      { key: "shellArgs", type: "string[]", required: "no", interpolation: false, example: "-ExecutionPolicy Bypass" },
      { key: "cwd", type: "string", required: "no", interpolation: true, example: "C:\\\\my-project" },
      { key: "storeAs", type: "string", required: "no", interpolation: false, example: "shellResult" },
      { key: "timeout", type: "number", required: "no", interpolation: false, example: "30000" },
      { key: "ignoreExitCode", type: "boolean", required: "no", interpolation: false },
      { key: "maxBuffer", type: "number", required: "no", interpolation: false, example: "10485760" },
    ],
    exampleJson: `{ "action": "shell", "command": "echo 'doing work'", "storeAs": "shellResult" }`,
  },
  {
    action: "writeFile",
    category: "data",
    fields: [
      { key: "path", type: "string", required: "yes", interpolation: true, example: "C:\\\\output\\\\report.txt" },
      { key: "content", type: "string", required: "yes", interpolation: true, example: "Hello {{context.name}}" },
      { key: "backupIfExists", type: "boolean", required: "no", interpolation: false },
      { key: "storeAs", type: "string", required: "no", interpolation: false, example: "reportPath" },
    ],
    exampleJson: `{ "action": "writeFile", "path": "C:\\\\output\\\\task.json", "content": "{{context.taskDetails}}" }`,
  },
  {
    action: "getArguments",
    category: "data",
    fields: [
      { key: "required", type: "string[]", required: "no", interpolation: false, example: "username" },
      { key: "optional", type: "string[]", required: "no", interpolation: false, example: "retries" },
      { key: "defaults", type: "object", required: "no", interpolation: false, example: '{ "retries": 3 }' },
    ],
    exampleJson: `{ "action": "getArguments", "required": ["message"] }`,
  },
];
