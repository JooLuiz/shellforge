import type { AppTranslationDictionary } from "./types";

export const ptBrDictionary: AppTranslationDictionary = {
  menu: {
    file: "Arquivo",
    newCustomAction: "Nova Ação Personalizada",
    newScheduledTask: "Nova Tarefa Agendada",
    quit: "Sair",
    view: "Exibir",
    language: "Idioma",
    languageEnglish: "English",
    languagePortuguese: "Português (Brasil)",
    help: "Ajuda",
    website: "Site ShellForge",
    github: "Repositório GitHub",
  },
  app: {
    brandTitle: "ShellForge",
    loading: "Carregando gerenciador desktop...",
    failedToLoadConfig: "Falha ao carregar a configuração.",
    saving: "Salvando...",
    searchPredefined: "Buscar comandos predefinidos...",
    searchCustomActions: "Buscar ações personalizadas...",
    searchScheduledTasks: "Buscar tarefas agendadas...",
    newAction: "Nova Ação",
    newSchedule: "Novo Agendamento",
    bridgeUnavailable:
      "Bridge desktop indisponível (window.api). Reinicie o app após reconstruir a UI.",
    unknownLoadError: "Erro de carregamento desconhecido",
    unknownSaveError: "Erro de salvamento desconhecido",
    unknownScheduledTasksLoadError: "Erro de carregamento de tarefas agendadas desconhecido",
    regenerateProfileFailed: "Não foi possível regenerar o bloco do profile.",
  },
  tabs: {
    predefined: "Comandos Predefinidos",
    custom: "Ações Personalizadas",
    scheduled: "Tarefas Agendadas",
    predefinedTitle: "Comandos Predefinidos",
    customTitle: "Ações Personalizadas",
    scheduledTitle: "Tarefas Agendadas",
    predefinedDescription:
      "Lista de comandos predefinidos para melhorar a experiência ao usar o Windows no CLI.",
    customDescription: "Lista de ações personalizadas configuráveis.",
    scheduledDescription: "Lista de tarefas a serem executadas em momentos predefinidos.",
  },
  profileHealth: {
    title: "O profile do PowerShell precisa de atenção",
    profilePathLabel: "Caminho do profile:",
    regenerateProfileBlock: "Regenerar bloco do profile",
    openProfileFolder: "Abrir pasta do profile",
    issues: {
      profilePathUnresolved: {
        message: "Não foi possível resolver o caminho do profile do PowerShell.",
        remediation:
          "Reinicie o ShellForge. Se o problema persistir, abra o PowerShell manualmente e confirme que $PROFILE.CurrentUserCurrentHost resolve para um caminho válido.",
      },
      profileDirectoryNotWritable: {
        message: "O ShellForge não pode escrever na pasta do profile.",
        remediation:
          "Corrija permissões da pasta, remova somente leitura ou resolva restrições de OneDrive/sincronização na pasta Documents.",
      },
      profileFileNotWritable: {
        message: "O ShellForge não pode atualizar o arquivo de profile do PowerShell.",
        remediation:
          "Remova o atributo somente leitura do arquivo de profile ou ajuste permissões para sua conta poder editá-lo.",
      },
      executionPolicyRestricted: {
        message:
          "A política de execução do PowerShell (CurrentUser) está restrita e pode bloquear scripts do profile.",
        remediation:
          "Execute no PowerShell: Set-ExecutionPolicy -Scope CurrentUser RemoteSigned. Isso permite carregar scripts locais do profile (incluindo aliases do ShellForge).",
      },
      managedBlockMissing: {
        message: "O bloco gerenciado do ShellForge está ausente no seu profile do PowerShell.",
        remediation:
          "Salve qualquer alteração em Comandos Predefinidos ou Ações Personalizadas para regenerar o bloco, ou clique em Regenerar bloco do profile abaixo.",
      },
    },
  },
  footer: {
    copyright: "© 2024–2026 ShellForge. Todos os direitos reservados. Desenvolvido por Joao Luiz de Castro",
    themeLight: "Claro",
    themeDark: "Escuro",
    themeToggleLabel: "Alternar tema",
  },
  customActions: {
    noSearchResults: "Nenhuma ação personalizada corresponde à busca atual.",
  },
  scheduledTasks: {
    noSearchResults: "Nenhuma tarefa agendada corresponde à busca atual.",
    privileges: {
      title: "Privilégios de administrador necessários",
      message:
        "O ShellForge não pode ativar ou desativar tarefas agendadas do Windows enquanto estiver em execução sem privilégios de administrador.",
      remediation:
        "Feche o ShellForge, clique com o botão direito no atalho ou executável do app e selecione Executar como administrador.",
      toggleError:
        "Privilégios de administrador são necessários para ativar ou desativar tarefas agendadas do Windows. Reinicie o ShellForge como administrador.",
    },
    invalidActionName:
      "O nome da tarefa deve usar apenas letras ASCII, números, espaços, hífens e underscores.",
    toggleFailed: "Falha ao atualizar a tarefa agendada. Verifique o nome da tarefa e tente novamente.",
    toggleRegistrationFailed:
      "A tarefa agendada do Windows não foi registrada. Renomeie a tarefa para usar apenas caracteres ASCII e tente novamente.",
  },
  deleteConfirm: {
    cancel: "Cancelar",
    confirm: "Excluir",
    deleting: "Excluindo...",
    customAction: {
      title: "Excluir ação {itemName}?",
      description:
        "Isso remove permanentemente a ação da sua configuração. Esta ação não pode ser desfeita.",
    },
    scheduledTask: {
      title: "Excluir tarefa agendada {itemName}?",
      description:
        "Isso remove permanentemente o arquivo da tarefa agendada. Esta ação não pode ser desfeita.",
    },
  },
};
