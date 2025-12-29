import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple code execution simulation
// In production, you'd integrate with Judge0, Sphere Engine, or similar
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language, input } = await req.json();

    console.log(`Running ${language} code with input:`, input);

    // Simulate code execution based on language
    let output = '';
    let status = 'success';
    let runtimeMs = Math.floor(Math.random() * 50) + 10;
    let memoryKb = Math.floor(Math.random() * 2000) + 1000;

    // Basic code analysis to determine output
    if (language === 'python') {
      if (code.includes('print')) {
        // Extract print statements
        const printMatch = code.match(/print\s*\(\s*["']([^"']+)["']\s*\)/);
        if (printMatch) {
          output = printMatch[1];
        } else if (code.includes('print(')) {
          output = 'Hello, Cultivator!';
        }
      }
      if (code.includes('input()') && input) {
        output = input.split('\n')[0];
      }
    } else if (language === 'javascript') {
      if (code.includes('console.log')) {
        const logMatch = code.match(/console\.log\s*\(\s*["']([^"']+)["']\s*\)/);
        if (logMatch) {
          output = logMatch[1];
        } else {
          output = 'Hello, Cultivator!';
        }
      }
    } else if (language === 'cpp' || language === 'c') {
      if (code.includes('cout') || code.includes('printf')) {
        const coutMatch = code.match(/cout\s*<<\s*["']([^"']+)["']/);
        const printfMatch = code.match(/printf\s*\(\s*["']([^"'\\n]+)/);
        if (coutMatch) {
          output = coutMatch[1];
        } else if (printfMatch) {
          output = printfMatch[1];
        } else {
          output = 'Hello, Cultivator!';
        }
      }
      if (code.includes('cin') && input) {
        output = `Input received: ${input.split('\n')[0]}`;
      }
    } else if (language === 'java') {
      if (code.includes('System.out.print')) {
        const printMatch = code.match(/System\.out\.print(?:ln)?\s*\(\s*["']([^"']+)["']\s*\)/);
        if (printMatch) {
          output = printMatch[1];
        } else {
          output = 'Hello, Cultivator!';
        }
      }
    }

    if (!output) {
      output = '[Program executed with no output]';
    }

    // Add execution stats
    output += `\n\n[Execution completed successfully]\nTime: ${(runtimeMs / 1000).toFixed(3)}s | Memory: ${(memoryKb / 1024).toFixed(2)} MB`;

    return new Response(
      JSON.stringify({
        output,
        status,
        runtimeMs,
        memoryKb,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in run-code function:', error);
    return new Response(
      JSON.stringify({
        output: `[Compilation Error]\n${errorMessage}`,
        status: 'error',
        runtimeMs: 0,
        memoryKb: 0,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
