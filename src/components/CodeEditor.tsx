import Editor, { OnMount, BeforeMount } from '@monaco-editor/react';
import { useRef, useCallback } from 'react';
import * as monaco from 'monaco-editor';

// Import snippets
import cSnippets from '@/lib/snippets/c.json';
import cppSnippets from '@/lib/snippets/cpp.json';
import pythonSnippets from '@/lib/snippets/python.json';
import javascriptSnippets from '@/lib/snippets/javascript.json';
import javaSnippets from '@/lib/snippets/java.json';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height?: string;
  onRun?: () => void;
}

interface SnippetDefinition {
  prefix: string;
  body: string[];
  description: string;
}

const languageMap: Record<string, string> = {
  python: 'python',
  javascript: 'javascript',
  c: 'c',
  cpp: 'cpp',
  java: 'java',
  go: 'go',
  rust: 'rust',
};

const snippetsMap: Record<string, Record<string, SnippetDefinition>> = {
  c: cSnippets as Record<string, SnippetDefinition>,
  cpp: cppSnippets as Record<string, SnippetDefinition>,
  python: pythonSnippets as Record<string, SnippetDefinition>,
  javascript: javascriptSnippets as Record<string, SnippetDefinition>,
  java: javaSnippets as Record<string, SnippetDefinition>,
};

function registerSnippets(
  monacoInstance: typeof monaco,
  language: string,
  snippets: Record<string, SnippetDefinition>
) {
  const suggestions: monaco.languages.CompletionItem[] = Object.entries(snippets).map(
    ([name, snippet]) => ({
      label: snippet.prefix,
      kind: monacoInstance.languages.CompletionItemKind.Snippet,
      insertText: snippet.body.join('\n'),
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: snippet.description,
      detail: name,
      range: undefined as unknown as monaco.IRange,
    })
  );

  return monacoInstance.languages.registerCompletionItemProvider(language, {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range: monaco.IRange = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      
      return {
        suggestions: suggestions.map(s => ({ ...s, range })),
      };
    },
  });
}

export function CodeEditor({ value, onChange, language, height = '500px', onRun }: CodeEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const disposablesRef = useRef<monaco.IDisposable[]>([]);

  const handleBeforeMount: BeforeMount = useCallback((monacoInstance) => {
    // Clean up previous disposables
    disposablesRef.current.forEach(d => d.dispose());
    disposablesRef.current = [];

    // Register snippets for all languages
    Object.entries(snippetsMap).forEach(([lang, snippets]) => {
      const monacoLang = languageMap[lang] || lang;
      const disposable = registerSnippets(monacoInstance, monacoLang, snippets);
      disposablesRef.current.push(disposable);
    });
  }, []);

  const handleEditorMount: OnMount = useCallback((editor, monacoInstance) => {
    editorRef.current = editor;
    editor.focus();

    // Add keyboard shortcut for running code
    if (onRun) {
      editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter, () => {
        onRun();
      });
    }
  }, [onRun]);

  return (
    <div className="border-4 border-border overflow-hidden">
      <Editor
        height={height}
        language={languageMap[language] || 'plaintext'}
        value={value}
        onChange={(val) => onChange(val || '')}
        beforeMount={handleBeforeMount}
        onMount={handleEditorMount}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily: "'Space Mono', 'Fira Code', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          renderLineHighlight: 'line',
          automaticLayout: true,
          tabSize: 4,
          insertSpaces: true,
          wordWrap: 'on',
          padding: { top: 16, bottom: 16 },
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
          },
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          snippetSuggestions: 'top',
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  );
}
