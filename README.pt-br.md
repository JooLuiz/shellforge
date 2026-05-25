# windows-custom-commands

O projeto Windows Custom Commands tem por objetivo disponibilizar novos comandos para serem executados no PowerShell do Windows.

## 1. Como criar novos comandos no Windows

Antes de tudo, é importante explicar como criar novos comandos no windows. Para fazer isso você precisará adicionar algumas coisas no seu arquivo `$PROFILE`

### 1.1 Acessando o Profile

Para acessar o `$PROFILE` basta abrir o seu PowerShell e rodar o seguinte comando:

```powershell
notepad $PROFILE
```

> **_DICA:_** caso prefira, abra o `$PROFILE` em outro app como o VSCode ou o Sublime.

### 1.2 Adicionando comandos

Este arquivo carrega sempre que você abre o terminal no windows, então tudo o que você coloca nele torna-se o "padrão do terminal".

Assim, existem 2 formas (que eu conheço) para criarmos novos comandos no nosso terminal e ambas são modificando nosso arquivo `$PROFILE`

#### 1.2.1 Adicionando Aliases

A primeira é adicionando novos aliases ao `$PROFILE`, você pode fazer isso com o seguinte comando:

```powershell
New-Alias -Name meu-comando -Value Caminho\Para\Meu\Comando.bat
```

Agora, o que está acontecendo?

| Ação      | Definição                                                                                                                                                                                                       |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New-Alias | Cria aliases que associam comandos a determinados arquivos, [clique aqui para mais informações](https://learn.microsoft.com/pt-br/powershell/module/microsoft.powershell.utility/new-alias?view=powershell-7.4) |
| -Name     | Define o nome do comando que será executado no powershell, no caso do exemplo seria "meu-comando"                                                                                                               |
| -Value    | Define qual arquivo será chamado quando o comando for executado                                                                                                                                                 |

#### 1.2.2 Criando functions

A outra forma que você pode criar novos comando é adicionando functions ao `$PROFILE`, por exemplo:

```powershell
Function meu-comando-custom {
    param (
        [string[]]$ExtraArgs
    )
    $loginCommand = "meu-comando"
    $loginCommand += " --meu-parametro=meu-valor"
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

Neste caso,estamos criando uma function chamada `meu-comando-custom` e ele chama o comando previamente definido `meu-comando` passando parâmetros específicos.

## 2 Instalação

Assim que você clonar esse repositório rode seguinte comando para instalar as dependências do app

```
npm install
```

## 3. Comandos Disponíveis

### 3.1 action-runner

#### 3.1.1 Especificações

O comando `action-runner` executa um fluxo definido em `actionRunner`, que pode combinar automação de browser, requisições de API e comandos de shell. Ele aceita os seguintes parâmetros:

| Parâmetro longo      | Parâmetro curto | Obrigatório | Descrição                                              |
| -------------------- | --------------- | ----------- | ------------------------------------------------------ |
| --action             | -a              | SIM         | Indica qual ação o action-runner irá realizar          |
| --verbose            | -v              | NÃO         | Indica se irá mostrar logs durante a execução          |
| --arg.\<nome\>=valor | —               | NÃO         | Passa um argumento customizado para o contexto da ação |

**Argumentos customizados** permitem passar valores da CLI para qualquer ação. Por exemplo:

```powershell
action-runner --action=perform-api-request "--arg.message=Olá da CLI"
```

Dentro da ação, `{{context.message}}` resolve para `"Olá da CLI"` (após um passo `getArguments` mapeá-lo).

#### 3.1.2 Configuração

Antes de usar o comando `action-runner`, é necessário configurar as ações desejadas. Para isso é preciso criar o arquivo `config.json` no diretório `./config/`. Há um exemplo na mesma pasta (`config-example.json`).

Cada ação em `actionRunner` aceita um destes formatos:

**Login simples (campos planos / legado)** — usuário, senha e enviar:

```json
{
  "actionRunner": {
    "simple-login": {
      "url": "https://example.com/login",
      "usernameInput": "#email",
      "usernameValue": "user@example.com",
      "passwordInput": "#password",
      "passwordValue": "sua-senha",
      "loginButton": "#submit"
    }
  }
}
```

**Login em várias etapas (`steps`)** — use quando precisar de cliques extras, esperas ou ordem customizada (ex.: clicar em "Próximo" após o usuário):

```json
{
  "actionRunner": {
    "login-multi-etapas": {
      "steps": [
        { "action": "navigate", "url": "https://example.com/login" },
        { "action": "type", "selector": "#username", "value": "seu-usuario" },
        {
          "action": "click",
          "selector": "#nextBtn",
          "waitForSelector": "#password"
        },
        { "action": "type", "selector": "#password", "value": "sua-senha" },
        { "action": "click", "selector": "#loginbtn" }
      ]
    }
  }
}
```

Valores suportados em `action` de cada passo:

| action            | campos obrigatórios                                             | campos opcionais                                                                                                          |
| ----------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `navigate`        | `url`                                                           | —                                                                                                                         |
| `type`            | `selector`, `value`                                             | `delay`, `waitForLoading`, `timeout`                                                                                      |
| `click`           | `selector`                                                      | `waitForNavigation`, `waitForUrl`, `waitForSelector`, `waitForLoading`, `timeout` (ms, padrão 30000), `jsClick`, `iframe` |
| `wait`            | `ms`, `selector`, `urlContains` ou `waitForLoading`             | `timeout` (ao usar `selector`, `urlContains` ou `waitForLoading`)                                                         |
| `setWebStorage`   | ao menos um entre `localStorage`, `sessionStorage` ou `cookies` | —                                                                                                                         |
| `closeBrowser`    | —                                                               | —                                                                                                                         |
| `forEachElement`  | `selector`, `steps`                                             | `textContentSelector`, `excludeTextPatterns`, `clickSelector`, `skipIfPositionMatch`                                      |
| `apiRequest`      | `url`                                                           | `method`, `params`, `headers`, `auth`, `body`, `timeout`, `ignoreHttpErrors`, `storeAs`                                   |
| `extractVariable` | `source`, `storeAs`                                             | —                                                                                                                         |
| `shell`           | `command` ou `commands`                                         | `cwd`, `shell`, `timeout`, `ignoreExitCode`, `maxBuffer`, `storeAs`                                                       |
| `getArguments`    | —                                                               | `required`, `optional`, `defaults`                                                                                        |
| `invokeAction`    | `name`                                                          | `args`, `continueOnError`, `storeAs`                                                                                      |
| `tryCatch`        | `try`                                                           | `catch`, `finally`                                                                                                        |

**`setWebStorage`** injeta dados no web storage ou cookies do navegador. Útil para pré-autenticar sessões que exigem fluxos de login complexos (ex.: códigos OTP). Valores que são objetos ou arrays são automaticamente convertidos com `JSON.stringify` antes de serem armazenados. Cookies usam o formato nativo do `page.setCookie()` do Puppeteer.

Exemplo:

```json
{
  "action": "setWebStorage",
  "localStorage": {
    "token": "seu-jwt-token",
    "user": { "id": "123", "name": "john" }
  }
}
```

> **_NOTA:_** `setWebStorage` deve ser usado **após** um passo `navigate` para o domínio alvo, pois localStorage/sessionStorage está vinculado à origem da página. Para aplicar a sessão injetada, adicione outro passo `navigate` após `setWebStorage` para recarregar a página.

**`closeBrowser`** fecha o navegador de forma controlada. Geralmente usado como último passo de uma ação.

**`apiRequest`** executa chamadas HTTP e pode salvar o retorno no contexto com `storeAs`.

**`extractVariable`** salva um valor resolvido no contexto para reutilização em passos seguintes.

**`shell`** executa comandos de shell (PowerShell por padrão) e também pode salvar a saída no contexto.

**`getArguments`** valida e mapeia argumentos da CLI (passados via `--arg.<nome>=<valor>`) ou argumentos de uma ação pai (via `invokeAction`) para o contexto de execução. Use `required` para listar argumentos obrigatórios (lança erro se ausente), `optional` para argumentos mapeados somente quando presentes, e `defaults` para fornecer valores padrão para argumentos ausentes.

**`invokeAction`** chama outra ação definida no config `actionRunner` pelo nome. A ação filha executa com um contexto isolado alimentado por `args`. Use `storeAs` para copiar o contexto final da ação filha de volta para o contexto pai. `continueOnError: true` impede que falhas na ação filha abortem a ação pai. A recursão é limitada a 5 níveis.

Exemplo de ação composável:

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
    "meu-fluxo": {
      "steps": [
        { "action": "shell", "command": "echo 'trabalhando'" },
        {
          "action": "invokeAction",
          "name": "perform-api-request",
          "args": { "message": "fluxo concluído" },
          "continueOnError": true
        }
      ]
    }
  }
}
```

**`tryCatch`** envolve passos em semântica try/catch/finally. Se algum passo em `try` lançar erro, a mensagem é armazenada em `context.errorMessage` e os passos de `catch` são executados. Passos em `finally` sempre executam, independentemente de sucesso ou falha. Se nenhum `catch` for definido, o erro é relançado para o fluxo pai.

Exemplo:

```json
{
  "action": "tryCatch",
  "try": [
    { "action": "shell", "command": "comando-arriscado" },
    {
      "action": "invokeAction",
      "name": "perform-api-request",
      "args": { "message": "tarefa concluída com sucesso" }
    }
  ],
  "catch": [
    {
      "action": "invokeAction",
      "name": "perform-api-request",
      "args": { "message": "tarefa falhou, erro: {{context.errorMessage}}" }
    }
  ]
}
```

### Placeholders dinâmicos

Todos os campos string dos passos aceitam interpolação:

- `{{context.algum.campo}}` para ler valores produzidos por passos anteriores.
- `{{env.VARIAVEL}}` para ler variáveis de ambiente da máquina.

Exemplo:

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

#### 3.2.1 Especificações

O comando `touch` cria um novo arquivo vazio ou atualiza a data de modificação de um arquivo existente. Ele funciona de maneira semelhante ao comando `touch` no Unix.

Por exemplo, o comando `touch arquivo.txt` cria o arquivo `arquivo.txt` se ele não existir ou atualiza a data de modificação para o momento atual se já existir.

#### 3.2.2 Configuração

De maneira semelhante ao comando anterior e como mencionado na seção 1.2 deste README, é preciso configurar o comando no `$PROFILE`. Uma vez aberto o profile o comando fica da seguinte maneira:

```
New-Alias -Name touch -Value Path\To\Your\Cloned\Repo\touch\touch.bat
```

### 3.3 reinitialize

#### 3.3.1 Especificações

O comando `reinitialize` reinicializa o seu PowerShell, carregando quaisquer novas alterações feitas no seu `$PROFILE` sem que você precise fechar o terminal.

#### 3.3.2 Configuração

da mesma forma que o comando anterior e conforme mencionado na seção 1.2 deste README, você precisa configurar o comando no `$PROFILE`. Uma vez aberto o profile, o comando fica assim:

```powershell
New-Alias -Name reinitialize -Value Caminho\Para\Seu\Repositorio\Clonado\reinitialize\reinitialize.bat
```

Claro, aqui está o markdown traduzido para o português:

---

### 3.4 Tarefas Agendadas

#### 3.4.1 Especificações

A pasta `scheduled-tasks/` contém um script PowerShell de exemplo que cria uma Tarefa Agendada do Windows para executar qualquer comando customizado em um cronograma recorrente. Ele utiliza `Register-ScheduledTask` para criar uma tarefa com gatilhos semanais configuráveis. A tarefa carrega seu `$PROFILE` antes de executar para que funções e aliases customizados estejam disponíveis.

Você pode encontrar o exemplo em `scheduled-tasks/setup-scheduled-task.example.ps1`.

#### 3.4.2 Configuração

1. Copie o arquivo de exemplo e renomeie-o (ex.: `setup-minha-tarefa.ps1`).
2. Abra a cópia e substitua os placeholders:
   - `$TaskName` — defina um nome único para sua tarefa agendada.
   - `$triggerTimes` — defina os horários em que deseja que a tarefa seja disparada (formato 24h).
   - `$weekdays` — defina os dias da semana.
   - `{{YOUR_COMMAND_HERE}}` — substitua pelo comando ou função que deseja executar (ex.: uma função definida no seu `$PROFILE`).

3. Execute o script uma vez em um terminal PowerShell **elevado** (Administrador):

```powershell
.\scheduled-tasks\setup-minha-tarefa.ps1
```

Para remover a tarefa agendada:

```powershell
.\scheduled-tasks\setup-minha-tarefa.ps1 -Remove
```

Você pode verificar se a tarefa foi criada com:

```powershell
Get-ScheduledTask -TaskName "YourTaskName" | Get-ScheduledTaskInfo
```

> **_NOTA:_** certifique-se de que o comando referenciado já está definido no seu `$PROFILE` antes de executar o script de configuração, pois a tarefa agendada depende dele.

---

## 4. Interface Desktop

O repositório agora também possui um gerenciador desktop em `ui/` para configurar:

- comandos pré-definidos e aliases (`reinitialize`, `touch`, `action-runner`)
- ações customizadas do `config/config.json` (com toggle `availableOnCLI` e aliases)
- arquivos de tarefas agendadas em `scheduled-tasks/`

Comportamentos principais da UI desktop:

- modais de edição salvam automaticamente após 10 segundos sem alterações e também aceitam salvar manualmente
- modais de criação salvam apenas ao clicar em `Save`
- estados do botão de salvar em edição: `Save`, `Saving...` e `Saved`
- toggles das linhas de tarefas agendadas executam o script `.ps1` correspondente (`-Remove` ao desligar)

Para instalação e comandos de desenvolvimento, veja [`ui/README.md`](ui/README.md).

# Other versions

[Readme em Inglês (EN)](README.md)
