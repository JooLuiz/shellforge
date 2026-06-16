# ShellForge

O ShellForge ajuda a criar, executar e agendar automações personalizadas no PowerShell do Windows, indo além de comandos básicos de shell.

**Site de documentação:** [shellforge.app.br](https://shellforge.app.br/) — execute localmente com `npm run page:dev` (veja [`page/README.md`](page/README.md)).

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

### App desktop (recomendado)

Baixe o instalador Windows mais recente em [GitHub Releases](https://github.com/JooLuiz/shellforge/releases/latest) ou use o botão de download em [shellforge.app.br](https://shellforge.app.br/).

### A partir do código-fonte

Assim que você clonar esse repositório rode seguinte comando para instalar as dependências do app

```
npm install
```

Para gerar o instalador localmente:

```
npm run ui:dist
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

Cada ação em `actionRunner` usa um array `steps`. Campos planos legados de login (`url`, `usernameInput`, `passwordInput`, etc.) ainda são suportados pelo `normalizeSteps` em configs antigas, mas ações novas devem usar `steps`.

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

Configuração opcional de navegador por ação:

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

`browserProfile` configura uma chave de perfil para aquela ação. Em runtime, ela é sempre resolvida para `{PROJECT_FOLDER}/.shellforge-browser-profiles/<browserProfile>` e passada ao Puppeteer como `userDataDir`, mantendo cookies e storage entre execuções. Isso é recomendado para apps com login sensível (ex.: Clockify) que rotacionam estado de sessão.

Valores suportados em `action` de cada passo:

| action            | campos obrigatórios                                             | campos opcionais                                                                                                          |
| ----------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `navigate`        | `url`                                                           | —                                                                                                                         |
| `type`            | `selector`, `value`                                             | `delay`, `waitForLoading`, `timeout`                                                                                      |
| `click`           | `selector`                                                      | `waitForNavigation`, `waitForUrl`, `waitForSelector`, `waitForLoading`, `timeout` (ms, padrão 30000), `jsClick`, `iframe` |
| `wait`            | `ms` (número não-negativo)                                      | —                                                                                                                         |
| `waitForPageState`| ao menos um entre `selector`, `urlContains` ou `waitForLoading: true` | `timeout`                                                                                                          |
| `setWebStorage`   | ao menos um entre `localStorage`, `sessionStorage` ou `cookies` | —                                                                                                                         |
| `closeBrowser`    | —                                                               | —                                                                                                                         |
| `forEachElement`  | `selector`, `steps`                                             | `textContentSelector`, `excludeTextPatterns`, `clickSelector`, `skipIfPositionMatch`                                      |
| `forEach`         | `steps` e exatamente um entre `list` ou `count`                 | —                                                                                                                         |
| `apiRequest`      | `url`                                                           | `method`, `params`, `headers`, `auth`, `body`, `timeout`, `ignoreHttpErrors`, `storeAs`                                   |
| `setVariable`     | `source`, `storeAs`                                             | —                                                                                                                         |
| `shell`           | `command` ou `commands`                                         | `cwd`, `shell`, `timeout`, `ignoreExitCode`, `maxBuffer`, `storeAs`                                                       |
| `getArguments`    | —                                                               | `required`, `optional`, `defaults`                                                                                        |
| `invokeAction`    | `name`                                                          | `args`, `continueOnError`, `storeAs`                                                                                      |
| `tryCatch`        | `try`                                                           | `catch`, `finally`                                                                                                        |
| `ifElse`          | `left`, `operator`, `then`                                      | `right` (obrigatório exceto quando `operator` é `exists`), `else`                                                         |

Os sub-passos de `forEachElement` suportam todas as ações de browser mais uma allowlist explícita de ações não-browser: `wait` e `apiRequest`.

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
>
> **_NOTA:_** para apps que invalidam ou rotacionam autenticação com frequência, prefira `browserProfile` em vez de injetar tokens fixos via `setWebStorage`. Com perfil persistente, você faz login manual uma vez e reutiliza a sessão nas próximas execuções.

**`closeBrowser`** fecha o navegador de forma controlada. Geralmente usado como último passo de uma ação.

**`apiRequest`** executa chamadas HTTP e pode salvar o retorno no contexto com `storeAs`. O valor armazenado é sempre um objeto com três chaves: `status` (código HTTP), `headers` (cabeçalhos da resposta) e `body` (JSON parseado ou texto bruto). Por exemplo, `{{context.apiResponse.body.id}}` acessa o campo `id` do corpo da resposta, e `{{context.apiResponse.status}}` lê o status HTTP.

**`wait`** é um delay genérico que pausa a ação por `ms` milissegundos. Não depende de browser, então pode ser usado com segurança entre passos não-browser (por exemplo, para limitar taxa entre `apiRequest`s dentro de um `forEach`, ou para dar tempo a um processo `shell` em background antes de testá-lo). Ele também é permitido em sub-passos de `forEachElement`.

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

**`waitForPageState`** é o equivalente exclusivo de browser: aguarda até que um `selector` fique visível, a URL contenha um trecho, ou todos os overlays de loading terminem. Use `timeout` (padrão 30000 ms) para limitar a espera. Este passo exige um browser, então prefira `wait` para pausas não relacionadas a browser.

**`setVariable`** salva um valor resolvido no contexto para reutilização em passos seguintes. Útil para criar atalhos para valores aninhados ou para materializar variáveis de ambiente em chaves mais convenientes.

**`forEach`** itera sobre uma `list` (array, com suporte a interpolação) ou repete `count` vezes, executando `steps` a cada iteração. Quando `list` é informada, os sub-passos podem ler o item atual via `{{context.item}}`. O índice atual está sempre disponível como `{{context.index}}`. Valores externos de `item` e `index` são restaurados ao final do bloco, então `forEach` aninhados são seguros. Sub-passos podem ser qualquer ação registrada.

**`shell`** executa comandos de shell (PowerShell por padrão) e também pode salvar a saída no contexto. Quando `storeAs` é definido, o valor armazenado tem sempre o formato `{ stdout, stderr, exitCode }`. Em caso de sucesso o `exitCode` é `0`; quando `ignoreExitCode: true` está definido e o comando falha, `exitCode` reflete o código de saída não-zero retornado pelo processo.

**`getArguments`** valida e mapeia argumentos da CLI (passados via `--arg.<nome>=<valor>`) ou argumentos de uma ação pai (via `invokeAction`) para o contexto de execução. Use `required` para listar argumentos obrigatórios (lança erro se ausente), `optional` para argumentos mapeados somente quando presentes, e `defaults` para fornecer valores padrão para argumentos ausentes.

**`invokeAction`** chama outra ação definida no config `actionRunner` pelo nome. A ação filha executa com um contexto isolado alimentado por `args`. Use `storeAs` para copiar o contexto final da ação filha de volta para o contexto pai. `continueOnError: true` impede que falhas na ação filha abortem a ação pai. A recursão é limitada a 5 níveis. No editor da UI, uma ação não pode invocar a si mesma fora de um bloco `ifElse`; coloque auto-invocações protegidas dentro de `then` ou `else` (por exemplo, loops de retry com contador).

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

**`ifElse`** avalia uma comparação em runtime e executa o array de passos `then` ou `else`. O operando esquerdo deve resolver a partir de um único placeholder `{{context.*}}` ou `{{env.*}}`. Operadores suportados: `eq`, `gt`, `gte`, `lt`, `lte` e `exists` (verifica se o valor esquerdo está definido e não vazio). Quando ambos os operandos são números finitos, a comparação é numérica; caso contrário, os valores são comparados como strings. O array `else` é opcional.

Exemplo:

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

A variável `apiResponse` terá o formato `{ status, headers, body }`. Acesse campos aninhados com `{{context.apiResponse.body.someField}}`.

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
New-Alias -Name reinitialize -Value Caminho\Para\Seu\Repositorio\Clonado\commands\reinitialize\reinitialize.bat
```

Claro, aqui está o markdown traduzido para o português:

---

### 3.4 Catálogo de comandos pré-definidos

O ShellForge inclui **20 comandos pré-definidos**. Ative-os na UI desktop (aba `Pre-defined Commands`) ou adicionando aliases no bloco gerenciado do `$PROFILE`.

Novos comandos ficam **desabilitados por padrão** até serem ativados na UI.

| Categoria | Comando | Descrição |
| --- | --- | --- |
| Core | `action-runner` | Executa fluxos de ações customizadas do `config/config.json` |
| Ciclo do shell | `reinitialize` | Recarrega o profile do PowerShell atual |
| Ciclo do shell | `reload-env` | Atualiza o `PATH` na sessão atual |
| Ciclo do shell | `profile` | Abre o `$PROFILE` no editor preferido |
| Paridade Unix | `touch` | Cria arquivo ou atualiza data de modificação |
| Paridade Unix | `which` | Imprime o caminho resolvido de um comando |
| Paridade Unix | `mkdirp` | Cria diretórios aninhados |
| Paridade Unix | `open` | Abre arquivos, pastas ou URLs |
| Paridade Unix | `pbcopy` | Copia stdin ou arquivo para a área de transferência |
| Paridade Unix | `pbpaste` | Imprime conteúdo da área de transferência |
| Paridade Unix | `realpath` | Resolve caminho absoluto canônico |
| Paridade Unix | `uuid` | Gera UUID (`-n` sem quebra de linha) |
| Paridade Unix | `head` | Imprime primeiras linhas (`-n` opcional) |
| Paridade Unix | `tail` | Imprime últimas linhas (`-n` opcional) |
| Paridade Unix | `watch` | Reexecuta comando a cada N segundos (`-n` opcional) |
| Paridade Unix | `git-root` | Encontra raiz do repositório Git (`--cd` muda diretório) |
| Utilitários Windows | `kill-port` | Encerra processo na porta TCP (`-f` opcional) |
| Utilitários Windows | `as-admin` | Executa comando como administrador |
| Utilitários Windows | `hidden` | Executa comando em janela oculta |

Detalhes de implementação:

- Cada comando fica em `<command-key>/<command-key>.bat`.
- Novos comandos usam scripts PowerShell com helpers em [`command-lib/ShellForge.CommandLib.ps1`](command-lib/ShellForge.CommandLib.ps1).
- O ShellForge não inclui `sleep`; use o alias nativo `sleep` ou `Start-Sleep` do PowerShell.
- Metadados e ordem canônica (Action Runner primeiro) ficam em [`ui/src/shared/predefinedCommandsRegistry.ts`](ui/src/shared/predefinedCommandsRegistry.ts).

### 3.5 Tarefas Agendadas

#### 3.5.1 Especificações

A pasta `scheduled-tasks/` contém um script PowerShell de exemplo que cria uma Tarefa Agendada do Windows para executar qualquer comando customizado em um cronograma recorrente. Ele utiliza `Register-ScheduledTask` para criar uma tarefa com gatilhos semanais configuráveis. A tarefa carrega seu `$PROFILE` antes de executar para que funções e aliases customizados estejam disponíveis.

Você pode encontrar o exemplo em `scheduled-tasks/setup-scheduled-task.example.ps1`.

#### 3.5.2 Configuração

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

- comandos pré-definidos e aliases (20 comandos; Action Runner sempre primeiro)
- ações customizadas do `config/config.json` (com toggle `availableOnCLI` e aliases)
- arquivos de tarefas agendadas em `scheduled-tasks/`

Comportamentos principais da UI desktop:

- busca no cabeçalho da aba filtra linhas em todas as abas (a busca é resetada ao trocar de aba)
- aba de comandos pré-definidos inclui filtros por categoria (`Core`, `Shell lifecycle`, `Unix parity`, `Windows utilities`)
- modais de edição salvam automaticamente após 10 segundos sem alterações e também aceitam salvar manualmente
- modais de criação salvam apenas ao clicar em `Save`
- estados do botão de salvar em edição: `Save`, `Saving...` e `Saved`
- toggles das linhas de tarefas agendadas executam o script `.ps1` correspondente (`-Remove` ao desligar)

Para instalação e comandos de desenvolvimento, veja [`ui/README.md`](ui/README.md).

## 5. Segurança e privilégios

O ShellForge é uma ferramenta de automação para usuários avançados. Vários recursos executam com os privilégios da sua conta Windows:

- `as-admin`, `hidden` e passos `shell` do action-runner podem executar comandos arbitrários.
- Passos `writeFile` podem criar ou sobrescrever arquivos em qualquer local onde sua conta tenha permissão de escrita.
- Ações personalizadas expostas na CLI via aliases no `$PROFILE` rodam da mesma forma que invocar o `action-runner` manualmente.
- Perfis de navegador em `.shellforge-browser-profiles/` podem armazenar cookies e dados de sessão.

Ative apenas comandos e carregue configs de ações em que você confia. Revise arquivos de config compartilhados antes de executá-los em máquinas com dados sensíveis.

Veja também [`commands/README.md`](commands/README.md).

## Licença

Este projeto está licenciado sob a Licença Pública Geral Affero GNU v3.0 (AGPLv3) - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

# Other versions

[Readme em Inglês (EN)](README.md)
