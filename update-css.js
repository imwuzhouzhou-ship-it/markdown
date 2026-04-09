const fs = require('fs');

const indexFile = 'tools/vc-markdown-editor-copy/index.html';
const cssFile = 'tools/vc-markdown-editor-copy/styles.css';

let html = fs.readFileSync(indexFile, 'utf-8');

// 1. 提取所有硬编码的 CSS
const externalCss = `
:root {
  /* Default variables fallback */
  --md-foreground: #000;
  --md-p-size: 16px;
  --md-p-line-height: 1.6;
  --md-p-margin-bottom: 16px;
  --md-h1-size: 32px;
  --md-h1-line-height: 1.2;
  --md-h1-weight: 700;
  --md-h1-margin-bottom: 24px;
  --md-h1-margin-top: 32px;
  --md-h2-size: 24px;
  --md-h2-line-height: 1.3;
  --md-h2-weight: 600;
  --md-h2-margin-bottom: 20px;
  --md-h2-margin-top: 28px;
  --md-h3-size: 20px;
  --md-h3-line-height: 1.4;
  --md-h3-weight: 600;
  --md-h3-margin-bottom: 16px;
  --md-h3-margin-top: 24px;
  --md-h4-size: 16px;
  --md-h4-line-height: 1.5;
  --md-h4-weight: 600;
  --md-h4-margin-bottom: 12px;
  --md-h4-margin-top: 16px;
  --md-surface-muted: #f4f4f5;
  --md-border-color: #e4e4e7;
  --md-primary-color: #3b82f6;
}

/* Base styles for static cases */
.md-text-p { font-size: var(--md-p-size); line-height: var(--md-p-line-height); margin-bottom: var(--md-p-margin-bottom); color: var(--md-foreground); }
.md-text-h1 { font-size: var(--md-h1-size); line-height: var(--md-h1-line-height); font-weight: var(--md-h1-weight); margin-bottom: var(--md-h1-margin-bottom); margin-top: var(--md-h1-margin-top); color: var(--md-foreground); }
.md-text-h2 { font-size: var(--md-h2-size); line-height: var(--md-h2-line-height); font-weight: var(--md-h2-weight); margin-bottom: var(--md-h2-margin-bottom); margin-top: var(--md-h2-margin-top); color: var(--md-foreground); }
.md-text-h3 { font-size: var(--md-h3-size); line-height: var(--md-h3-line-height); font-weight: var(--md-h3-weight); margin-bottom: var(--md-h3-margin-bottom); margin-top: var(--md-h3-margin-top); color: var(--md-foreground); }

.md-inline-code {
  font-family: var(--font-mono);
  font-size: 13px;
  padding: 2px 5px;
  border-radius: 4px;
  background-color: var(--md-surface-muted);
  border: 1px solid var(--md-border-color);
}

.md-ul, .md-ol { padding-left: 20px; margin-bottom: var(--md-p-margin-bottom); }
.md-ul { list-style-type: disc; }
.md-ol { list-style-type: decimal; }
.md-li { margin-bottom: 8px; font-size: var(--md-p-size); line-height: var(--md-p-line-height); }

.md-table { width: 100%; border-collapse: collapse; margin-bottom: var(--md-p-margin-bottom); border: 1px solid var(--md-border-color); border-radius: 12px; overflow: hidden; }
.md-th { padding: 15px 16px; font-weight: 500; font-size: 14px; background-color: var(--md-surface-muted); border-bottom: 1px solid var(--md-border-color); text-align: left; }
.md-td { padding: 14px 16px; border-bottom: 1px solid var(--md-border-color); font-size: 14px; }

.md-blockquote {
  border-left: 3px solid var(--md-border-color);
  padding-left: 16px;
  color: var(--md-foreground);
  margin-bottom: var(--md-p-margin-bottom);
  font-size: var(--md-p-size);
  line-height: var(--md-p-line-height);
}

/* Markdown generation specific styles */
.markdown-body { color: var(--md-foreground); font-size: var(--md-p-size); line-height: var(--md-p-line-height); }
.markdown-body h1 { font-size: var(--md-h1-size); line-height: var(--md-h1-line-height); font-weight: var(--md-h1-weight); margin-bottom: var(--md-h1-margin-bottom); margin-top: var(--md-h1-margin-top); }
.markdown-body h2 { font-size: var(--md-h2-size); line-height: var(--md-h2-line-height); font-weight: var(--md-h2-weight); margin-bottom: var(--md-h2-margin-bottom); margin-top: var(--md-h2-margin-top); }
.markdown-body h3 { font-size: var(--md-h3-size); line-height: var(--md-h3-line-height); font-weight: var(--md-h3-weight); margin-bottom: var(--md-h3-margin-bottom); margin-top: var(--md-h3-margin-top); }
.markdown-body h4, .markdown-body h5, .markdown-body h6 { font-size: var(--md-h4-size); line-height: var(--md-h4-line-height); font-weight: var(--md-h4-weight); margin-bottom: var(--md-h4-margin-bottom); margin-top: var(--md-h4-margin-top); }
.markdown-body p { margin-bottom: var(--md-p-margin-bottom); }
.markdown-body code { font-family: var(--font-mono); font-size: 13px; padding: 2px 5px; border-radius: 4px; background-color: var(--md-surface-muted); border: 1px solid var(--md-border-color); }
.markdown-body pre { background-color: #fcfdfe; border: 1px solid #eaedf1; border-radius: 12px; padding: 16px; overflow-x: auto; margin-bottom: 16px; }
.markdown-body pre code { background: none; border: none; padding: 0; font-size: 14px; line-height: 24px; color: #0c0d0e; }
.markdown-body ul { padding-left: 20px; list-style-type: disc; margin-bottom: 16px; }
.markdown-body ol { padding-left: 20px; list-style-type: decimal; margin-bottom: 16px; }
.markdown-body li { margin-bottom: 8px; }
.markdown-body blockquote { border-left: 3px solid var(--md-border-color); padding-left: 16px; color: var(--md-foreground); margin-bottom: 16px; }
.markdown-body a { color: var(--md-primary-color); text-decoration: none; }
.markdown-body table { width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 1px solid var(--md-border-color); border-radius: 12px; overflow: hidden; }
.markdown-body th { padding: 15px 16px; font-weight: 500; font-size: 14px; background-color: var(--md-surface-muted); border-bottom: 1px solid var(--md-border-color); text-align: left; }
.markdown-body td { padding: 14px 16px; border-bottom: 1px solid var(--md-border-color); font-size: 14px; }
`;

fs.writeFileSync(cssFile, externalCss);

// 2. Remove aiCss string definition
html = html.replace(/const aiCss = `[\s\S]*?`;/, '');

// 3. Remove <style>{aiCss}</style> injection
html = html.replace(/<style>\{aiCss\}<\/style>/g, '');

// 4. Update index.html to include styles.css
html = html.replace('</style>', '</style>\n    <link rel="stylesheet" href="/styles.css">');

// 5. Add dynamic CSS variables injection to the root div or wrapper
const rootInjectStr = `
            const cssVariables = {
                '--md-foreground': config.foreground,
                '--md-p-size': styles.p.fontSize,
                '--md-p-line-height': styles.p.lineHeight,
                '--md-p-margin-bottom': styles.p.marginBottom,
                '--md-h1-size': styles.h1.fontSize,
                '--md-h1-line-height': styles.h1.lineHeight,
                '--md-h1-weight': styles.h1.fontWeight,
                '--md-h1-margin-bottom': styles.h1.marginBottom,
                '--md-h1-margin-top': styles.h1.marginTop,
                '--md-h2-size': styles.h2.fontSize,
                '--md-h2-line-height': styles.h2.lineHeight,
                '--md-h2-weight': styles.h2.fontWeight,
                '--md-h2-margin-bottom': styles.h2.marginBottom,
                '--md-h2-margin-top': styles.h2.marginTop,
                '--md-h3-size': styles.h3.fontSize,
                '--md-h3-line-height': styles.h3.lineHeight,
                '--md-h3-weight': styles.h3.fontWeight,
                '--md-h3-margin-bottom': styles.h3.marginBottom,
                '--md-h3-margin-top': styles.h3.marginTop,
                '--md-h4-size': styles.h4.fontSize,
                '--md-h4-line-height': styles.h4.lineHeight,
                '--md-h4-weight': styles.h4.fontWeight,
                '--md-h4-margin-bottom': styles.h4.marginBottom,
                '--md-h4-margin-top': styles.h4.marginTop,
                '--md-surface-muted': config.surfaceMuted,
                '--md-border-color': config.borderColor,
                '--md-primary-color': config.primaryColor
            };

            const testCases = [
`;

html = html.replace('const testCases = [', rootInjectStr);

// 6. Inject cssVariables to preview-container
html = html.replace(
    '<div className="preview-container flex flex-col" style={{ ...styles.root, gap: \'0px\' }}>',
    '<div className="preview-container flex flex-col" style={{ ...styles.root, gap: \'0px\', ...cssVariables }}>'
);

// 7. Replace static style objects with class names for h1, p etc in testCases
html = html.replace(/style=\{styles\.p\}/g, 'className="md-text-p"');
html = html.replace(/style=\{styles\.h1\}/g, 'className="md-text-h1"');
html = html.replace(/style=\{styles\.h2\}/g, 'className="md-text-h2"');
html = html.replace(/style=\{styles\.h3\}/g, 'className="md-text-h3"');
html = html.replace(/style=\{styles\.ul\}/g, 'className="md-ul"');
html = html.replace(/style=\{styles\.ol\}/g, 'className="md-ol"');
html = html.replace(/style=\{styles\.li\}/g, 'className="md-li"');
html = html.replace(/style=\{styles\.blockquote\}/g, 'className="md-blockquote"');
html = html.replace(/style=\{styles\.inlineCode\}/g, 'className="md-inline-code"');

fs.writeFileSync(indexFile, html);
console.log('Split CSS logic applied.');
