import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { CodeEditor } from '@/components/CodeEditor';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Play, Trash2 } from 'lucide-react';
import { NavBar } from '@/components/NavBar';
import { runCode } from '@/lib/supabase-api';

const defaultCode: Record<string, string> = {
  c: `#include <stdio.h>

int main() {
    printf("Hello, Cultivator!\\n");
    return 0;
}`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    cout << "Hello, Cultivator!" << endl;
    
    return 0;
}`,
  python: `# Your code here
def main():
    print("Hello, Cultivator!")

if __name__ == "__main__":
    main()`,
  javascript: `// Your code here
function main() {
    console.log("Hello, Cultivator!");
}

main();`,
  java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello, Cultivator!");
    }
}`,
};

const languageLabels: Record<string, string> = {
  c: 'C',
  cpp: 'C++',
  python: 'Python',
  javascript: 'JavaScript',
  java: 'Java',
};

export default function Playground() {
  const { profile, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(defaultCode.cpp);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Load saved code from localStorage
    const savedCode = localStorage.getItem(`playground_code_${language}`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(defaultCode[language] || '');
    }
  }, [language]);

  useEffect(() => {
    // Save code to localStorage
    localStorage.setItem(`playground_code_${language}`, code);
  }, [code, language]);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('');

    toast({
      title: 'Running code...',
      description: 'Your code is being executed.',
    });

    try {
      const result = await runCode(code, language, input);
      setOutput(result.output);
      
      toast({
        title: 'Execution Complete',
        description: 'Check the output panel for results.',
      });
    } catch (error) {
      console.error('Error running code:', error);
      setOutput('[Error]\nFailed to execute code. Please try again.');
      
      toast({
        title: 'Execution Failed',
        description: 'There was an error running your code.',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleClear = () => {
    setCode(defaultCode[language] || '');
    setInput('');
    setOutput('');
    localStorage.removeItem(`playground_code_${language}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-mono text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <div className="dark bg-background text-foreground">
        <NavBar />

        <main className="container mx-auto px-6 py-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="font-mono text-3xl font-bold uppercase tracking-wider">
                Code Playground
              </h1>
              <p className="font-mono text-muted-foreground text-sm mt-1">
                Practice coding with snippets • Press Ctrl+Enter or F9 to run
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[150px] font-mono border-4 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(languageLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={handleClear}
                className="font-mono uppercase border-4 gap-2"
              >
                <Trash2 size={16} />
                Clear
              </Button>
              <Button
                onClick={handleRun}
                disabled={isRunning}
                className="font-mono uppercase tracking-wider border-4 border-border bg-jade text-jade-foreground hover:bg-jade/90 gap-2"
              >
                <Play size={16} />
                {isRunning ? 'Running...' : 'Run Code'}
              </Button>
            </div>
          </div>

          {/* Editor Layout */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Code Editor - 2 columns */}
            <div className="lg:col-span-2 space-y-2">
              <div className="font-mono text-sm text-muted-foreground uppercase tracking-wider">
                Code Editor — Type snippet prefix and press Tab
              </div>
              <CodeEditor
                value={code}
                onChange={setCode}
                language={language}
                height="600px"
                onRun={handleRun}
              />
            </div>

            {/* Input/Output Panel */}
            <div className="space-y-4">
              {/* Input */}
              <div className="space-y-2">
                <div className="font-mono text-sm text-muted-foreground uppercase tracking-wider">
                  Input (stdin)
                </div>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter input here..."
                  className="h-[180px] font-mono text-sm border-4 border-border bg-background resize-none"
                />
              </div>

              {/* Output */}
              <div className="space-y-2">
                <div className="font-mono text-sm text-muted-foreground uppercase tracking-wider">
                  Output (stdout)
                </div>
                <div className="h-[380px] font-mono text-sm border-4 border-border bg-card p-4 overflow-auto">
                  {isRunning ? (
                    <div className="text-accent animate-pulse">Compiling and running...</div>
                  ) : output ? (
                    <pre className="whitespace-pre-wrap">{output}</pre>
                  ) : (
                    <div className="text-muted-foreground">Output will appear here...</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Snippet Help */}
          <div className="mt-8 border-4 border-border bg-card p-6">
            <h2 className="font-mono text-lg font-bold uppercase tracking-wider mb-4">
              Available Snippets for {languageLabels[language]}
            </h2>
            <div className="grid md:grid-cols-4 gap-4 font-mono text-sm">
              {language === 'cpp' && (
                <>
                  <div><span className="text-accent">cp</span> — Competitive template</div>
                  <div><span className="text-accent">main</span> — Main function</div>
                  <div><span className="text-accent">for</span> — For loop</div>
                  <div><span className="text-accent">forr</span> — Range for loop</div>
                  <div><span className="text-accent">vec</span> — Vector</div>
                  <div><span className="text-accent">sort</span> — Sort container</div>
                  <div><span className="text-accent">bsearch</span> — Binary search</div>
                  <div><span className="text-accent">pq</span> — Priority queue</div>
                </>
              )}
              {language === 'c' && (
                <>
                  <div><span className="text-accent">main</span> — Main function</div>
                  <div><span className="text-accent">for</span> — For loop</div>
                  <div><span className="text-accent">while</span> — While loop</div>
                  <div><span className="text-accent">if</span> — If statement</div>
                  <div><span className="text-accent">switch</span> — Switch case</div>
                  <div><span className="text-accent">func</span> — Function</div>
                </>
              )}
              {language === 'python' && (
                <>
                  <div><span className="text-accent">main</span> — Main block</div>
                  <div><span className="text-accent">def</span> — Function</div>
                  <div><span className="text-accent">for</span> — For loop</div>
                  <div><span className="text-accent">listcomp</span> — List comprehension</div>
                  <div><span className="text-accent">try</span> — Try-except</div>
                  <div><span className="text-accent">inputlist</span> — Read list</div>
                  <div><span className="text-accent">counter</span> — Counter</div>
                  <div><span className="text-accent">deque</span> — Deque</div>
                </>
              )}
              {language === 'javascript' && (
                <>
                  <div><span className="text-accent">func</span> — Function</div>
                  <div><span className="text-accent">arrow</span> — Arrow function</div>
                  <div><span className="text-accent">for</span> — For loop</div>
                  <div><span className="text-accent">forof</span> — For...of loop</div>
                  <div><span className="text-accent">map</span> — Array map</div>
                  <div><span className="text-accent">filter</span> — Array filter</div>
                  <div><span className="text-accent">async</span> — Async function</div>
                  <div><span className="text-accent">try</span> — Try-catch</div>
                </>
              )}
              {language === 'java' && (
                <>
                  <div><span className="text-accent">main</span> — Main class</div>
                  <div><span className="text-accent">cp</span> — Competitive template</div>
                  <div><span className="text-accent">for</span> — For loop</div>
                  <div><span className="text-accent">alist</span> — ArrayList</div>
                  <div><span className="text-accent">hmap</span> — HashMap</div>
                  <div><span className="text-accent">pq</span> — Priority queue</div>
                  <div><span className="text-accent">readarr</span> — Read array</div>
                  <div><span className="text-accent">bsearch</span> — Binary search</div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
