# windows-custom-commands

O projeto Windows Custom Commands tem por objetivo disponibilizar novos comandos para serem executados no PowerShell do Windows.

## 1. Como criar novos comandos no Windows

Antes de tudo, é importante explicar como criar novos comandos no windows. Para fazer isso você precisará adicionar algumas coisas no seu arquivo `$PROFILE`


### 1.1 Acessando o Profile

Para acessar o `$PROFILE` basta abrir o seu PowerShell e rodar o seguinte comando:

``` powershell
notepad $PROFILE
```

> **_DICA:_**  caso prefira, abra o `$PROFILE` em outro app como o VSCode ou o Sublime.

### 1.2 Adicionando comandos

Este arquivo carrega sempre que você abre o terminal no windows, então tudo o que você coloca nele torna-se o "padrão do terminal".

Assim, existem 2 formas (que eu conheço) para criarmos novos comandos no nosso terminal e ambas são modificando nosso arquivo `$PROFILE`

#### 1.2.1 Adicionando Aliases

A primeira é adicionando novos aliases ao `$PROFILE`, você pode fazer isso com o seguinte comando:

```powershell
New-Alias -Name meu-comando -Value Caminho\Para\Meu\Comando.bat
```

Agora, o que está acontecendo?

| Ação      | Definição |
|-----------|-----------|
| New-Alias | Cria aliases que associam comandos a determinados arquivos, [clique aqui para mais informações](https://learn.microsoft.com/pt-br/powershell/module/microsoft.powershell.utility/new-alias?view=powershell-7.4) |
| -Name | Define o nome do comando que será executado no powershell, no caso do exemplo seria "meu-comando"     |
| -Value | Define qual arquivo será chamado quando o comando for executado |

#### 1.2.2 Criando functions

A outra forma que você pode criar novos comando é adicionando functions ao `$PROFILE`, por exemplo:

``` powershell
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

### 3.1 login

#### 3.1.1 Especificações

O comando `login` abre um browser e faz o login de acordo com as configurações. Ele aceita os seguintes parâmetros:

| Parâmetro longo | Parâmetro curto  | Obrigatório | Descrição |
|---|---|---| --- |
| --action  | -a  | SIM  | Indica qual ação o login irá realizar    |
|  --verbose | -v  | NÃO  | Indica se irá mostrar logs durante a execução    |

#### 3.1.2 Configuração

Antes de usar o comando `login`, é necessário configurar as ações desejadas. Para isso é preciso criar o arquivo `config.json` no diretório `./config/`. Há um exemplo na mesma pasta (`config-example.json`).

Cada ação em `browserAutomation` aceita um destes formatos:

**Login simples (campos planos / legado)** — usuário, senha e enviar:

```json
{
  "browserAutomation": {
    "logar-email": {
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
  "browserAutomation": {
    "login-multi-etapas": {
      "steps": [
        { "action": "navigate", "url": "https://example.com/login" },
        { "action": "type", "selector": "#username", "value": "seu-usuario" },
        { "action": "click", "selector": "#nextBtn", "waitForSelector": "#password" },
        { "action": "type", "selector": "#password", "value": "sua-senha" },
        { "action": "click", "selector": "#loginbtn" }
      ]
    }
  }
}
```

Valores suportados em `action` de cada passo:

| action     | campos obrigatórios     | campos opcionais                              |
| ---------- | ----------------------- | --------------------------------------------- |
| `navigate` | `url`                   | —                                             |
| `type`     | `selector`, `value`     | —                                             |
| `click`    | `selector`              | `waitForNavigation`, `waitForUrl`, `waitForSelector`, `waitForLoading`, `timeout` (ms, padrão 30000) |
| `wait`     | `ms`, `selector`, `urlContains` ou `waitForLoading` | `timeout` (ao usar `selector`, `urlContains` ou `waitForLoading`) |
| `setWebStorage` | ao menos um entre `localStorage`, `sessionStorage` ou `cookies` | — |
| `closeBrowser` | — | — |

**`setWebStorage`** injeta dados no web storage ou cookies do navegador. Útil para pré-autenticar sessões que exigem fluxos de login complexos (ex.: códigos OTP). Valores que são objetos ou arrays são automaticamente convertidos com `JSON.stringify` antes de serem armazenados. Cookies usam o formato nativo do `page.setCookie()` do Puppeteer.

Exemplo:

```json
{
  "action": "setWebStorage",
  "localStorage": {
    "token": "seu-jwt-token",
    "user": { "id": "123", "name": "joao" }
  }
}
```

> **_NOTA:_** `setWebStorage` deve ser usado **após** um passo `navigate` para o domínio alvo, pois localStorage/sessionStorage está vinculado à origem da página. Para aplicar a sessão injetada, adicione outro passo `navigate` após `setWebStorage` para recarregar a página.

**`closeBrowser`** fecha o navegador de forma controlada. Geralmente usado como último passo de uma ação.

Todos os passos com seletor esperam o elemento ficar **visível** (não só existir no DOM). Em formulários multi-etapas, use `waitForSelector` que só aparece após o passo anterior (ex.: `#password-input-group:not(.hidden) #password-input-field`).

Os seletores são CSS padrão. Para ids dinâmicos, use seletores por atributo:

| Padrão | Exemplo |
| ------ | ------- |
| id começa com | `[id^="btn-clocking-event"]` |
| id contém | `[id*="btn-clocking-event"]` |
| id termina com | `[id$="-menu"]` |

Após redirect de login, use `waitForNavigation: true` no clique de login, depois `wait` com `urlContains` (ex.: `"senior-x"`) e `waitForLoading: true` antes de clicar na nova tela. O Senior X exibe overlays `s-loading-state` que bloqueiam cliques mesmo com o botão no DOM. O runner espera os loaders sumirem e o elemento ficar clicável (sem overlay por cima).

Se a ação tiver `steps`, esse array é usado. Caso contrário, os campos planos viram o fluxo padrão de quatro passos automaticamente.

> **_DICA:_**  como o browserAutomation é um objeto de objetos você pode ter `n` ações de login para diferentes sites, desde que as adicionem no arquivo config devidamente.

Agora é preciso configurar o comando no seu `$PROFILE`, como já foi mencionado no step 1.2 desde README.

Assim, basta adicionar o seguinte código no `$PROFILE`:

```powershell
New-Alias -Name login -Value Path\To\Your\Cloned\Repo\browser-automation\browser-automation.bat

Function logar-email {
    param (
        [string[]]$ExtraArgs
    )
    $loginCommand = "login"
    $loginCommand += " --action=logar-email"
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

O que essa configuração faz é definir um alias chamado login que roda o arquivo browser-automation.bat que está nesse repositório e depois cria uma função que executa o comando "login" recem criado passando por padrão o argumento `--action=logar-email`. Ou seja os seguintes comandos são equivalentes:

```
login --action=logar-email
```
&
```
logar-email
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

### 3.4 scheduler

#### 3.4.1 Especificações

O comando `scheduler` abre um navegador e mostra a lista de tarefas agendadas do computador, permitindo as ações de CRUD para tarefas agendadas. O comando salva as tarefas agendadas em um arquivo temporário e inicia um servidor Node para servir os arquivos HTML e rotas. Por padrão, o comando inicia em um terminal separado.

Ele aceita os seguintes parâmetros:

| Parâmetro Longo | Parâmetro Curto | Obrigatório | Descrição                                                              |
| ---------------- | ---------------- | ------------ | ---------------------------------------------------------------------- |
| \_start\_          |                  | NÃO          | Inicia o servidor no mesmo terminal que executou o comando             |
| --verbose        | -v               | NÃO          | Indica se deve exibir logs durante a execução                           |

#### 3.4.2 Configuração

Antes de usar o comando `scheduler`, você precisa configurar a porta do servidor que deve ser usada (o padrão é 3002) e inserir a senha do usuário do computador, pois isso é necessário para atualizar as tarefas agendadas. Para fazer isso, você precisa criar/atualizar o arquivo `config.json` no diretório `./config/`. Há um exemplo de como essa configuração deve parecer na mesma pasta, e está estruturado da seguinte forma:

```json
{
  "scheduler": {
    "serverPort": 3002,
    "userPassword": ""
  }
}
```

De forma semelhante ao comando anterior e conforme mencionado na seção 1.2 deste README, você precisa configurar o comando no `$PROFILE`. Uma vez que o perfil esteja aberto, o comando fica assim:

```powershell
New-Alias -Name scheduler -Value Caminho\Para\Seu\Repositório\Clonado\scheduler\scheduler.bat
```

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

# Other versions

[Readme em Inglês (EN)](README.md)
