import type { TranslationDictionary } from "./types";

export const ptBR: TranslationDictionary = {
  meta: {
    siteDescription:
      "Crie, execute e agende automações personalizadas no Windows com fluxos visuais, utilitários CLI e tarefas agendadas.",
    windowsOnlyNote: "Somente Windows · v1 focada em Windows 10/11",
  },
  nav: {
    home: "Início",
    gettingStarted: "Primeiros passos",
    desktopUi: "Interface desktop",
    actionSteps: "Passos de ação",
    predefinedCommands: "Comandos pré-definidos",
    configuration: "Configuração e CLI",
  },
  common: {
    copy: "Copiar",
    copied: "Copiado",
    comingSoon: "Em breve",
    downloadWindows: "Baixar para Windows",
    viewOnGitHub: "Ver no GitHub",
    browseActionSteps: "Ver passos de ação",
    gettingStarted: "Primeiros passos",
    param: "Parâmetro",
    type: "Tipo",
    required: "Obrigatório",
    interpolation: "Interpolação",
    description: "Descrição",
    example: "Exemplo",
    notes: "Notas",
    yes: "Sim",
    no: "Não",
    optional: "Opcional",
    conditional: "Condicional",
    screenshotPlaceholder: "Captura em breve — adicione PNG em page/public/screenshots/",
    categoryBrowser: "Navegador",
    categoryTiming: "Tempo",
    categoryData: "Dados e E/S",
    categoryControlFlow: "Controle de fluxo",
    openMenu: "Abrir menu",
    closeMenu: "Fechar menu",
  },
  home: {
    tag: "ShellForge",
    title: "Crie, execute e agende automações no Windows.",
    subtitle:
      "Gerenciador desktop e kit CLI para fluxos PowerShell — automação de navegador, requisições HTTP, comandos shell e 20 utilitários pré-definidos.",
    versionBadge: "App desktop para Windows",
    valuePropsTitle: "Por que usar o ShellForge?",
    valueProp1: "Editor visual de fluxos multi-etapa (navegador + API + shell)",
    valueProp2: "20 comandos CLI pré-definidos com paridade Unix no Windows",
    valueProp3: "Bloco gerenciado no $PROFILE — ative comandos sem editar aliases manualmente",
    valueProp4: "Tarefas agendadas via Agendador de Tarefas do Windows",
    valueProp5: "Perfis de navegador persistentes para apps com login frequente",
    examplesTitle: "Exemplos de fluxos",
    exampleLoginTitle: "Login multi-etapa no navegador",
    exampleApiTitle: "Buscar API e salvar em arquivo",
  },
  gettingStarted: {
    title: "Primeiros passos",
    subtitle: "Instale o ShellForge e execute sua primeira automação no Windows.",
    requirementsTitle: "Requisitos do sistema",
    requirementsBody:
      "Windows 10 ou 11 com PowerShell 5.1 ou superior. O app desktop não exige Node.js instalado separadamente.",
    installTitle: "Download e instalação",
    installBody:
      "Execute o instalador ou executável portátil do ShellForge. Na primeira abertura, o app inicia na aba Comandos pré-definidos.",
    installSizeTitle: "Tamanho do instalador",
    installSizeBody:
      "O instalador Windows é grande (geralmente cerca de 800 MB) porque inclui Electron, Node.js, Puppeteer e Chromium para automação de navegador. Após a instalação, os dados do usuário em AppData ficam bem menores: apenas config, tarefas agendadas e perfis de navegador. Arquivos de comando e dependências de runtime permanecem na pasta de instalação.",
    firstLaunchTitle: "Primeira abertura",
    firstLaunchBody:
      "O gerenciador tem três abas: Comandos pré-definidos, Ações personalizadas e Tarefas agendadas. Use a busca no cabeçalho para filtrar linhas.",
    enableCommandTitle: "Ative seu primeiro comando",
    enableCommandBody:
      "Ative um comando pré-definido. O ShellForge grava um bloco gerenciado no $PROFILE do PowerShell. Execute reinitialize no terminal para recarregar aliases.",
    cliTitle: "Executar Action Runner pela CLI",
    cliBody: "Após ativar o action-runner e criar uma ação, execute:",
    argsTitle: "Passar argumentos",
    argsBody: "Argumentos personalizados entram no contexto via passos getArguments:",
    filesTitle: "Onde ficam os arquivos",
    filesBody:
      "config/config.json (ações), scheduled-tasks/*.ps1 (agendamentos), .shellforge-browser-profiles/ (sessões de navegador).",
    troubleshootingTitle: "Solução de problemas",
    troubleshootingItems: [
      "Comando não encontrado — ative o comando no app e execute reinitialize.",
      "Alterações no profile ignoradas — feche e reabra o terminal ou execute reinitialize.",
      "Passo de navegador falha — verifique browserProfile ou execute navigate antes de setWebStorage.",
    ],
  },
  desktopUi: {
    title: "Interface desktop",
    subtitle: "Tour pelo gerenciador Electron do ShellForge.",
    intro:
      "O ShellForge é um app desktop com chrome fixo (cabeçalho, abas, rodapé) e conteúdo rolável. O tema segue o SO e persiste sua escolha.",
    predefinedTitle: "Aba Comandos pré-definidos",
    predefinedBody:
      "Vinte comandos por categoria (Core, Ciclo do shell, Paridade Unix, Utilitários Windows). Filtre com chips, personalize aliases e ative/desative. Toggles atualizam o bloco gerenciado no $PROFILE.",
    customTitle: "Aba Ações personalizadas",
    customBody:
      "Crie e edite fluxos no canvas React Flow. O painel de detalhes edita campos com dicas e interpolação. Defina browserProfile por ação, valide fluxos, execute pela UI e exponha na CLI com availableOnCLI.",
    scheduledTitle: "Aba Tarefas agendadas",
    scheduledBody:
      "Crie agendamentos com nome, comando (alias de ação), horários e dias da semana. Ativar registra a tarefa no Windows; desativar executa o script com -Remove.",
    footerNote: "O rodapé inclui alternância de tema e links externos. Modais de edição salvam automaticamente após 10 segundos sem alterações.",
  },
  actionSteps: {
    title: "Passos de ação",
    subtitle: "Referência completa de cada tipo de passo e parâmetro.",
    introInterpolation:
      "Campos string suportam {{context.caminho}} (valores de passos anteriores) e {{env.NOME_VARIAVEL}} (variáveis de ambiente).",
    introNested:
      "Arrays aninhados: steps (forEach, forEachElement), try/catch/finally (tryCatch), then/else (ifElse).",
    introBrowserProfile:
      "browserProfile opcional no nível da ação persiste cookies em .shellforge-browser-profiles/<nome>/ via Puppeteer userDataDir.",
    workflowsTitle: "Exemplos de fluxos compostos",
    steps: {
      navigate: {
        summary: "Abre uma URL no navegador.",
        notes: "Use waitForLoading quando a página exibir overlays de carregamento.",
      },
      type: { summary: "Digita texto em um input identificado por seletor CSS." },
      click: {
        summary: "Clica em um elemento. Suporta espera por navegação, seletores e clique via JS.",
      },
      wait: { summary: "Pausa a execução por tempo fixo. Não requer navegador." },
      waitForPageState: {
        summary: "Aguarda seletor visível, URL contendo texto ou fim do carregamento.",
        notes: "Requer página de navegador ativa.",
      },
      setWebStorage: {
        summary: "Injeta localStorage, sessionStorage ou cookies.",
        notes: "Execute após navigate no domínio alvo; recarregue com outro navigate para aplicar a sessão.",
      },
      closeBrowser: { summary: "Fecha a instância do navegador Puppeteer." },
      forEachElement: {
        summary: "Itera elementos DOM e executa sub-passos para cada match.",
        notes: "Sub-passos: ações de navegador mais wait e apiRequest.",
      },
      forEach: {
        summary: "Itera uma lista JSON ou repete um número fixo de vezes.",
        notes: "Use {{context.item}} e {{context.index}} nos sub-passos.",
      },
      apiRequest: {
        summary: "Requisição HTTP com resposta opcional em { status, headers, body }.",
      },
      setVariable: { summary: "Armazena valor resolvido no contexto de execução." },
      shell: {
        summary: "Executa PowerShell (padrão) ou shell personalizado.",
        notes: "Formato storeAs: { stdout, stderr, exitCode }.",
      },
      getArguments: {
        summary: "Mapeia argumentos CLI ou do pai para o contexto com required/optional/defaults.",
      },
      invokeAction: {
        summary: "Chama outra ação pelo nome com contexto filho isolado.",
        notes: "Recursão limitada a 5 níveis.",
      },
      tryCatch: {
        summary: "Executa try; em falha define context.errorMessage e executa catch/finally.",
      },
      ifElse: {
        summary: "Compara valores context/env e executa ramos then ou else.",
        notes: "Operadores: eq, gt, gte, lt, lte, exists.",
      },
      writeFile: { summary: "Grava conteúdo em arquivo com backup opcional." },
    },
    fieldHints: {
      url: "URL completa para navegar",
      waitForLoading: "Aguardar overlays de carregamento desaparecerem",
      selector: "Seletor CSS",
      value: "Texto a digitar — suporta interpolação",
      delay: "Milissegundos entre teclas",
      iframe: "iframe que contém o elemento alvo",
      waitForSelector: "Aguardar até este seletor ficar visível",
      waitForNavigation: "Aguardar navegação após o clique",
      timeout: "Tempo máximo de espera em milissegundos",
      jsClick: "Clique via JavaScript em vez de mouse simulado",
      ms: "Duração da pausa em milissegundos",
      urlContains: "Aguardar até a URL conter substring",
      localStorage: "Pares chave-valor para localStorage",
      sessionStorage: "Pares chave-valor para sessionStorage",
      cookies: "Array de objetos cookie do Puppeteer",
      list: "Array JSON — {{context.item}} por entrada",
      count: "Número de repetições",
      method: "Verbo HTTP",
      params: "Parâmetros de query string",
      headers: "Cabeçalhos HTTP",
      auth: "Basic auth: chaves username e password",
      body: "Corpo JSON da requisição",
      storeAs: "Nome da variável de contexto para armazenar resultado",
      ignoreHttpErrors: "Continuar em respostas 4xx/5xx",
      source: "Valor a armazenar — suporta interpolação",
      command: "Comando shell único",
      commands: "Comandos shell em sequência",
      shellArgs: "Argumentos extras para o binário shell",
      cwd: "Diretório de trabalho",
      shell: "Executável shell (padrão powershell.exe)",
      ignoreExitCode: "Continuar com código de saída diferente de zero",
      maxBuffer: "Buffer máximo stdout/stderr em bytes",
      required: "Nomes de argumentos obrigatórios",
      optional: "Nomes de argumentos opcionais",
      defaults: "Valores padrão para args opcionais",
      name: "Nome da ação a invocar",
      args: "Argumentos passados à ação filha",
      continueOnError: "Manter pai executando se filha falhar",
      path: "Caminho absoluto do arquivo",
      content: "Conteúdo do arquivo — suporta interpolação",
      backupIfExists: "Renomear arquivo existente com timestamp antes de sobrescrever",
      textContentSelector: "Sub-seletor para ler texto em cada elemento",
      excludeTextPatterns: "Ignorar elementos cujo texto corresponda aos padrões",
      clickSelector: "Sub-seletor para clicar em cada elemento",
      skipIfPositionMatch: "Ignorar elemento quando bounding-box corresponder",
      left: "Operando esquerdo — placeholder {{context.*}} ou {{env.*}}",
      operator: "Operador de comparação",
      right: "Operando direito (não obrigatório para exists)",
      try: "Passos a tentar",
      catch: "Passos quando try lança erro",
      finally: "Passos que sempre executam",
      then: "Passos quando condição é verdadeira",
      else: "Passos quando condição é falsa",
      browserProfile: "Chave de perfil para sessão persistente",
    },
    actionLevelTitle: "Configurações no nível da ação",
    actionLevelBody:
      "browserProfile na config da ação resolve para .shellforge-browser-profiles/<nome>/ e é passado ao Puppeteer como userDataDir.",
  },
  predefined: {
    title: "Comandos pré-definidos",
    subtitle:
      "Vinte utilitários CLI incluídos no ShellForge. Ative-os na interface desktop ou via aliases no $PROFILE.",
    usageLabel: "Exemplo de uso",
  },
  configuration: {
    title: "Configuração e CLI",
    subtitle: "Referência para arquivos de config, interpolação e uso da CLI.",
    configTitle: "Estrutura do config.json",
    configBody:
      "actionRunner contém ações personalizadas (arrays steps). ui.customActions guarda disponibilidade CLI e aliases. scheduler tem configurações opcionais.",
    interpolationTitle: "Interpolação",
    interpolationBody:
      "{{context.algum.caminho}} lê o contexto. {{env.NOME}} lê variáveis de ambiente. Campos string dos passos suportam interpolação salvo indicação contrária.",
    profilesTitle: "Perfis de navegador",
    profilesBody:
      "Perfis persistem em .shellforge-browser-profiles/<chave>/. Prefira perfis a tokens fixos para apps que rotacionam sessão.",
    cliTitle: "CLI action-runner",
    profileBlockTitle: "Bloco gerenciado no $PROFILE",
    profileBlockBody:
      "O ShellForge grava entre # === shellforge:BEGIN (managed - do not edit) === e # === shellforge:END ===. Conteúdo fora do bloco é preservado.",
    scheduledTitle: "Tarefas agendadas",
    scheduledBody:
      "Scripts em scheduled-tasks/ usam Register-ScheduledTask. Copie o exemplo, defina nome, horários, dias e comando. Execute elevado uma vez para registrar.",
    devTitle: "Desenvolver a partir do código",
    devBody:
      "Clone o repositório, execute npm install, depois npm run ui:dev para o app desktop ou npm run page:dev para este site.",
    cliRows: [
      { param: "--action / -a", required: "Sim", description: "Nome da ação em config.actionRunner" },
      { param: "--verbose / -v", required: "Não", description: "Exibir logs de execução" },
      { param: "--arg.<nome>=valor", required: "Não", description: "Passar argumento personalizado ao contexto da ação" },
    ],
  },
  categories: {
    core: "Core",
    shellLifecycle: "Ciclo do shell",
    unixParity: "Paridade Unix",
    windowsUtilities: "Utilitários Windows",
  },
  commands: {
    "action-runner": {
      description: "Executa fluxos de ação configurados na aba Ações personalizadas.",
      usage: "action-runner --action=minha-acao -v",
    },
    reinitialize: {
      description: "Recarrega o profile PowerShell na sessão atual do terminal.",
      usage: "reinitialize",
    },
    "reload-env": {
      description: "Atualiza PATH e variáveis de ambiente comuns na sessão atual.",
      usage: "reload-env",
    },
    profile: {
      description: "Abre o arquivo de profile PowerShell no editor preferido.",
      usage: "profile",
    },
    touch: {
      description: "Cria arquivo vazio ou atualiza data de modificação.",
      usage: "touch arquivo.txt",
    },
    which: {
      description: "Imprime o caminho resolvido de um executável.",
      usage: "which git",
    },
    mkdirp: {
      description: "Cria diretórios aninhados, incluindo pais necessários.",
      usage: "mkdirp caminho/para/dir",
    },
    open: {
      description: "Abre arquivos, pastas ou URLs com o app padrão.",
      usage: "open https://example.com",
    },
    pbcopy: {
      description: "Copia stdin ou conteúdo de arquivo para a área de transferência.",
      usage: "echo ola | pbcopy",
    },
    pbpaste: {
      description: "Imprime conteúdo da área de transferência no stdout.",
      usage: "pbpaste",
    },
    realpath: {
      description: "Resolve caminho para forma absoluta canônica.",
      usage: "realpath .\\caminho\\relativo",
    },
    uuid: {
      description: "Gera e imprime um novo UUID.",
      usage: "uuid",
    },
    head: {
      description: "Imprime as primeiras linhas de um arquivo.",
      usage: "head arquivo.txt -n 10",
    },
    tail: {
      description: "Imprime as últimas linhas de um arquivo.",
      usage: "tail arquivo.txt -n 20",
    },
    watch: {
      description:
        "Repete um comando em intervalo fixo. Comandos do profile ShellForge, como uuid, funcionam aqui.",
      usage: "watch uuid",
    },
    "git-root": {
      description: "Encontra o diretório raiz do repositório Git atual.",
      usage: "git-root --cd",
    },
    "kill-port": {
      description: "Encerra o processo escutando em uma porta TCP.",
      usage: "kill-port 3000 -f",
    },
    "as-admin": {
      description: "Executa comando com privilégios de administrador.",
      usage: "as-admin powershell",
    },
    hidden: {
      description:
        "Executa um comando em uma janela PowerShell oculta. A saída fica nessa janela, não no terminal atual.",
      usage: "hidden minha-tarefa.ps1",
    },
  },
};
