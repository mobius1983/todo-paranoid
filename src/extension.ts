import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

interface CommentInfo {
  file: string;
  line: number;
  text: string;
  word: string;
  isBlocking: boolean;
  category: 'blocking' | 'tracking';
}

// Variables globales para manejar la integración Git
let gitApiActive = false;
let originalCommitMethods: Map<any, any> = new Map();

async function checkFilesForForbiddenComments(
  resources: any[]
): Promise<CommentInfo[]> {
  const results: CommentInfo[] = [];
  const config = vscode.workspace.getConfiguration('todoParanoid');
  const blockingWords = config.get<string[]>('blockingWords', ['PARANOID']);

  for (const resource of resources) {
    const filePath = resource.fsPath || resource;
    if (fs.existsSync(filePath)) {
      const document = await vscode.workspace.openTextDocument(filePath);
      const comments = scanDocument(document);
      results.push(...comments.filter((c) => c.isBlocking));
    }
  }

  return results;
}

async function setupGitIntegration(): Promise<void> {
  try {
    if (gitApiActive) {
      console.log('🛡️ Todo Paranoid: Git API integration already active');
      return;
    }

    const gitExtension = vscode.extensions.getExtension('vscode.git');

    if (!gitExtension) {
      console.log(
        '🛡️ Todo Paranoid: Git extension not found - using hooks only'
      );
      setupGitHooks();
      return;
    }

    if (!gitExtension.isActive) {
      console.log('🛡️ Todo Paranoid: Waiting for Git extension to activate...');
      await gitExtension.activate();
    }

    const git = gitExtension.exports?.getAPI(1);
    if (!git) {
      console.log('🛡️ Todo Paranoid: Git API not available - using hooks only');
      setupGitHooks();
      return;
    }

    console.log('🛡️ Todo Paranoid: Setting up Git API integration...');

    // Interceptar COMMITS en todos los repositorios
    git.repositories.forEach((repo: any) => {
      // Guardar el método original
      if (!originalCommitMethods.has(repo)) {
        originalCommitMethods.set(repo, repo.commit);

        repo.commit = async function (message: string, opts?: any) {
          const config = vscode.workspace.getConfiguration('todoParanoid');
          if (
            !config.get('enabled', true) ||
            !config.get('blockGitOperations', true) ||
            !gitApiActive
          ) {
            return originalCommitMethods.get(repo).call(this, message, opts);
          }

          // Verificar archivos STAGED antes del commit
          const stagedFiles =
            repo.state.indexChanges?.map((change: any) => change.uri.fsPath) ||
            [];
          const blockingComments = await checkFilesForForbiddenComments(
            stagedFiles
          );

          if (blockingComments.length > 0) {
            const errorMessage = `🚫 Cannot commit! Found BLOCKING comments:\n${blockingComments
              .map(
                (f) => `📁 ${path.basename(f.file)} (Line ${f.line}): ${f.word}`
              )
              .join('\n')}\n\n💡 Remove these comments before committing!`;
            vscode.window.showErrorMessage(errorMessage);
            throw new Error('Blocking comments found - cannot commit');
          }

          return originalCommitMethods.get(repo).call(this, message, opts);
        };
      }
    });

    gitApiActive = true;
    console.log(
      '🛡️ Todo Paranoid: Git API integration activated successfully!'
    );

    // Setup Git hooks como respaldo
    setupGitHooks();
  } catch (error) {
    console.error('🛡️ Todo Paranoid: Git integration failed:', error);
    setupGitHooks();
  }
}

// Nueva función para desactivar Git API Integration
function disableGitIntegration(): void {
  if (!gitApiActive) {
    console.log('🛡️ Todo Paranoid: Git API integration already disabled');
    return;
  }

  try {
    const gitExtension = vscode.extensions.getExtension('vscode.git');
    if (gitExtension && gitExtension.isActive) {
      const git = gitExtension.exports?.getAPI(1);
      if (git) {
        // Restaurar métodos originales
        git.repositories.forEach((repo: any) => {
          const originalMethod = originalCommitMethods.get(repo);
          if (originalMethod) {
            repo.commit = originalMethod;
            originalCommitMethods.delete(repo);
          }
        });
      }
    }

    gitApiActive = false;
    console.log('🛡️ Todo Paranoid: Git API integration disabled successfully!');
  } catch (error) {
    console.error('🛡️ Todo Paranoid: Error disabling Git integration:', error);
  }
}

function setupGitHooks(): void {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) return;

  workspaceFolders.forEach((folder) => {
    const gitDir = path.join(folder.uri.fsPath, '.git');
    const hooksDir = path.join(gitDir, 'hooks');
    const preCommitHook = path.join(hooksDir, 'pre-commit');

    if (fs.existsSync(gitDir) && !fs.existsSync(preCommitHook)) {
      const hookContent = generatePreCommitHook();

      vscode.window
        .showInformationMessage(
          'Todo Paranoid can create a Git pre-commit hook to block commits with forbidden comments. Create it?',
          'Yes',
          'No'
        )
        .then((selection) => {
          if (selection === 'Yes') {
            fs.mkdirSync(hooksDir, { recursive: true });
            fs.writeFileSync(preCommitHook, hookContent, { mode: 0o755 });
            vscode.window.showInformationMessage(
              'Git pre-commit hook created successfully!'
            );
          }
        });
    }
  });
}

function generatePreCommitHook(): string {
  const config = vscode.workspace.getConfiguration('todoParanoid');
  const blockingWords = config.get<string[]>('blockingWords', ['PARANOID']);

  return `#!/bin/sh
# Todo Paranoid pre-commit hook
# Auto-generated by Todo Paranoid VS Code Extension

BLOCKING_WORDS="${blockingWords.join('|')}"

if git diff --cached --name-only | xargs grep -l -E "(//|#).*($BLOCKING_WORDS)" 2>/dev/null; then
    echo ""
    echo "🚫 Todo Paranoid: Cannot commit! BLOCKING comments found:"
    echo "================================================================"
    git diff --cached --name-only | xargs grep -n -E "(//|#).*($BLOCKING_WORDS)" 2>/dev/null | while read -r line; do
        echo "📁 $line"
    done
    echo "================================================================"
    echo ""
    echo "💡 You can save and test locally, but remove these comments before committing!"
    echo "🔥 Blocking words: ${blockingWords.join(', ')}"
    echo ""
    echo "✅ Note: TODO, FIXME, BUG comments are allowed and won't block commits."
    echo ""
    exit 1
fi

echo "✅ Todo Paranoid: No blocking comments found - commit allowed!"
exit 0
`;
}

export function activate(context: vscode.ExtensionContext) {
  console.log('🛡️ Todo Paranoid is now active!');

  initializeDecorations();
  vscode.commands.executeCommand('setContext', 'todoParanoid.enabled', true);

  const provider = new CodeGuardianProvider();
  globalProvider = provider;

  vscode.window.registerTreeDataProvider('todoParanoidView', provider);

  const treeView = vscode.window.createTreeView('todoParanoidView', {
    treeDataProvider: provider,
    showCollapseAll: true,
  });

  // Comando para escanear workspace
  const scanCommand = vscode.commands.registerCommand(
    'todoParanoid.scanWorkspace',
    () => {
      provider.refresh();
      vscode.window.showInformationMessage('Todo Paranoid: Workspace scanned!');
    }
  );

  // Comando para toggle - MEJORADO para manejar Git API
  const toggleCommand = vscode.commands.registerCommand(
    'todoParanoid.toggleExtension',
    () => {
      const config = vscode.workspace.getConfiguration('todoParanoid');
      const currentState = config.get('enabled', true);
      const newState = !currentState;

      config.update('enabled', newState, vscode.ConfigurationTarget.Global);

      // Controlar Git API Integration basado en el estado
      if (newState) {
        setupGitIntegration();
      } else {
        disableGitIntegration();
      }

      vscode.window.showInformationMessage(
        `Todo Paranoid ${newState ? 'enabled' : 'disabled'}`
      );
      provider.refresh();
    }
  );

  // Comando para setup Git Hook
  const setupGitHookCommand = vscode.commands.registerCommand(
    'todoParanoid.setupGitHook',
    () => {
      setupGitHooksManual();
    }
  );

  // Comando MEJORADO para remover protecciones
  const removeGitHookCommand = vscode.commands.registerCommand(
    'todoParanoid.removeGitHook',
    () => {
      removeAllProtections();
    }
  );

  // Nueva función que elimina TODAS las protecciones
  function removeAllProtections(): void {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage('No workspace folder found!');
      return;
    }

    vscode.window
      .showWarningMessage(
        'This will remove ALL Todo Paranoid protections (Git API + Hooks). Continue?',
        'Yes, Remove All',
        'Cancel'
      )
      .then((selection) => {
        if (selection !== 'Yes, Remove All') return;

        let hooksRemoved = 0;

        // 1. Desactivar Git API Integration
        disableGitIntegration();

        // 2. Remover Git Hooks físicos
        workspaceFolders.forEach((folder) => {
          const gitDir = path.join(folder.uri.fsPath, '.git');
          const preCommitHook = path.join(gitDir, 'hooks', 'pre-commit');

          if (fs.existsSync(preCommitHook)) {
            try {
              const content = fs.readFileSync(preCommitHook, 'utf8');
              if (content.includes('Todo Paranoid pre-commit hook')) {
                fs.unlinkSync(preCommitHook);
                hooksRemoved++;
                console.log(`🗑️ Git hook removed from ${folder.name}`);
              } else {
                vscode.window.showWarningMessage(
                  `Pre-commit hook in ${folder.name} was not created by Todo Paranoid - skipping removal`
                );
              }
            } catch (error) {
              vscode.window.showErrorMessage(
                `Failed to remove git hook from ${folder.name}: ${error}`
              );
            }
          }
        });

        // 3. Mostrar resultado
        const messages = [];
        messages.push('🔓 Git API integration disabled');
        if (hooksRemoved > 0) {
          messages.push(
            `🗑️ Git hooks removed from ${hooksRemoved} repository(ies)`
          );
        } else {
          messages.push('📝 No Todo Paranoid git hooks found to remove');
        }

        vscode.window.showInformationMessage(
          `✅ All protections removed!\n${messages.join('\n')}`
        );
      });
  }

  function setupGitHooksManual(): void {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage('No workspace folder found!');
      return;
    }

    let hooksCreated = 0;

    workspaceFolders.forEach((folder) => {
      const gitDir = path.join(folder.uri.fsPath, '.git');
      const hooksDir = path.join(gitDir, 'hooks');
      const preCommitHook = path.join(hooksDir, 'pre-commit');

      if (!fs.existsSync(gitDir)) {
        vscode.window.showWarningMessage(
          `No git repository found in ${folder.name}`
        );
        return;
      }

      if (fs.existsSync(preCommitHook)) {
        vscode.window.showWarningMessage(
          `Pre-commit hook already exists in ${folder.name}`
        );
        return;
      }

      try {
        fs.mkdirSync(hooksDir, { recursive: true });
        const hookContent = generatePreCommitHook();
        fs.writeFileSync(preCommitHook, hookContent, { mode: 0o755 });
        hooksCreated++;
        console.log(`✅ Git hook created in ${folder.name}`);
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to create git hook in ${folder.name}: ${error}`
        );
      }
    });

    if (hooksCreated > 0) {
      vscode.window.showInformationMessage(
        `✅ Git pre-commit hook created successfully in ${hooksCreated} repository(ies)!`
      );
    }
  }

  // Rest of the listeners remain the same...
  const saveListener = vscode.workspace.onWillSaveTextDocument((event) => {
    const config = vscode.workspace.getConfiguration('todoParanoid');
    if (!config.get('enabled', true)) {
      return;
    }

    const document = event.document;
    const allComments = scanDocument(document);
    const blockingComments = allComments.filter((c) => c.isBlocking);

    if (blockingComments.length > 0 && config.get('showNotifications', true)) {
      vscode.window
        .showWarningMessage(
          `File saved with ${blockingComments.length} BLOCKING comment(s). Remember: you won't be able to commit this!`,
          'Show Details'
        )
        .then((selection) => {
          if (selection === 'Show Details') {
            provider.refresh();
          }
        });
    }
  });

  // Activar Git integration al inicio
  setupGitIntegration();

  // Listener mejorado para cambios de texto
  const changeListener = vscode.workspace.onDidChangeTextDocument((event) => {
    const config = vscode.workspace.getConfiguration('todoParanoid');
    if (!config.get('enabled', true)) return;

    const document = event.document;

    // Escanear el documento actualizado
    const allComments = scanDocument(document);

    // SIEMPRE actualizar las decoraciones (incluso si no hay comentarios)
    // Esto asegura que se limpien las decoraciones obsoletas
    highlightComments(document, allComments);

    // Mostrar notificaciones solo si hay comentarios Y las notificaciones están habilitadas
    if (allComments.length > 0 && config.get('showNotifications', true)) {
      // Las decoraciones ya se aplicaron arriba
    }

    // Actualizar panel con throttle
    throttledRefresh();
  });

  const saveDocumentListener = vscode.workspace.onDidSaveTextDocument(
    (document) => {
      console.log('🛡️ File saved, refreshing panel...');
      provider.refresh();
    }
  );

  const openDocumentListener = vscode.workspace.onDidOpenTextDocument(
    (document) => {
      provider.refresh();
    }
  );

  const fileSystemWatcher = vscode.workspace.createFileSystemWatcher(
    '**/*.{js,ts,jsx,tsx,py,java,cpp,c,cs,php,rb,go}'
  );

  fileSystemWatcher.onDidCreate(() => {
    console.log('🛡️ File created, refreshing panel...');
    provider.refresh();
  });

  fileSystemWatcher.onDidDelete(() => {
    console.log('🛡️ File deleted, refreshing panel...');
    provider.refresh();
  });

  fileSystemWatcher.onDidChange(() => {
    console.log('🛡️ File changed, refreshing panel...');
    provider.refresh();
  });

  // Listener mejorado para cuando cambias de archivo
  const activeEditorListener = vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor) {
        // Limpiar decoraciones del editor anterior
        clearAllDecorations();

        // Aplicar decoraciones al nuevo archivo
        const allComments = scanDocument(editor.document);
        if (allComments.length > 0) {
          highlightComments(editor.document, allComments);
        }

        // Actualizar panel
        if (globalProvider) {
          globalProvider.refresh();
        }
      }
    }
  );

  // Función adicional para forzar limpieza (puedes agregar esto como comando)
  function forceCleanDecorations() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    // Limpiar todas las decoraciones
    clearAllDecorations();

    // Re-escanear y aplicar decoraciones actuales
    const allComments = scanDocument(editor.document);
    highlightComments(editor.document, allComments);

    vscode.window.showInformationMessage('🧹 Decorations refreshed!');
  }

  // OPCIONAL: Agregar comando para limpiar decoraciones manualmente
  const cleanDecorationsCommand = vscode.commands.registerCommand(
    'todoParanoid.cleanDecorations',
    () => {
      forceCleanDecorations();
    }
  );

  context.subscriptions.push(
    scanCommand,
    toggleCommand,
    setupGitHookCommand,
    removeGitHookCommand,
    saveListener,
    changeListener,
    saveDocumentListener,
    openDocumentListener,
    fileSystemWatcher,
    activeEditorListener,
    treeView
  );

  provider.refresh();
  console.log('🛡️ Todo Paranoid: All components registered successfully');
}

function scanDocumentOld(document: vscode.TextDocument): CommentInfo[] {
  const config = vscode.workspace.getConfiguration('todoParanoid');
  const blockingWords = config.get<string[]>('blockingWords', ['PARANOID']);
  const trackingWords = config.get<string[]>('trackingWords', [
    'TODO',
    'FIXME',
    'BUG',
  ]);
  const fileExtensions = config.get<string[]>('fileExtensions', ['.js', '.ts']);

  const fileExt = path.extname(document.fileName);
  if (!fileExtensions.includes(fileExt)) {
    return [];
  }

  const results: CommentInfo[] = [];
  const text = document.getText();
  const lines = text.split('\n');

  lines.forEach((line, index) => {
    blockingWords.forEach((word) => {
      const commentRegex = new RegExp(`(//|#).*${word}`, 'i');
      if (commentRegex.test(line)) {
        results.push({
          file: document.fileName,
          line: index + 1,
          text: line.trim(),
          word: word,
          isBlocking: true,
          category: 'blocking',
        });
      }
    });

    trackingWords.forEach((word) => {
      const commentRegex = new RegExp(`(//|#).*${word}`, 'i');
      if (commentRegex.test(line)) {
        results.push({
          file: document.fileName,
          line: index + 1,
          text: line.trim(),
          word: word,
          isBlocking: false,
          category: 'tracking',
        });
      }
    });
  });

  return results;
}

function scanDocument(document: vscode.TextDocument): CommentInfo[] {
  const config = vscode.workspace.getConfiguration('todoParanoid');
  const blockingWords = config.get<string[]>('blockingWords', ['PARANOID']);
  const trackingWords = config.get<string[]>('trackingWords', [
    'TODO',
    'FIXME',
    'BUG',
  ]);
  const fileExtensions = config.get<string[]>('fileExtensions', ['.js', '.ts']);

  const fileExt = path.extname(document.fileName);
  if (!fileExtensions.includes(fileExt)) {
    return [];
  }

  const results: CommentInfo[] = [];
  const text = document.getText();
  const lines = text.split('\n');

  lines.forEach((line, index) => {
    // Verificar palabras bloqueantes (críticas)
    blockingWords.forEach((word) => {
      // Regex más estricta: requiere que la palabra esté inmediatamente después del comentario
      // y seguida por un separador (espacio, :, etc.) o fin de línea
      const commentRegex = new RegExp(`^\\s*(//|#)\\s*${word}\\b`, 'i');
      if (commentRegex.test(line)) {
        results.push({
          file: document.fileName,
          line: index + 1,
          text: line.trim(),
          word: word,
          isBlocking: true,
          category: 'blocking',
        });
      }
    });

    // Verificar palabras de seguimiento (organizacionales)
    trackingWords.forEach((word) => {
      // Misma regex estricta para palabras de tracking
      const commentRegex = new RegExp(`^\\s*(//|#)\\s*${word}\\b`, 'i');
      if (commentRegex.test(line)) {
        results.push({
          file: document.fileName,
          line: index + 1,
          text: line.trim(),
          word: word,
          isBlocking: false,
          category: 'tracking',
        });
      }
    });
  });

  return results;
}

let blockingDecorationType: vscode.TextEditorDecorationType;
let trackingDecorationType: vscode.TextEditorDecorationType;
let globalProvider: CodeGuardianProvider;

let refreshTimeout: NodeJS.Timeout | null = null;
function throttledRefresh() {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }
  refreshTimeout = setTimeout(() => {
    if (globalProvider) {
      globalProvider.refresh();
    }
  }, 1000);
}

function initializeDecorations() {
  blockingDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    border: '2px solid red',
    borderRadius: '2px',
    overviewRulerColor: 'red',
    overviewRulerLane: vscode.OverviewRulerLane.Right,
  });

  trackingDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 255, 0, 0.2)',
    border: '1px solid orange',
    borderRadius: '2px',
    overviewRulerColor: 'orange',
    overviewRulerLane: vscode.OverviewRulerLane.Right,
  });
}

function highlightComments(
  document: vscode.TextDocument,
  comments: CommentInfo[]
) {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document !== document) return;

  if (!blockingDecorationType || !trackingDecorationType) {
    initializeDecorations();
  }

  // Separar comentarios por tipo
  const blockingComments = comments.filter((c) => c.isBlocking);
  const trackingComments = comments.filter((c) => !c.isBlocking);

  // Crear ranges para comentarios bloqueantes
  const blockingRanges = blockingComments.map((comment) => {
    const line = document.lineAt(comment.line - 1);
    return new vscode.Range(line.range.start, line.range.end);
  });

  // Crear ranges para comentarios de seguimiento
  const trackingRanges = trackingComments.map((comment) => {
    const line = document.lineAt(comment.line - 1);
    return new vscode.Range(line.range.start, line.range.end);
  });

  // CLAVE: Aplicar decoraciones incluso si los arrays están vacíos
  // Esto limpia las decoraciones anteriores cuando no hay comentarios
  editor.setDecorations(blockingDecorationType, blockingRanges);
  editor.setDecorations(trackingDecorationType, trackingRanges);

  console.log(
    `🎨 Decorations updated: ${blockingRanges.length} blocking, ${trackingRanges.length} tracking`
  );
}

// Función mejorada para limpiar decoraciones específicamente
function clearAllDecorations(document?: vscode.TextDocument) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  // Si se especifica un documento, solo limpiar ese documento
  if (document && editor.document !== document) return;

  if (blockingDecorationType) {
    editor.setDecorations(blockingDecorationType, []);
  }
  if (trackingDecorationType) {
    editor.setDecorations(trackingDecorationType, []);
  }

  console.log('🧹 All decorations cleared');
}

class CodeGuardianProvider implements vscode.TreeDataProvider<CommentInfo> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    CommentInfo | undefined | null | void
  > = new vscode.EventEmitter<CommentInfo | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    CommentInfo | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private allComments: CommentInfo[] = [];

  refresh(): void {
    this.scanWorkspace();
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: CommentInfo): vscode.TreeItem {
    if (element.word === 'HEADER') {
      const item = new vscode.TreeItem(
        element.text,
        vscode.TreeItemCollapsibleState.None
      );
      item.iconPath = element.isBlocking
        ? new vscode.ThemeIcon(
            'error',
            new vscode.ThemeColor('errorForeground')
          )
        : new vscode.ThemeIcon('info', new vscode.ThemeColor('foreground'));
      item.contextValue = 'header';
      return item;
    }

    const item = new vscode.TreeItem(
      `${path.basename(element.file)} (Line ${element.line})`,
      vscode.TreeItemCollapsibleState.None
    );

    item.description = element.text;
    item.tooltip = `${element.file}:${element.line}\n${element.text}\nWord: ${element.word}\nType: ${element.category}`;

    if (element.isBlocking) {
      item.iconPath = new vscode.ThemeIcon(
        'circle-filled',
        new vscode.ThemeColor('errorForeground')
      );
      item.contextValue = 'blockingComment';
    } else {
      item.iconPath = new vscode.ThemeIcon(
        'circle-outline',
        new vscode.ThemeColor('warningForeground')
      );
      item.contextValue = 'trackingComment';
    }

    item.command = {
      command: 'vscode.open',
      title: 'Open File',
      arguments: [
        vscode.Uri.file(element.file),
        {
          selection: new vscode.Range(element.line - 1, 0, element.line - 1, 0),
        },
      ],
    };

    return item;
  }

  getChildren(element?: CommentInfo): Thenable<CommentInfo[]> {
    if (!element) {
      const blocking = this.allComments.filter((c) => c.isBlocking);
      const tracking = this.allComments.filter((c) => !c.isBlocking);

      if (blocking.length === 0 && tracking.length === 0) {
        return Promise.resolve([]);
      }

      const result: CommentInfo[] = [];

      if (blocking.length > 0) {
        result.push({
          file: '',
          line: 0,
          text: `🚫 BLOCKING (${blocking.length}) - Will prevent commits`,
          word: 'HEADER',
          isBlocking: true,
          category: 'blocking',
        } as CommentInfo);
        result.push(...blocking);
      }

      if (tracking.length > 0) {
        result.push({
          file: '',
          line: 0,
          text: `📝 TRACKING (${tracking.length}) - For organization`,
          word: 'HEADER',
          isBlocking: false,
          category: 'tracking',
        } as CommentInfo);
        result.push(...tracking);
      }

      return Promise.resolve(result);
    }
    return Promise.resolve([]);
  }

  private scanWorkspace(): void {
    this.allComments = [];

    if (!vscode.workspace.workspaceFolders) {
      return;
    }

    const config = vscode.workspace.getConfiguration('todoParanoid');
    const blockingWords = config.get<string[]>('blockingWords', ['PARANOID']);
    const trackingWords = config.get<string[]>('trackingWords', [
      'TODO',
      'FIXME',
    ]);
    const fileExtensions = config.get<string[]>('fileExtensions', [
      '.js',
      '.ts',
    ]);

    vscode.workspace.workspaceFolders.forEach((folder) => {
      this.scanDirectory(
        folder.uri.fsPath,
        blockingWords,
        trackingWords,
        fileExtensions
      );
    });
  }

  private scanDirectory(
    dirPath: string,
    blockingWords: string[],
    trackingWords: string[],
    fileExtensions: string[]
  ): void {
    try {
      const files = fs.readdirSync(dirPath);

      files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (
          stat.isDirectory() &&
          !file.startsWith('.') &&
          file !== 'node_modules'
        ) {
          this.scanDirectory(
            filePath,
            blockingWords,
            trackingWords,
            fileExtensions
          );
        } else if (
          stat.isFile() &&
          fileExtensions.includes(path.extname(file))
        ) {
          this.scanFile(filePath, blockingWords, trackingWords);
        }
      });
    } catch (error) {
      console.error('Error scanning directory:', error);
    }
  }

  private scanFileOld(
    filePath: string,
    blockingWords: string[],
    trackingWords: string[]
  ): void {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        blockingWords.forEach((word) => {
          const commentRegex = new RegExp(`(//|#).*${word}`, 'i');
          if (commentRegex.test(line)) {
            this.allComments.push({
              file: filePath,
              line: index + 1,
              text: line.trim(),
              word: word,
              isBlocking: true,
              category: 'blocking',
            });
          }
        });

        trackingWords.forEach((word) => {
          const commentRegex = new RegExp(`(//|#).*${word}`, 'i');
          if (commentRegex.test(line)) {
            this.allComments.push({
              file: filePath,
              line: index + 1,
              text: line.trim(),
              word: word,
              isBlocking: false,
              category: 'tracking',
            });
          }
        });
      });
    } catch (error) {
      console.error('Error reading file:', filePath, error);
    }
  }

  private scanFile(
    filePath: string,
    blockingWords: string[],
    trackingWords: string[]
  ): void {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // Buscar palabras bloqueantes con regex estricta
        blockingWords.forEach((word) => {
          // Regex estricta: inicio de línea + espacios opcionales + comentario + espacios opcionales + palabra + boundary
          const commentRegex = new RegExp(`^\\s*(//|#)\\s*${word}\\b`, 'i');
          if (commentRegex.test(line)) {
            this.allComments.push({
              file: filePath,
              line: index + 1,
              text: line.trim(),
              word: word,
              isBlocking: true,
              category: 'blocking',
            });
          }
        });

        // Buscar palabras de seguimiento con regex estricta
        trackingWords.forEach((word) => {
          const commentRegex = new RegExp(`^\\s*(//|#)\\s*${word}\\b`, 'i');
          if (commentRegex.test(line)) {
            this.allComments.push({
              file: filePath,
              line: index + 1,
              text: line.trim(),
              word: word,
              isBlocking: false,
              category: 'tracking',
            });
          }
        });
      });
    } catch (error) {
      console.error('Error reading file:', filePath, error);
    }
  }
}

// Mejorar la función deactivate() para limpiar decoraciones al cerrar
export function deactivate() {
  console.log('🔄 Deactivating Todo Paranoid...');

  // Limpiar decoraciones antes de desactivar
  clearAllDecorations();

  // Forzar desactivación de Git API
  disableGitIntegration();

  // Limpiar timeout
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
    refreshTimeout = null;
  }

  // Limpiar y disponer decoraciones
  if (blockingDecorationType) {
    blockingDecorationType.dispose();
    blockingDecorationType = null;
  }
  if (trackingDecorationType) {
    trackingDecorationType.dispose();
    trackingDecorationType = null;
  }

  console.log('🛡️ Todo Paranoid deactivated completely');
}
