const fs = require('fs');
let html = fs.readFileSync('tools/vc-markdown-editor-copy/index.html', 'utf-8');

// 1. Add states and handleGenerate
html = html.replace(
    'const [config, setConfig] = useState({',
    `const [promptInput, setPromptInput] = useState('');
            const [submittedPrompt, setSubmittedPrompt] = useState('请在此输入 Prompt 并发送...');
            const [aiResult, setAiResult] = useState('');
            const [isGenerating, setIsGenerating] = useState(false);

            const handleGenerate = async (e) => {
                if (e) e.preventDefault();
                if (!promptInput.trim() || isGenerating) return;
                
                const currentPrompt = promptInput.trim();
                setPromptInput('');
                setSubmittedPrompt(currentPrompt);
                setIsGenerating(true);
                setAiResult('正在思考中...');
                setActiveCaseId('ai-generator');

                try {
                    const res = await fetch('/api/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt: currentPrompt })
                    });
                    const data = await res.json();
                    if (data.result) {
                        setAiResult(data.result);
                    } else {
                        setAiResult('生成失败：' + (data.error || '未知错误'));
                    }
                } catch (err) {
                    setAiResult('请求失败：' + err.message);
                } finally {
                    setIsGenerating(false);
                }
            };

            const [config, setConfig] = useState({`
);

// 2. Add aiCss and the ai-generator case
html = html.replace(
    "const testCases = [",
    `const aiCss = \`
        .markdown-body { color: \${config.foreground}; font-size: \${styles.p.fontSize}; line-height: \${styles.p.lineHeight}; }
        .markdown-body h1 { font-size: \${styles.h1.fontSize}; line-height: \${styles.h1.lineHeight}; font-weight: \${styles.h1.fontWeight}; margin-bottom: \${styles.h1.marginBottom}; margin-top: \${styles.h1.marginTop}; }
        .markdown-body h2 { font-size: \${styles.h2.fontSize}; line-height: \${styles.h2.lineHeight}; font-weight: \${styles.h2.fontWeight}; margin-bottom: \${styles.h2.marginBottom}; margin-top: \${styles.h2.marginTop}; }
        .markdown-body h3 { font-size: \${styles.h3.fontSize}; line-height: \${styles.h3.lineHeight}; font-weight: \${styles.h3.fontWeight}; margin-bottom: \${styles.h3.marginBottom}; margin-top: \${styles.h3.marginTop}; }
        .markdown-body h4, .markdown-body h5, .markdown-body h6 { font-size: \${styles.h4.fontSize}; line-height: \${styles.h4.lineHeight}; font-weight: \${styles.h4.fontWeight}; margin-bottom: \${styles.h4.marginBottom}; margin-top: \${styles.h4.marginTop}; }
        .markdown-body p { margin-bottom: \${styles.p.marginBottom}; }
        .markdown-body code { font-family: var(--font-mono); font-size: 13px; padding: 2px 5px; border-radius: 4px; background-color: \${config.surfaceMuted}; border: 1px solid \${config.borderColor}; }
        .markdown-body pre { background-color: #fcfdfe; border: 1px solid #eaedf1; border-radius: 12px; padding: 16px; overflow-x: auto; margin-bottom: 16px; }
        .markdown-body pre code { background: none; border: none; padding: 0; font-size: 14px; line-height: 24px; color: #0c0d0e; }
        .markdown-body ul { padding-left: 20px; list-style-type: disc; margin-bottom: 16px; }
        .markdown-body ol { padding-left: 20px; list-style-type: decimal; margin-bottom: 16px; }
        .markdown-body li { margin-bottom: 8px; }
        .markdown-body blockquote { border-left: 3px solid #eaedf1; padding-left: 16px; color: #0c0d0e; margin-bottom: 16px; }
        .markdown-body a { color: \${config.primaryColor}; text-decoration: none; }
        .markdown-body table { width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 1px solid #eaedf1; border-radius: 12px; overflow: hidden; }
        .markdown-body th { padding: 15px 16px; font-weight: 500; font-size: 14px; background-color: #f6f8fa; border-bottom: 1px solid #eaedf1; text-align: left; }
        .markdown-body td { padding: 14px 16px; border-bottom: 1px solid #eaedf1; font-size: 14px; }
    \`;

            const testCases = [
                {
                    id: 'ai-generator',
                    name: '🤖 AI 实时生成',
                    query: submittedPrompt,
                    render: () => (
                        <>
                            <style>{aiCss}</style>
                            {aiResult ? (
                                <div className="markdown-body" dangerouslySetInnerHTML={{ __html: window.marked ? marked.parse(aiResult) : aiResult }} />
                            ) : (
                                <p style={styles.p}>在下方输入 Prompt，点击发送后，生成的结果将在这里展示。</p>
                            )}
                        </>
                    )
                },`
);

// 3. Update main panel layout
const newMainPanel = `<main className="flex-1 flex flex-col bg-white overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-12 flex justify-center items-start">
                            <div className="flex flex-col gap-6" style={{ width: '768px', padding: '32px 0' }}>
                                
                                {/* User Bubble */}
                                <div style={styles.userBubble}>
                                    {activeCase.id === 'ai-generator' ? submittedPrompt : activeCase.query}
                                </div>

                                {/* Agent Response */}
                                <div className="preview-container flex flex-col" style={{ ...styles.root, gap: '0px' }}>
                                    
                                    {activeCase.render()}

                                    {/* Action Bar */}
                                    <div className="flex items-center gap-4 mt-6 text-slate-400">
                                        <button className="hover:text-slate-600 transition-colors"><i data-lucide="thumbs-up" className="w-4 h-4"></i></button>
                                        <button className="hover:text-slate-600 transition-colors"><i data-lucide="thumbs-down" className="w-4 h-4"></i></button>
                                        <button className="hover:text-slate-600 transition-colors"><i data-lucide="copy" className="w-4 h-4"></i></button>
                                        <button className="hover:text-slate-600 transition-colors"><i data-lucide="rotate-ccw" className="w-4 h-4"></i></button>
                                        <button className="hover:text-slate-600 transition-colors"><i data-lucide="more-horizontal" className="w-4 h-4"></i></button>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Prompt Input Box */}
                        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-center shrink-0">
                            <form 
                                onSubmit={handleGenerate} 
                                className="flex gap-4 w-full max-w-3xl items-center bg-white border border-slate-300 rounded-xl px-4 py-2 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all"
                            >
                                <input
                                    type="text"
                                    value={promptInput}
                                    onChange={(e) => setPromptInput(e.target.value)}
                                    placeholder="输入 Prompt 让模型生成内容..."
                                    className="flex-1 outline-none border-none text-slate-800 placeholder-slate-400 py-2 bg-transparent"
                                    disabled={isGenerating}
                                />
                                <button
                                    type="submit"
                                    disabled={isGenerating || !promptInput.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-2 disabled:opacity-50 transition-colors flex items-center justify-center"
                                >
                                    {isGenerating ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <i data-lucide="send" className="w-5 h-5"></i>
                                    )}
                                </button>
                            </form>
                        </div>
                    </main>`;

html = html.replace(/<main className="flex-1 p-12 overflow-y-auto flex justify-center items-start bg-white">[\s\S]*?<\/main>/, newMainPanel);

// 4. lucide re-init on change
html = html.replace(
    "return (",
    `useEffect(() => {
                if (window.lucide) window.lucide.createIcons();
            }, [aiResult, activeCaseId]);

            return (`
);

fs.writeFileSync('tools/vc-markdown-editor-copy/index.html', html);
console.log('updated index.html');
