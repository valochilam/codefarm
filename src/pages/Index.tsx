import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <div className="dark bg-background text-foreground">
        {/* Navigation */}
        <nav className="border-b-4 border-border bg-card">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="font-mono text-2xl font-bold tracking-wider uppercase">
              CODE_FARM
            </h1>
            <div className="flex gap-4 font-mono text-sm uppercase tracking-wider">
              <a href="#" className="hover:text-accent transition-colors">Realms</a>
              <a href="#" className="hover:text-accent transition-colors">Challenges</a>
              <a href="#" className="hover:text-accent transition-colors">Leaderboard</a>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="border-b-4 border-border py-24 px-6">
          <div className="container mx-auto text-center">
            <div className="mb-6 font-mono text-sm tracking-[0.5em] uppercase text-muted-foreground">
              [ CULTIVATION BEGINS ]
            </div>
            <h1 className="font-mono text-6xl md:text-8xl font-bold tracking-tight uppercase mb-6">
              CODE<span className="text-accent">_</span>FARM
            </h1>
            <p className="font-mono text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 tracking-wide">
              Cultivate Your Code. Ascend Through Realms. Become Divine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="font-mono text-lg uppercase tracking-wider px-12 py-6 border-4 border-border bg-accent text-accent-foreground hover:bg-accent/90 shadow-md hover:shadow-lg transition-all">
                Begin Cultivation
              </Button>
              <Button variant="outline" className="font-mono text-lg uppercase tracking-wider px-12 py-6 border-4 hover:bg-secondary transition-all">
                View The Path
              </Button>
            </div>
          </div>
        </section>

        {/* Realm Showcase */}
        <section className="border-b-4 border-border py-20 px-6 bg-secondary">
          <div className="container mx-auto">
            <h2 className="font-mono text-3xl font-bold uppercase tracking-wider text-center mb-4">
              The Three Major Realms
            </h2>
            <p className="font-mono text-muted-foreground text-center mb-16 tracking-wide">
              Accumulate Aura through challenges. Ascend through stages. Achieve divinity.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Mortal Realm */}
              <div className="border-4 border-border bg-card p-8 shadow-md hover:shadow-lg transition-all">
                <div className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-2">
                  REALM I
                </div>
                <h3 className="font-mono text-2xl font-bold uppercase mb-4">Mortal</h3>
                <div className="h-1 w-16 bg-muted-foreground mb-6"></div>
                <p className="font-mono text-sm text-muted-foreground mb-6">
                  0 — 399 AURA
                </p>
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex justify-between border-b border-border/30 pb-1">
                    <span>Stage 1</span><span className="text-muted-foreground">Awakening</span>
                  </div>
                  <div className="flex justify-between border-b border-border/30 pb-1">
                    <span>Stage 2</span><span className="text-muted-foreground">Foundation</span>
                  </div>
                  <div className="flex justify-between border-b border-border/30 pb-1">
                    <span>Stage 3</span><span className="text-muted-foreground">Consolidation</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stage 4</span><span className="text-muted-foreground">Transcendence</span>
                  </div>
                </div>
              </div>

              {/* Immortal Realm */}
              <div className="border-4 border-accent bg-card p-8 shadow-lg">
                <div className="font-mono text-xs tracking-[0.3em] text-accent mb-2">
                  REALM II
                </div>
                <h3 className="font-mono text-2xl font-bold uppercase mb-4 text-accent">Immortal</h3>
                <div className="h-1 w-16 bg-accent mb-6"></div>
                <p className="font-mono text-sm text-muted-foreground mb-6">
                  400 — 1,599 AURA
                </p>
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex justify-between border-b border-border/30 pb-1">
                    <span>Stage 1</span><span className="text-muted-foreground">Qi Condensation</span>
                  </div>
                  <div className="flex justify-between border-b border-border/30 pb-1">
                    <span>Stage 2</span><span className="text-muted-foreground">Core Formation</span>
                  </div>
                  <div className="flex justify-between border-b border-border/30 pb-1">
                    <span>Stage 3</span><span className="text-muted-foreground">Nascent Soul</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stage 4</span><span className="text-muted-foreground">Spirit Severing</span>
                  </div>
                </div>
              </div>

              {/* Divine Realm */}
              <div className="border-4 border-border bg-card p-8 shadow-md hover:shadow-lg transition-all">
                <div className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-2">
                  REALM III
                </div>
                <h3 className="font-mono text-2xl font-bold uppercase mb-4">Divine</h3>
                <div className="h-1 w-16 bg-foreground mb-6"></div>
                <p className="font-mono text-sm text-muted-foreground mb-6">
                  1,600+ AURA
                </p>
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex justify-between border-b border-border/30 pb-1">
                    <span>Stage 1</span><span className="text-muted-foreground">Dao Seeking</span>
                  </div>
                  <div className="flex justify-between border-b border-border/30 pb-1">
                    <span>Stage 2</span><span className="text-muted-foreground">Dao Comprehension</span>
                  </div>
                  <div className="flex justify-between border-b border-border/30 pb-1">
                    <span>Stage 3</span><span className="text-muted-foreground">Dao Manifestation</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stage 4</span><span className="text-muted-foreground">Dao Perfection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-b-4 border-border py-20 px-6">
          <div className="container mx-auto">
            <h2 className="font-mono text-3xl font-bold uppercase tracking-wider text-center mb-16">
              The Path Awaits
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border-4 border-border bg-card p-8">
                <div className="font-mono text-xs tracking-[0.3em] text-accent mb-4">
                  [ 001 ]
                </div>
                <h3 className="font-mono text-xl font-bold uppercase mb-4">The Problem Forge</h3>
                <p className="font-mono text-muted-foreground">
                  Face coding challenges across 5 divisions of difficulty. Each problem tempers your skills and earns you Aura.
                </p>
              </div>
              
              <div className="border-4 border-border bg-card p-8">
                <div className="font-mono text-xs tracking-[0.3em] text-accent mb-4">
                  [ 002 ]
                </div>
                <h3 className="font-mono text-xl font-bold uppercase mb-4">The Judge Console</h3>
                <p className="font-mono text-muted-foreground">
                  Submit your code. Watch it execute in real-time. Receive immediate judgment on your cultivation progress.
                </p>
              </div>
              
              <div className="border-4 border-border bg-card p-8">
                <div className="font-mono text-xs tracking-[0.3em] text-accent mb-4">
                  [ 003 ]
                </div>
                <h3 className="font-mono text-xl font-bold uppercase mb-4">Monaco Editor</h3>
                <p className="font-mono text-muted-foreground">
                  Write code in a VS Code-grade editor. C, C++, Python. Syntax highlighting. Multiple themes.
                </p>
              </div>
              
              <div className="border-4 border-border bg-card p-8">
                <div className="font-mono text-xs tracking-[0.3em] text-accent mb-4">
                  [ 004 ]
                </div>
                <h3 className="font-mono text-xl font-bold uppercase mb-4">Global Rankings</h3>
                <p className="font-mono text-muted-foreground">
                  Compete with cultivators worldwide. Climb the leaderboard. Prove your mastery.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* UI Components Preview */}
        <section className="border-b-4 border-border py-20 px-6 bg-secondary">
          <div className="container mx-auto">
            <h2 className="font-mono text-3xl font-bold uppercase tracking-wider text-center mb-4">
              Interface Components
            </h2>
            <p className="font-mono text-muted-foreground text-center mb-16 tracking-wide">
              A preview of the cultivation interface aesthetic
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Buttons */}
              <div className="border-4 border-border bg-card p-8">
                <h3 className="font-mono text-sm tracking-[0.3em] text-muted-foreground mb-6">BUTTONS</h3>
                <div className="flex flex-wrap gap-4">
                  <Button className="font-mono uppercase tracking-wider border-4 border-border bg-accent text-accent-foreground hover:bg-accent/90">
                    Primary
                  </Button>
                  <Button variant="outline" className="font-mono uppercase tracking-wider border-4">
                    Secondary
                  </Button>
                  <Button variant="destructive" className="font-mono uppercase tracking-wider border-4 border-destructive">
                    Danger
                  </Button>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="border-4 border-border bg-card p-8">
                <h3 className="font-mono text-sm tracking-[0.3em] text-muted-foreground mb-6">AURA PROGRESS</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between font-mono text-sm mb-2">
                      <span>Mortal Stage 3</span>
                      <span>247 / 400</span>
                    </div>
                    <Progress value={62} className="h-4 border-2 border-border" />
                  </div>
                  <div>
                    <div className="flex justify-between font-mono text-sm mb-2">
                      <span>Immortal Stage 1</span>
                      <span>520 / 800</span>
                    </div>
                    <Progress value={65} className="h-4 border-2 border-border" />
                  </div>
                </div>
              </div>

              {/* Input Fields */}
              <div className="border-4 border-border bg-card p-8">
                <h3 className="font-mono text-sm tracking-[0.3em] text-muted-foreground mb-6">INPUT FIELDS</h3>
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="ENTER_CULTIVATOR_NAME" 
                    className="w-full font-mono bg-background border-4 border-border px-4 py-3 placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                  />
                  <input 
                    type="text" 
                    placeholder="ENTER_SECRET_TECHNIQUE" 
                    className="w-full font-mono bg-background border-4 border-border px-4 py-3 placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Code Editor Mock */}
              <div className="border-4 border-border bg-card p-8">
                <h3 className="font-mono text-sm tracking-[0.3em] text-muted-foreground mb-6">CODE EDITOR</h3>
                <div className="bg-background border-4 border-border p-4 font-mono text-sm">
                  <div className="text-muted-foreground">// Solution.cpp</div>
                  <div className="mt-2">
                    <span className="text-accent">#include</span> {"<iostream>"}
                  </div>
                  <div className="mt-1">
                    <span className="text-accent">using namespace</span> std;
                  </div>
                  <div className="mt-2">
                    <span className="text-accent">int</span> main() {"{"}
                  </div>
                  <div className="ml-4">cout {"<<"} "Hello, Cultivator";</div>
                  <div className="ml-4"><span className="text-accent">return</span> 0;</div>
                  <div>{"}"}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Status Cards */}
        <section className="border-b-4 border-border py-20 px-6">
          <div className="container mx-auto">
            <h2 className="font-mono text-3xl font-bold uppercase tracking-wider text-center mb-16">
              Submission States
            </h2>
            
            <div className="grid md:grid-cols-4 gap-4">
              <div className="border-4 border-accent bg-accent/10 p-6 text-center">
                <div className="font-mono text-2xl font-bold text-accent mb-2">AC</div>
                <div className="font-mono text-sm tracking-wider">ACCEPTED</div>
              </div>
              <div className="border-4 border-destructive bg-destructive/10 p-6 text-center">
                <div className="font-mono text-2xl font-bold text-destructive mb-2">WA</div>
                <div className="font-mono text-sm tracking-wider">WRONG ANSWER</div>
              </div>
              <div className="border-4 border-border bg-muted p-6 text-center">
                <div className="font-mono text-2xl font-bold mb-2">TLE</div>
                <div className="font-mono text-sm tracking-wider">TIME LIMIT</div>
              </div>
              <div className="border-4 border-border bg-muted p-6 text-center">
                <div className="font-mono text-2xl font-bold mb-2">RTE</div>
                <div className="font-mono text-sm tracking-wider">RUNTIME ERROR</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t-4 border-border py-12 px-6 bg-card">
          <div className="container mx-auto text-center">
            <div className="font-mono text-2xl font-bold tracking-wider uppercase mb-4">
              CODE_FARM
            </div>
            <p className="font-mono text-sm text-muted-foreground tracking-wide">
              CULTIVATE · ASCEND · TRANSCEND
            </p>
            <div className="mt-8 font-mono text-xs text-muted-foreground">
              [ DESIGN PREVIEW — CULTIVATION BRUTALIST ]
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
