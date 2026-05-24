# windows-custom-commands

The Windows Custom Commands project aims to provide new commands to be executed in Windows PowerShell.

## 1. How to Create New Commands in Windows

First of all, it is important to explain how to create new commands in Windows. To do this, you will need to add some things to your `$PROFILE` file.

### 1.1 Accessing the Profile

To access `$PROFILE`, just open your PowerShell and run the following command:

```powershell
notepad $PROFILE
```

> **_TIP:_** if you prefer, open `$PROFILE` in another app like VSCode or Sublime.

### 1.2 Adding Commands

This file loads every time you open the terminal in Windows, so everything you put in it becomes the "default terminal settings."

Thus, there are two ways (that I know) to create new commands in our terminal, and both involve modifying our `$PROFILE` file.

#### 1.2.1 Adding Aliases

The first is by adding new aliases to `$PROFILE`. You can do this with the following command:

```powershell
New-Alias -Name my-command -Value Path\To\My\Command.bat
```

Now, what is happening here?

| Action    | Definition                                                                                                                                                                                                     |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New-Alias | Creates aliases that associate commands with specific files, [click here for more information](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/new-alias?view=powershell-7.4) |
| -Name     | Defines the name of the command to be executed in PowerShell; in this example, it would be "my-command"                                                                                                        |
| -Value    | Defines which file will be called when the command is executed                                                                                                                                                 |

#### 1.2.2 Creating Functions

The other way you can create new commands is by adding functions to `$PROFILE`, for example:

```powershell
Function my-custom-command {
    param (
        [string[]]$ExtraArgs
    )
    $loginCommand = "my-command"
    $loginCommand += " --my-parameter=my-value"
    echo $ExtraArgs
    foreach ($arg in $ExtraArgs) {
        echo $arg
        if ($arg.StartsWith("--")) {
            $loginCommand += " $arg"
        } elseif ($arg.StartsWith("-")) {
            $loginCommand += " $arg"
        } else {
            $loginCommand += " '$arg'"
        }
    }
    Invoke-Expression $loginCommand
}
```

In this case, we are creating a function called `my-custom-command`, which calls the previously defined command `my-command`, passing specific parameters.

## 2 Installation

Once you clone this repository, run the following command to install the app dependencies:

```shell
npm install
```

## 3. Available Commands

### 3.1 action-runner

#### 3.1.1 Specifications

The `action-runner` command executes one action flow from `actionRunner`, which can include browser automation, API requests, and shell commands. It accepts the following parameters:

| Long Parameter       | Short Parameter | Required | Description                                         |
| -------------------- | --------------- | -------- | --------------------------------------------------- |
| --action             | -a              | YES      | Indicates the action the action-runner will perform |
| --verbose            | -v              | NO       | Indicates whether to display logs during execution  |
| --arg.\<name\>=value | —               | NO       | Passes a custom argument into the action's context  |

**Custom arguments** let you pass values from the CLI into any action. For example:

```powershell
action-runner --action=perform-api-request "--arg.message=Hello from CLI"
```

Inside the action, `{{context.message}}` resolves to `"Hello from CLI"` (after a `getArguments` step maps it).

#### 3.1.2 Configuration

Before using the `action-runner` command, you need to configure the desired actions. To do this, you need to create the `config.json` file in the `./config/` directory. There is an example of how this config should look in the same folder (`config-example.json`).

Each action under `actionRunner` supports one of two formats:

**Simple login (legacy flat fields)** — username, password, then submit:

```json
{
  "actionRunner": {
    "simple-login": {
      "url": "https://example.com/login",
      "usernameInput": "#email",
      "usernameValue": "user@example.com",
      "passwordInput": "#password",
      "passwordValue": "your-password",
      "loginButton": "#submit"
    }
  }
}
```

**Multi-step login (`steps` array)** — use when you need extra clicks, waits, or a custom order (e.g. click "Next" after username):

```json
{
  "actionRunner": {
    "multi-step-login": {
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
    }
  }
}
```

Supported step `action` values:

| action            | required fields                                                | optional fields                                                                                                            |
| ----------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `navigate`        | `url`                                                          | —                                                                                                                          |
| `type`            | `selector`, `value`                                            | `delay`, `waitForLoading`, `timeout`                                                                                       |
| `click`           | `selector`                                                     | `waitForNavigation`, `waitForUrl`, `waitForSelector`, `waitForLoading`, `timeout` (ms, default 30000), `jsClick`, `iframe` |
| `wait`            | `ms`, `selector`, `urlContains`, or `waitForLoading`           | `timeout` (when using `selector`, `urlContains`, or `waitForLoading`)                                                      |
| `setWebStorage`   | at least one of `localStorage`, `sessionStorage`, or `cookies` | —                                                                                                                          |
| `closeBrowser`    | —                                                              | —                                                                                                                          |
| `forEachElement`  | `selector`, `steps`                                            | `textContentSelector`, `excludeTextPatterns`, `clickSelector`, `skipIfPositionMatch`                                       |
| `apiRequest`      | `url`                                                          | `method`, `params`, `headers`, `auth`, `body`, `timeout`, `ignoreHttpErrors`, `storeAs`                                    |
| `extractVariable` | `source`, `storeAs`                                            | —                                                                                                                          |
| `shell`           | `command` or `commands`                                        | `cwd`, `shell`, `timeout`, `ignoreExitCode`, `maxBuffer`, `storeAs`                                                        |
| `getArguments`    | —                                                              | `required`, `optional`, `defaults`                                                                                         |
| `invokeAction`    | `name`                                                         | `args`, `continueOnError`, `storeAs`                                                                                       |
| `tryCatch`        | `try`                                                          | `catch`, `finally`                                                                                                         |

**`setWebStorage`** injects data into the browser's web storage or cookies. This is useful for pre-authenticating sessions that require complex login flows (e.g. OTP codes). Values that are objects or arrays are automatically `JSON.stringify`-ed before being stored. Cookies use Puppeteer's native `page.setCookie()` format.

Example:

```json
{
  "action": "setWebStorage",
  "localStorage": {
    "token": "your-jwt-token",
    "user": { "id": "123", "name": "john" }
  }
}
```

> **_NOTE:_** `setWebStorage` must be used **after** a `navigate` step to the target domain, since localStorage/sessionStorage is bound to the page origin. To apply the injected session, add another `navigate` step after `setWebStorage` to reload the page.

**`closeBrowser`** gracefully closes the browser instance. Typically used as the last step in an action.

**`apiRequest`** calls HTTP endpoints directly. You can persist response data into runtime context with `storeAs`, then reuse it in later steps.

**`extractVariable`** stores a resolved value into context. Useful to assign short names such as the first task id.

**`shell`** executes shell commands (PowerShell by default) and can store command output in context.

**`getArguments`** validates and maps CLI arguments (passed via `--arg.<name>=<value>`) or parent-action arguments (via `invokeAction`) into the runtime context. Use `required` to list mandatory arguments (throws if missing), `optional` to list arguments that are mapped only when present, and `defaults` to provide fallback values for missing ones.

**`invokeAction`** calls another action defined in `actionRunner` config by name. The child action runs with an isolated context seeded from `args`. Use `storeAs` to copy the child's final context back into the parent. `continueOnError: true` prevents child failures from aborting the parent action. Recursion is capped at 5 levels.

Example of a composable action:

```json
{
  "actionRunner": {
    "perform-api-request": {
      "steps": [
        { "action": "getArguments", "required": ["message"] },
        {
          "action": "apiRequest",
          "method": "POST",
          "url": "https://api.example.com/v1/notify",
          "params": {
            "userId": "{{env.GENERIC_USER_ID}}",
            "message": "{{context.message}}",
            "apiKey": "{{env.GENERIC_API_KEY}}"
          },
          "ignoreHttpErrors": true
        }
      ]
    },
    "my-workflow": {
      "steps": [
        { "action": "shell", "command": "echo 'doing work'" },
        {
          "action": "invokeAction",
          "name": "perform-api-request",
          "args": { "message": "workflow completed" },
          "continueOnError": true
        }
      ]
    }
  }
}
```

**`tryCatch`** wraps steps in try/catch/finally semantics. If any step in `try` throws, the error message is stored in `context.errorMessage` and the `catch` steps run. `finally` steps always run regardless of success or failure. If no `catch` is defined, the error re-throws to the parent flow.

Example:

```json
{
  "action": "tryCatch",
  "try": [
    { "action": "shell", "command": "some-risky-command" },
    {
      "action": "invokeAction",
      "name": "perform-api-request",
      "args": { "message": "task completed successfully" }
    }
  ],
  "catch": [
    {
      "action": "invokeAction",
      "name": "perform-api-request",
      "args": { "message": "task failed, error: {{context.errorMessage}}" }
    }
  ]
}
```

### Dynamic placeholders

All string fields in steps support interpolation:

- `{{context.some.path}}` reads values produced by earlier steps.
- `{{env.VARIABLE_NAME}}` reads environment variables from your machine.

Example:

```json
{
  "action": "apiRequest",
  "url": "{{API_URL}}",
  "params": {
    "firstParam": "paramFirst"
  },
  "auth": {
    "type": "basic",
    "username": "email@example.com",
    "password": "{{env.PASSKEY}}"
  },
  "storeAs": "apiResponse"
}
```

### 3.2 touch

#### 3.2.1 Specifications

The `touch` command creates a new empty file or updates the modification date of an existing file. It works similarly to the `touch` command in Unix.

For example, the command `touch file.txt` creates the file `file.txt` if it does not exist or updates the modification date to the current time if it already exists.

#### 3.2.2 Configuration

Similarly to the previous command and as mentioned in section 1.2 of this README, you need to configure the command in `$PROFILE`. Once the profile is open, the command looks like this:

```powershell
New-Alias -Name touch -Value Path\To\Your\Cloned\Repo\touch\touch.bat
```

### 3.3 reinitialize

#### 3.2.1 Specifications

The `reinitialize` command reinitializes your powershell, loading any new changes done in your `$PROFILE` without you needing to close the terminal.

#### 3.2.2 Configuration

Similarly to the previous command and as mentioned in section 1.2 of this README, you need to configure the command in `$PROFILE`. Once the profile is open, the command looks like this:

```powershell
New-Alias -Name reinitialize -Value Path\To\Your\Cloned\Repo\reinitialize\reinitialize.bat
```

### 3.4 Scheduled Tasks

#### 3.4.1 Specifications

The `scheduled-tasks/` folder contains an example PowerShell script that creates a Windows Scheduled Task to run any custom command on a recurring schedule. It uses `Register-ScheduledTask` to create a task with configurable weekly triggers. The task loads your `$PROFILE` before executing so that custom functions and aliases are available.

You can find the example at `scheduled-tasks/setup-scheduled-task.example.ps1`.

#### 3.4.2 Configuration

1. Copy the example file and rename it (e.g. `setup-my-task.ps1`).
2. Open the copy and replace the placeholders:
   - `$TaskName` — set a unique name for your scheduled task.
   - `$triggerTimes` — set the times you want it to trigger (24h format).
   - `$weekdays` — set the days of the week.
   - `{{YOUR_COMMAND_HERE}}` — replace with the command or function you want to run (e.g. a function defined in your `$PROFILE`).

3. Run the script once from an **elevated** (Administrator) PowerShell terminal:

```powershell
.\scheduled-tasks\setup-my-task.ps1
```

To remove a scheduled task:

```powershell
.\scheduled-tasks\setup-my-task.ps1 -Remove
```

You can verify the task was created with:

```powershell
Get-ScheduledTask -TaskName "YourTaskName" | Get-ScheduledTaskInfo
```

> **_NOTE:_** make sure the command you reference is already defined in your `$PROFILE` before running the setup script, since the scheduled task depends on it.

# Other versions

[Readme in Portuguese (PT-BR)](README.pt-br.md)
