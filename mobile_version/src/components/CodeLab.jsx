import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Copy, Terminal, Bot, Code, Cpu, Files, Search as SearchIcon, GitBranch, Settings, X, Plus, LayoutPanelLeft } from 'lucide-react';

// Starter Templates
const TEMPLATES = {
    javascript: `function greet(name) {
    console.log("Hello, " + name + "!");
    return true;
}

greet("KlistarAI User");`,
    python: `def fib_sequence(n):
    a, b = 0, 1
    results = []
    for _ in range(n):
        results.append(a)
        a, b = b, a + b
    return results

print(fib_sequence(10))`,
    html: `<!DOCTYPE html>
<html>
<head>
    <title>KlistarAI</title>
    <style>body{background:#111;color:#fff;text-align:center;font-family:sans-serif;}</style>
</head>
<body>
    <h1>Code Lab</h1>
    <p>Live Preview Mode</p>
</body>
</html>`,
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Java Environment Ready");
    }
}`,
    cpp: `#include <iostream>

int main() {
    std::cout << "KlistarAI C++" << std::endl;
    return 0;
}`
};

const FILE_EXTENSIONS = {
    javascript: 'js',
    python: 'py',
    html: 'html',
    java: 'java',
    cpp: 'cpp'
};

export default function CodeLab({ socket }) {
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState(TEMPLATES['javascript']);
    const [output, setOutput] = useState([]);
    const [activePanel, setActivePanel] = useState('terminal'); // 'terminal' | 'ai' | 'closed'
    const [aiInput, setAiInput] = useState('');
    const [aiMessages, setAiMessages] = useState([
        { sender: 'AI', text: "KlistarAI Expert Initialized. Ready to assist." }
    ]);
    const [editorReady, setEditorReady] = useState(false);
    const [lineInfo, setLineInfo] = useState({ ln: 1, col: 1 });

    const editorRef = useRef(null);
    const monacoRef = useRef(null);

    // Load Monaco
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.43.0/min/vs/loader.js";
        script.async = true;

        script.onload = () => {
            window.require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.43.0/min/vs' } });

            window.require(['vs/editor/editor.main'], () => {
                if (editorRef.current) {
                    monacoRef.current = window.monaco.editor.create(editorRef.current, {
                        value: code,
                        language: language,
                        theme: 'vs-dark',
                        automaticLayout: true,
                        minimap: { enabled: true, scale: 0.75 }, // Small minimap
                        fontSize: 13,
                        fontFamily: "'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        roundedSelection: false,
                        readOnly: false,
                        cursorBlinking: "smooth",
                        cursorSmoothCaretAnimation: "on",
                        scrollbar: {
                            vertical: 'visible',
                            horizontal: 'visible',
                            verticalScrollbarSize: 10,
                            horizontalScrollbarSize: 10,
                        },
                        overviewRulerBorder: false,
                        hideCursorInOverviewRuler: true,
                    });

                    // Cursor Position
                    monacoRef.current.onDidChangeCursorPosition((e) => {
                        setLineInfo({ ln: e.position.lineNumber, col: e.position.column });
                    });

                    // Content Change
                    monacoRef.current.onDidChangeModelContent(() => {
                        const newVal = monacoRef.current.getValue();
                        setCode(newVal);
                    });

                    setEditorReady(true);
                }
            });
        };

        document.body.appendChild(script);

        return () => {
            if (monacoRef.current) monacoRef.current.dispose();
            if (script.parentNode) script.parentNode.removeChild(script);
        };
    }, []);

    // Language Sync
    useEffect(() => {
        if (monacoRef.current) {
            const model = monacoRef.current.getModel();
            window.monaco.editor.setModelLanguage(model, language === 'c++' ? 'cpp' : language);

            // Only swap code if it matches template start (basic check to technically allows manual typing)
            // or if the language completely changed context
            if (TEMPLATES[language] && code.startsWith(TEMPLATES[language].slice(0, 10))) {
                monacoRef.current.setValue(code);
            } else if (code.length < 50) { // If nearly empty, replace
                monacoRef.current.setValue(code);
            }
        }
    }, [language, code]);

    const handleRun = () => {
        setActivePanel('terminal');
        setOutput([{ type: 'info', text: `> Executing script.${FILE_EXTENSIONS[language]}...` }]);

        setTimeout(() => {
            if (language === 'javascript') {
                try {
                    const logs = [];
                    const originalLog = console.log;
                    console.log = (...args) => {
                        logs.push(args.join(' '));
                        originalLog(...args);
                    };

                    /* eslint-disable no-eval */
                    try { eval(code); } catch (e) { console.log("Error:", e.message); }
                    /* eslint-enable no-eval */

                    console.log = originalLog;

                    setOutput(prev => [
                        ...prev,
                        ...logs.map(l => ({ type: 'log', text: l })),
                        { type: 'success', text: `> Done exited with code=0` }
                    ]);
                } catch (err) {
                    setOutput(prev => [...prev, { type: 'error', text: err.toString() }]);
                }
            } else {
                setOutput(prev => [
                    ...prev,
                    { type: 'log', text: `[Simulation Mode] Interpreting '${language}' code...` },
                    { type: 'log', text: `> Output captured from virtual env` },
                    { type: 'success', text: `> Execution finished successfully` }
                ]);
            }
        }, 300);
    };

    const handleAiSend = () => {
        if (!aiInput.trim()) return;
        const userText = aiInput;
        setAiMessages(prev => [...prev, { sender: 'User', text: userText }]);
        setAiInput('');

        // Mock AI Response
        setTimeout(() => {
            setAiMessages(prev => [...prev, { sender: 'AI', text: "I've analyzed your request. Updating code structure for better readability." }]);
            // Naive append for demo
            if (editorReady) {
                const newCode = code + "\n// AI Refactored this section";
                monacoRef.current.setValue(newCode);
            }
        }, 1000);
    };

    return (
        <div className="flex w-full h-full bg-[#1e1e1e] text-[#cccccc] font-sans text-xs overflow-hidden">
            {/* Activity Bar (Left Strip) */}
            <div className="w-12 bg-[#333333] flex flex-col items-center py-2 gap-4 border-r border-[#1e1e1e]">
                <ActivityIcon icon={Files} active />
                <ActivityIcon icon={SearchIcon} />
                <ActivityIcon icon={GitBranch} />
                <ActivityIcon icon={Cpu} />
                <div className="flex-1" />
                <ActivityIcon icon={Settings} />
            </div>

            {/* Side Bar (Explorer) - Hidden for Mobile Space, or could be toggleable */}
            {/* <div className="w-48 bg-[#252526] flex flex-col"> ... </div> */}

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">

                {/* Tabs Bar */}
                <div className="flex bg-[#2d2d2d] overflow-x-auto scrollbar-hide">
                    <Tab
                        name={`script.${FILE_EXTENSIONS[language]}`}
                        active={true}
                        icon={Code}
                        onClose={() => { }}
                    />
                    <Tab name="styles.css" icon={LayoutList} />
                    <button className="px-2 hover:bg-[#3e3e3e] text-[#cccccc]"><Plus size={14} /></button>
                </div>

                {/* Breadcrumbs / Toolbar */}
                <div className="h-6 bg-[#1e1e1e] border-b border-[#333] flex items-center px-4 gap-2 text-[10px] text-[#888]">
                    <span>src</span>
                    <span>›</span>
                    <span>components</span>
                    <span>›</span>
                    <span className="text-[#cccccc]">{`script.${FILE_EXTENSIONS[language]}`}</span>

                    <div className="flex-1" />

                    {/* Toolbar Actions */}
                    <div className="flex items-center gap-2">
                        <select
                            value={language}
                            onChange={(e) => { setLanguage(e.target.value); setCode(TEMPLATES[e.target.value]); }}
                            className="bg-[#333] border border-[#444] text-[#ccc] text-[10px] px-1 rounded outline-none"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                        </select>

                        <button onClick={handleRun} className="flex items-center gap-1 text-green-400 hover:text-green-300">
                            <Play size={10} fill="currentColor" /> Run
                        </button>
                    </div>
                </div>

                {/* Editor Container */}
                <div className="flex-1 relative">
                    <div ref={editorRef} className="absolute inset-0" />
                </div>

                {/* Bottom Panel (Terminal/AI) */}
                {activePanel !== 'closed' && (
                    <div className="bg-[#1e1e1e] border-t border-[#333] flex flex-col h-[35%] animate-slide-up">
                        {/* Panel Tabs */}
                        <div className="flex items-center gap-6 px-4 py-1 border-b border-[#333]">
                            <PanelTab label="PROBLEMS" />
                            <PanelTab label="OUTPUT" />
                            <PanelTab label="TERMINAL" active={activePanel === 'terminal'} onClick={() => setActivePanel('terminal')} />
                            <PanelTab label="AI DEBUG CONSOLE" active={activePanel === 'ai'} onClick={() => setActivePanel('ai')} />
                            <div className="flex-1" />
                            <button onClick={() => setActivePanel('closed')} className="hover:bg-[#333] p-1 rounded"><X size={12} /></button>
                        </div>

                        {/* Panel Content */}
                        <div className="flex-1 overflow-auto p-2 font-mono">
                            {activePanel === 'terminal' ? (
                                <div className="space-y-1">
                                    <div className="text-[#888]">KlistarAI Terminal [Version 1.2.0]</div>
                                    <div className="text-[#888] mb-2">(c) 2025 Klistar Corporation.</div>

                                    {output.map((line, i) => (
                                        <div key={i} className={`
                                            ${line.type === 'error' ? 'text-red-400' : ''}
                                            ${line.type === 'success' ? 'text-green-400' : ''}
                                            ${line.type === 'info' ? 'text-blue-400' : ''}
                                            ${line.type === 'log' ? 'text-[#ccc]' : ''}
                                        `}>
                                            {line.text}
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-green-500">➜</span>
                                        <span className="text-blue-400">workspace</span>
                                        <span className="animate-pulse">_</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col h-full">
                                    <div className="flex-1 overflow-y-auto space-y-2 mb-2">
                                        {aiMessages.map((msg, idx) => (
                                            <div key={idx} className={`p-2 rounded border border-[#333] ${msg.sender === 'AI' ? 'bg-[#252526] text-[#ce9178]' : 'bg-[#2d2d2d] text-[#9cdcfe]'}`}>
                                                <div className="text-[9px] uppercase tracking-wider opacity-50 mb-1">{msg.sender}</div>
                                                <div>{msg.text}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            value={aiInput}
                                            onChange={(e) => setAiInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                                            placeholder="Ask programming expert..."
                                            className="flex-1 bg-[#333] border border-[#444] px-2 py-1 text-[#ccc] outline-none focus:border-[#007acc]"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Status Bar */}
                <div className="h-6 bg-[#007acc] text-white flex items-center px-2 justify-between text-[10px] select-none">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 hover:bg-white/10 px-1 rounded cursor-pointer">
                            <GitBranch size={10} />
                            <span>main*</span>
                        </div>
                        <div className="flex items-center gap-1 hover:bg-white/10 px-1 rounded cursor-pointer">
                            <X size={10} />
                            <span>0</span>
                            <span className="opacity-50">0</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="hover:bg-white/10 px-1 rounded cursor-pointer">Ln {lineInfo.ln}, Col {lineInfo.col}</span>
                        <span className="hover:bg-white/10 px-1 rounded cursor-pointer">UTF-8</span>
                        <span className="hover:bg-white/10 px-1 rounded cursor-pointer">{language === 'c++' ? 'CPP' : language.toUpperCase()}</span>
                        <span className="hover:bg-white/10 px-1 rounded cursor-pointer">Prettier</span>
                        <span className="hover:bg-white/10 px-1 rounded cursor-pointer">KlistarAI</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActivityIcon({ icon: Icon, active }) {
    return (
        <div className={`p-2 cursor-pointer border-l-2 ${active ? 'border-white text-white' : 'border-transparent text-[#858585] hover:text-white'}`}>
            <Icon size={24} strokeWidth={1.5} />
        </div>
    );
}

function Tab({ name, active, icon: Icon, onClose }) {
    return (
        <div className={`
            flex items-center gap-2 px-3 py-1.5 min-w-[120px] cursor-pointer text-[12px] border-t-2 select-none
            ${active ? 'bg-[#1e1e1e] text-white border-[#007acc]' : 'bg-[#2d2d2d] text-[#969696] border-transparent hover:bg-[#2d2d2d]/80'}
            border-r border-[#1e1e1e]
        `}>
            {Icon && <Icon size={12} className={name.endsWith('js') ? 'text-yellow-400' : name.endsWith('css') ? 'text-blue-400' : 'text-orange-400'} />}
            <span className="flex-1 truncate">{name}</span>
            {active && onClose && <X size={12} className="hover:bg-[#333] rounded p-0.5" />}
        </div>
    );
}

function PanelTab({ label, active, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`cursor-pointer text-[10px] pb-1 border-b-2 hover:text-[#ccc] ${active ? 'text-white border-[#e7e7e7]' : 'text-[#888] border-transparent'}`}
        >
            {label}
        </div>
    );
}
// Fix for missing LayoutList icon usage if preferred
const LayoutList = ({ size, className }) => <Files size={size} className={className} />;
