export interface ExampleWorkflow {
  id: string;
  titleKey: "exampleLoginTitle" | "exampleApiTitle";
  json: string;
}

/** Anonymized snippets from config/config-example.json */
export const EXAMPLE_WORKFLOWS: ExampleWorkflow[] = [
  {
    id: "multi-step-login",
    titleKey: "exampleLoginTitle",
    json: `{
  "steps": [
    { "action": "navigate", "url": "https://example.com/login" },
    { "action": "type", "selector": "#username", "value": "your-username" },
    {
      "action": "click",
      "selector": "#nextBtn",
      "waitForSelector": "#password"
    },
    { "action": "type", "selector": "#password", "value": "your-password" },
    { "action": "click", "selector": "#loginbtn" }
  ]
}`,
  },
  {
    id: "fetch-and-save",
    titleKey: "exampleApiTitle",
    json: `{
  "steps": [
    {
      "action": "apiRequest",
      "method": "GET",
      "url": "https://api.example.com/v1/tasks",
      "storeAs": "tasksResponse"
    },
    {
      "action": "setVariable",
      "source": "{{context.tasksResponse.body.data.0.id}}",
      "storeAs": "taskId"
    },
    {
      "action": "writeFile",
      "path": "C:\\\\output\\\\task-{{context.taskId}}.json",
      "content": "{{context.tasksResponse}}",
      "backupIfExists": true
    }
  ]
}`,
  },
];

export const COMPOSED_WORKFLOW_EXAMPLES = [
  {
    id: "api-with-args",
    title: "API request with CLI arguments",
    json: `{
  "steps": [
    { "action": "getArguments", "required": ["message"] },
    {
      "action": "apiRequest",
      "method": "POST",
      "url": "https://api.example.com/v1/notify",
      "params": {
        "message": "{{context.message}}",
        "apiKey": "{{env.GENERIC_API_KEY}}"
      },
      "ignoreHttpErrors": true,
      "storeAs": "apiResponse"
    }
  ]
}`,
  },
  {
    id: "try-catch-compose",
    title: "tryCatch with invokeAction",
    json: `{
  "action": "tryCatch",
  "try": [
    { "action": "invokeAction", "name": "fetch-and-save-api-data" },
    {
      "action": "invokeAction",
      "name": "perform-api-request",
      "args": { "message": "workflow completed" },
      "continueOnError": true
    }
  ],
  "catch": [
    {
      "action": "invokeAction",
      "name": "perform-api-request",
      "args": { "message": "failed: {{context.errorMessage}}" }
    }
  ]
}`,
  },
];

export const CONFIG_STRUCTURE_EXAMPLE = `{
  "actionRunner": {
    "my-action": {
      "browserProfile": "my-app",
      "steps": [
        { "action": "navigate", "url": "https://example.com" }
      ]
    }
  },
  "ui": {
    "customActions": {
      "my-action": {
        "availableOnCLI": true,
        "aliases": ["my-action"]
      }
    }
  },
  "scheduler": {
    "serverPort": 3002,
    "userPassword": ""
  }
}`;

export const INTERPOLATION_EXAMPLE = `{
  "action": "apiRequest",
  "url": "https://api.example.com/users/{{context.userId}}",
  "auth": {
    "username": "user@example.com",
    "password": "{{env.API_PASSWORD}}"
  },
  "storeAs": "apiResponse"
}`;

export const PROFILE_BLOCK_EXAMPLE = `# === shellforge:BEGIN (managed - do not edit) ===
New-Alias -Name action-runner -Value C:\\path\\to\\commands\\action-runner\\action-runner.bat
# === shellforge:END ===`;
