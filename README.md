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

### 3.1 login

#### 3.1.1 Specifications

The `login` command opens a browser and logs in according to the settings. It accepts the following parameters:

| Long Parameter | Short Parameter | Required | Description                                        |
| -------------- | --------------- | -------- | -------------------------------------------------- |
| --action       | -a              | YES      | Indicates the action the login will perform        |
| --verbose      | -v              | NO       | Indicates whether to display logs during execution |

#### 3.1.2 Configuration

Before using the `login` command, you need to configure the desired actions. To do this, you need to create the `config.json` file in the `./config/` directory. There is an example of how this config should look in the same folder (`config-example.json`).

Each action under `browserAutomation` supports one of two formats:

**Simple login (legacy flat fields)** — username, password, then submit:

```json
{
  "browserAutomation": {
    "log-email": {
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
  "browserAutomation": {
    "multi-step-login": {
      "steps": [
        { "action": "navigate", "url": "https://example.com/login" },
        { "action": "type", "selector": "#username", "value": "your-username" },
        { "action": "click", "selector": "#nextBtn", "waitForSelector": "#password" },
        { "action": "type", "selector": "#password", "value": "your-password" },
        { "action": "click", "selector": "#loginbtn" }
      ]
    }
  }
}
```

Supported step `action` values:

| action    | required fields        | optional fields                          |
| --------- | ---------------------- | ---------------------------------------- |
| `navigate`| `url`                  | —                                        |
| `type`    | `selector`, `value`    | —                                        |
| `click`   | `selector`             | `waitForNavigation`, `waitForUrl`, `waitForSelector`, `waitForLoading`, `timeout` (ms, default 30000) |
| `wait`    | `ms`, `selector`, `urlContains`, or `waitForLoading` | `timeout` (when using `selector`, `urlContains`, or `waitForLoading`) |
| `setWebStorage` | at least one of `localStorage`, `sessionStorage`, or `cookies` | — |
| `closeBrowser` | — | — |

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

All selector-based steps wait until the element is **visible** (not only present in the DOM). For multi-step forms, use `waitForSelector` targets that only appear after the previous step (e.g. `#password-input-group:not(.hidden) #password-input-field`).

Selectors are standard CSS. For dynamic ids, use attribute selectors instead of a fixed `#id`:

| Pattern | Selector example |
| ------- | ---------------- |
| id starts with | `[id^="btn-clocking-event"]` |
| id contains | `[id*="btn-clocking-event"]` |
| id ends with | `[id$="-menu"]` |

After a login redirect, use `waitForNavigation: true` on the login click, then a separate `wait` with `urlContains` (e.g. `"senior-x"`), then `waitForLoading: true` before clicking elements on the new app shell. Senior X shows `s-loading-state` overlays that block clicks even when the button is already in the DOM. The runner waits until loaders are gone and the element is interactable (not covered by an overlay).

If an action defines `steps`, that array is used. Otherwise the flat fields are converted automatically to the default four-step flow.

> **_TIP:_** as browserAutomation is an object of objects, you can have `n` login actions for different sites, as long as you add them to the config file properly.

Now you need to configure the command in your `$PROFILE`, as mentioned in step 1.2 of this README.

So, just add the following code to `$PROFILE`:

```powershell
New-Alias -Name login -Value Path\To\Your\Cloned\Repo\browser-automation\browser-automation.bat

Function log-email {
    param (
        [string[]]$ExtraArgs
    )
    $loginCommand = "login"
    $loginCommand += " --action=log-email"
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

What this configuration does is define an alias called login that runs the browser-automation.bat file in this repository, then creates a function that executes the newly created "login" command, passing by default the argument `--action=log-email`. So, the following commands are equivalent:

```shell
login --action=log-email
```

&

```shell
log-email
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

### 3.4 scheduler

#### 3.4.1 Specifications

The `scheduler` command opens a browser and shows the list of scheduled jobs of the computer, it allows the CRUD actions for scheduled jobs. The command saves the scheduled jobs in a temporary file and starts a node server to serve the html files and routes, by default the command starts in a separated

It accepts the following parameters:

| Long Parameter | Short Parameter | Required | Description                                                 |
| -------------- | --------------- | -------- | ----------------------------------------------------------- |
| \_start\_        |                 | NO       | Starts the server in the same terminal that ran the command |
| --verbose      | -v              | NO       | Indicates whether to display logs during execution          |

#### 3.4.2 Configuration

Before using the `scheduler` command, you need to configure the server port that should be used (the default is 3002) and to insert the computer user password because this is needed to update scheduled tasks. To do this, you need to create/update the `config.json` file in the `./config/` directory. There is an example of how this config should look in the same folder, and it is structured like this:

```json
{
  "scheduler": {
    "serverPort": 3002,
    "userPassword": ""
  }
}
```

Similarly to the previous command and as mentioned in section 1.2 of this README, you need to configure the command in `$PROFILE`. Once the profile is open, the command looks like this:

```powershell
New-Alias -Name scheduler -Value Path\To\Your\Cloned\Repo\scheduler\scheduler.bat
```

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

# Other versions

[Readme in Portuguese (PT-BR)](README.pt-br.md)
