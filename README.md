# ShellForge

ShellForge helps you build, run, and schedule custom Windows PowerShell automation beyond basic shell commands.

**Documentation site:** [shellforge.app.br](https://shellforge.app.br/) — run locally with `npm run page:dev` (see [`page/README.md`](page/README.md)).

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

### Desktop app (recommended)

Download the latest Windows installer from [GitHub Releases](https://github.com/JooLuiz/shellforge/releases/latest) or use the download button on [shellforge.app.br](https://shellforge.app.br/).

### From source

Once you clone this repository, run the following command to install the app dependencies:

```shell
npm install
```

To build the desktop installer locally:

```shell
npm run ui:dist
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

Each action under `actionRunner` uses a `steps` array. Legacy flat login fields (`url`, `usernameInput`, `passwordInput`, etc.) are still supported by `normalizeSteps` for older configs, but new actions should use `steps`.

**Multi-step login (`steps` array)** — use when you need clicks, waits, or a custom order (e.g. click "Next" after username):

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

Optional action-level browser setting:

```json
{
  "actionRunner": {
    "clockify-calendar": {
      "browserProfile": "clockify",
      "steps": [{ "action": "navigate", "url": "https://app.clockify.me/calendar" }]
    }
  }
}
```

`browserProfile` configures a profile key for that action. At runtime, it is always resolved to `{PROJECT_FOLDER}/.shellforge-browser-profiles/<browserProfile>` and passed to Puppeteer as `userDataDir`, so cookies and storage persist across runs. This is recommended for login-heavy apps (e.g. Clockify) that rotate session state.

Supported step `action` values:

| action            | required fields                                                | optional fields                                                                                                            |
| ----------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `navigate`        | `url`                                                          | —                                                                                                                          |
| `type`            | `selector`, `value`                                            | `delay`, `waitForLoading`, `timeout`                                                                                       |
| `click`           | `selector`                                                     | `waitForNavigation`, `waitForUrl`, `waitForSelector`, `waitForLoading`, `timeout` (ms, default 30000), `jsClick`, `iframe` |
| `wait`            | `ms` (non-negative number)                                     | —                                                                                                                          |
| `waitForPageState`| at least one of `selector`, `urlContains`, or `waitForLoading: true` | `timeout`                                                                                                            |
| `setWebStorage`   | at least one of `localStorage`, `sessionStorage`, or `cookies` | —                                                                                                                          |
| `closeBrowser`    | —                                                              | —                                                                                                                          |
| `forEachElement`  | `selector`, `steps`                                            | `textContentSelector`, `excludeTextPatterns`, `clickSelector`, `skipIfPositionMatch`                                       |
| `forEach`         | `steps` and exactly one of `list` or `count`                   | —                                                                                                                          |
| `apiRequest`      | `url`                                                          | `method`, `params`, `headers`, `auth`, `body`, `timeout`, `ignoreHttpErrors`, `storeAs`                                    |
| `setVariable`     | `source`, `storeAs`                                            | —                                                                                                                          |
| `shell`           | `command` or `commands`                                        | `cwd`, `shell`, `timeout`, `ignoreExitCode`, `maxBuffer`, `storeAs`                                                        |
| `getArguments`    | —                                                              | `required`, `optional`, `defaults`                                                                                         |
| `invokeAction`    | `name`                                                         | `args`, `continueOnError`, `storeAs`                                                                                       |
| `tryCatch`        | `try`                                                          | `catch`, `finally`                                                                                                         |
| `ifElse`          | `left`, `operator`, `then`                                     | `right` (required unless `operator` is `exists`), `else`                                                                   |

`forEachElement` sub-steps support all browser actions plus an explicit non-browser allowlist: `wait` and `apiRequest`.

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
>
> **_NOTE:_** for apps that frequently invalidate or rotate auth state, prefer `browserProfile` over hardcoded token injection in `setWebStorage`. With a persistent profile, you log in once manually and reuse the same browser session on later runs.

**`closeBrowser`** gracefully closes the browser instance. Typically used as the last step in an action.

**`apiRequest`** calls HTTP endpoints directly. You can persist response data into runtime context with `storeAs`, then reuse it in later steps. The stored value is always an object with three keys: `status` (HTTP status code), `headers` (response headers), and `body` (parsed JSON or raw text). For example, `{{context.apiResponse.body.id}}` reads the `id` field from the response body, and `{{context.apiResponse.status}}` reads the status code.

**`wait`** is a generic delay that pauses the action for `ms` milliseconds. It has no browser dependency, so it can be used safely between non-browser steps (for example, to rate-limit between `apiRequest`s inside a `forEach`, or to give a backgrounded `shell` process time to start before probing it). It is also allowed inside `forEachElement` sub-steps.

```json
{
  "action": "forEach",
  "list": "{{context.userIds}}",
  "steps": [
    { "action": "apiRequest", "url": "https://api.example.com/users/{{context.item}}", "storeAs": "user" },
    { "action": "wait", "ms": 500 }
  ]
}
```

**`waitForPageState`** is the browser-only counterpart: polls the page until a `selector` becomes visible, the URL contains a substring, or all loading overlays finish. Use `timeout` (defaults to 30000 ms) to bound the wait. This step requires a browser, so prefer plain `wait` for non-browser pauses.

**`setVariable`** stores a resolved value into context. Useful to assign short names such as the first task id, or to materialize an environment variable into a friendlier key.

**`forEach`** iterates over a `list` (array, interpolation-friendly) or repeats a fixed `count` of times, running `steps` each iteration. When `list` is provided, sub-steps can read the current entry via `{{context.item}}`. The current iteration index is always available as `{{context.index}}`. Outer values of `item` and `index` are restored after the loop, so nested `forEach` blocks are safe. Sub-steps may be any registered action.

**`shell`** executes shell commands (PowerShell by default) and can store command output in context. When `storeAs` is set, the stored value always has the shape `{ stdout, stderr, exitCode }`. On success `exitCode` is `0`; when `ignoreExitCode: true` is set and the command fails, `exitCode` reflects the non-zero exit code returned by the process.

**`getArguments`** validates and maps CLI arguments (passed via `--arg.<name>=<value>`) or parent-action arguments (via `invokeAction`) into the runtime context. Use `required` to list mandatory arguments (throws if missing), `optional` to list arguments that are mapped only when present, and `defaults` to provide fallback values for missing ones.

**`invokeAction`** calls another action defined in `actionRunner` config by name. The child action runs with an isolated context seeded from `args`. Use `storeAs` to copy the child's final context back into the parent. `continueOnError: true` prevents child failures from aborting the parent action. Recursion is capped at 5 levels. In the UI editor, an action cannot invoke itself outside an `ifElse` block; place guarded self-calls inside `then` or `else` (for example, retry loops with a counter).

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

**`ifElse`** evaluates a comparison at runtime and runs either the `then` or `else` step array. The left operand must resolve from a single `{{context.*}}` or `{{env.*}}` placeholder. Supported operators: `eq`, `gt`, `gte`, `lt`, `lte`, and `exists` (checks that the left value is defined and non-empty). When both operands parse as finite numbers, numeric comparison is used; otherwise values are compared as strings. The `else` array is optional.

Example:

```json
{
  "action": "ifElse",
  "left": "{{context.retries}}",
  "operator": "lt",
  "right": "3",
  "then": [
    {
      "action": "invokeAction",
      "name": "retryWorkflow",
      "args": { "retries": "{{context.retries}}" }
    }
  ],
  "else": [
    { "action": "shell", "command": "echo max retries reached" }
  ]
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

The context variable `apiResponse` will have the shape `{ status, headers, body }`. Access nested fields like `{{context.apiResponse.body.someField}}`.

```json
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
New-Alias -Name reinitialize -Value Path\To\Your\Cloned\Repo\commands\reinitialize\reinitialize.bat
```

### 3.4 Pre-defined command catalog

ShellForge ships **20 pre-defined commands**. Enable them in the desktop UI (`Pre-defined Commands` tab) or by adding aliases to your managed `$PROFILE` block.

All new commands default to **disabled** until you toggle them on in the UI.

| Category | Command | Description |
| --- | --- | --- |
| Core | `action-runner` | Runs custom action flows from `config/config.json` |
| Shell lifecycle | `reinitialize` | Reloads the current PowerShell profile |
| Shell lifecycle | `reload-env` | Refreshes `PATH` in the current session |
| Shell lifecycle | `profile` | Opens `$PROFILE` in your preferred editor |
| Unix parity | `touch` | Creates a file or updates its modification time |
| Unix parity | `which` | Prints the resolved path of a command |
| Unix parity | `mkdirp` | Creates nested directories |
| Unix parity | `open` | Opens files, folders, or URLs |
| Unix parity | `pbcopy` | Copies stdin or file contents to clipboard |
| Unix parity | `pbpaste` | Prints clipboard contents to stdout |
| Unix parity | `realpath` | Resolves a canonical absolute path |
| Unix parity | `uuid` | Generates a UUID (`-n` omits trailing newline) |
| Unix parity | `head` | Prints the first lines of a file (`-n` optional) |
| Unix parity | `tail` | Prints the last lines of a file (`-n` optional) |
| Unix parity | `watch` | Re-runs a command every N seconds (`-n` optional) |
| Unix parity | `git-root` | Finds the Git repository root (`--cd` changes directory) |
| Windows utilities | `kill-port` | Stops the process listening on a TCP port (`-f` optional) |
| Windows utilities | `as-admin` | Runs a command elevated |
| Windows utilities | `hidden` | Runs a command in a hidden window |

Implementation details:

- Each command lives in `<command-key>/<command-key>.bat`.
- New commands delegate to PowerShell scripts and share helpers from [`command-lib/ShellForge.CommandLib.ps1`](command-lib/ShellForge.CommandLib.ps1).
- ShellForge does not ship `sleep`; use PowerShell's built-in `sleep` alias or `Start-Sleep`.
- Canonical metadata and display order (Action Runner first) live in [`ui/src/shared/predefinedCommandsRegistry.ts`](ui/src/shared/predefinedCommandsRegistry.ts).

### 3.5 Scheduled Tasks

#### 3.5.1 Specifications

The `scheduled-tasks/` folder contains an example PowerShell script that creates a Windows Scheduled Task to run any custom command on a recurring schedule. It uses `Register-ScheduledTask` to create a task with configurable weekly triggers. The task loads your `$PROFILE` before executing so that custom functions and aliases are available.

You can find the example at `scheduled-tasks/setup-scheduled-task.example.ps1`.

#### 3.5.2 Configuration

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

## 4. Desktop UI

The repository now includes a desktop manager under `ui/` to configure:

- pre-defined commands and aliases (20 commands; Action Runner listed first)
- custom actions from `config/config.json` (with `availableOnCLI` toggles and aliases)
- scheduled task script files in `scheduled-tasks/`

Desktop UI behavior highlights:

- tab header search filters rows in all tabs (search resets when switching tabs)
- pre-defined commands tab includes category filter chips (`Core`, `Shell lifecycle`, `Unix parity`, `Windows utilities`)
- edit modals auto-save after 10 seconds without field changes and also support manual save
- create modals save only on `Save`
- edit modal save button states are `Save`, `Saving...`, and `Saved`
- scheduled task row toggles execute the related `.ps1` script (`-Remove` is used when toggling off)

For setup and development commands, see [`ui/README.md`](ui/README.md).

## 5. Security and privileges

ShellForge is a power-user automation tool. Several features run with your Windows user privileges:

- `as-admin`, `hidden`, and action-runner `shell` steps can execute arbitrary commands.
- `writeFile` steps can create or overwrite files anywhere your account can write.
- Custom actions exposed on the CLI through `$PROFILE` aliases run the same way as invoking `action-runner` manually.
- Browser profiles under `.shellforge-browser-profiles/` may store session cookies and site data.

Only enable commands and load action configs you trust. Review shared config files before running them on a machine that holds sensitive data.

See also [`commands/README.md`](commands/README.md).

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPLv3) — see the [LICENSE](LICENSE) file for details.

# Other versions

[Readme in Portuguese (PT-BR)](README.pt-br.md)
