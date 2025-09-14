// LaTeX rendering utility using KaTeX + html2canvas + jsPDF
// Using proper npm packages instead of CDN

import katex from 'katex';
import 'katex/dist/katex.min.css';
import html2canvas from 'html2canvas';

// Clean LaTeX string for KaTeX rendering
const cleanLatexForKatex = (latexString: string): string => {
  let cleaned = latexString;
  
  // Remove document structure commands that KaTeX doesn't support
  cleaned = cleaned.replace(/\\documentclass\{[^}]+\}/g, '');
  cleaned = cleaned.replace(/\\usepackage(?:\[[^\]]*\])?\{[^}]+\}/g, '');
  cleaned = cleaned.replace(/\\begin\{document\}/g, '');
  cleaned = cleaned.replace(/\\end\{document\}/g, '');
  cleaned = cleaned.replace(/\\textbf\{([^}]+)\}/g, '\\textbf{$1}'); // Keep textbf but ensure proper formatting
  cleaned = cleaned.replace(/\\textbf\{/g, '\\textbf{');
  
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  console.log('🧹 Cleaned LaTeX for KaTeX:', cleaned.substring(0, 100) + '...');
  return cleaned;
};

// Render LaTeX to image using KaTeX
export const renderLatexToImage = async (latexString: string): Promise<string> => {
  console.log('🎨 Rendering LaTeX to image:', latexString.substring(0, 100) + '...');
  
  try {
    // Clean the LaTeX string for KaTeX
    const cleanedLatex = cleanLatexForKatex(latexString);
    
    // Create temporary container
    const container = document.createElement('div');
    container.id = 'latex-temp-container';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.padding = '20px';
    container.style.border = '1px solid #ccc';
    container.style.backgroundColor = '#fff';
    container.style.fontSize = '18px';
    container.style.lineHeight = '1.4';
    container.style.fontFamily = 'Times, "Times New Roman", serif';
    container.style.whiteSpace = 'pre-wrap';
    container.style.maxWidth = '800px';
    document.body.appendChild(container);
    
    try {
      // Render LaTeX using KaTeX (inline mode)
      katex.render(cleanedLatex, container, {
        throwOnError: false,
        displayMode: false
      });
      
      // Wait a bit for rendering
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Capture as canvas
      const canvas = await html2canvas(container, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true
      });
      
      // Convert to data URL
      const imageDataUrl = canvas.toDataURL('image/png');
      
      console.log('✅ LaTeX rendered successfully to image');
      return imageDataUrl;
      
    } finally {
      // Clean up
      document.body.removeChild(container);
    }
    
  } catch (error) {
    console.error('❌ Failed to render LaTeX:', error);
    throw error;
  }
};

// Render display math (block-level)
export const renderDisplayLatexToImage = async (latexString: string): Promise<string> => {
  console.log('🎨 Rendering display LaTeX to image:', latexString.substring(0, 100) + '...');
  
  try {
    // Clean the LaTeX string for KaTeX
    const cleanedLatex = cleanLatexForKatex(latexString);
    
    // Create temporary container
    const container = document.createElement('div');
    container.id = 'latex-temp-container';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.padding = '20px';
    container.style.border = '1px solid #ccc';
    container.style.backgroundColor = '#fff';
    container.style.fontSize = '18px';
    container.style.lineHeight = '1.4';
    container.style.fontFamily = 'Times, "Times New Roman", serif';
    container.style.whiteSpace = 'pre-wrap';
    container.style.maxWidth = '800px';
    document.body.appendChild(container);
    
    try {
      // Render LaTeX using KaTeX in display mode
      katex.render(cleanedLatex, container, {
        throwOnError: false,
        displayMode: true
      });
      
      // Wait a bit for rendering
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Capture as canvas
      const canvas = await html2canvas(container, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true
      });
      
      // Convert to data URL
      const imageDataUrl = canvas.toDataURL('image/png');
      
      console.log('✅ Display LaTeX rendered successfully to image');
      return imageDataUrl;
      
    } finally {
      // Clean up
      document.body.removeChild(container);
    }
    
  } catch (error) {
    console.error('❌ Failed to render display LaTeX:', error);
    throw error;
  }
};

// Parse LaTeX document and extract math expressions
export const parseLatexDocument = (latexDocument: string): Array<{ type: 'text' | 'math' | 'display-math'; content: string }> => {
  console.log('📝 Parsing LaTeX document...');
  
  const content: Array<{ type: 'text' | 'math' | 'display-math'; content: string }> = [];
  let text = latexDocument;
  
  // Remove LaTeX document structure
  text = text.replace(/\\documentclass\{[^}]+\}/g, '');
  text = text.replace(/\\usepackage\{[^}]+\}/g, '');
  text = text.replace(/\\begin\{document\}/g, '');
  text = text.replace(/\\end\{document\}/g, '');
  
  // Find all math expressions
  const mathExpressions: Array<{ type: 'math' | 'display-math'; content: string; start: number; end: number }> = [];
  
  // Find display math blocks
  const displayMathRegex = /\\begin\{align\*\}([^]+?)\\end\{align\*\}/g;
  let match;
  while ((match = displayMathRegex.exec(text)) !== null) {
    mathExpressions.push({
      type: 'display-math',
      content: match[1].trim(),
      start: match.index,
      end: match.index + match[0].length
    });
  }
  
  // Find display math with \[ \]
  const displayMathBracketRegex = /\\\[([^\]]+)\\\]/g;
  while ((match = displayMathBracketRegex.exec(text)) !== null) {
    mathExpressions.push({
      type: 'display-math',
      content: match[1].trim(),
      start: match.index,
      end: match.index + match[0].length
    });
  }
  
  // Find inline math with \( \)
  const inlineMathParenRegex = /\\\(([^)]+)\\\)/g;
  while ((match = inlineMathParenRegex.exec(text)) !== null) {
    mathExpressions.push({
      type: 'math',
      content: match[1].trim(),
      start: match.index,
      end: match.index + match[0].length
    });
  }
  
  // Find inline math with $ $
  const inlineMathDollarRegex = /\$([^$]+)\$/g;
  while ((match = inlineMathDollarRegex.exec(text)) !== null) {
    mathExpressions.push({
      type: 'math',
      content: match[1].trim(),
      start: match.index,
      end: match.index + match[0].length
    });
  }
  
  // Sort by position
  mathExpressions.sort((a, b) => a.start - b.start);
  
  // Build content array
  let lastIndex = 0;
  for (const mathExpr of mathExpressions) {
    // Add text before this math expression
    if (mathExpr.start > lastIndex) {
      const textBefore = text.substring(lastIndex, mathExpr.start).trim();
      if (textBefore) {
        content.push({ type: 'text', content: textBefore });
      }
    }
    
    // Add the math expression
    content.push({ type: mathExpr.type, content: mathExpr.content });
    lastIndex = mathExpr.end;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    const remaining = text.substring(lastIndex).trim();
    if (remaining) {
      content.push({ type: 'text', content: remaining });
    }
  }
  
  console.log(`📝 Parsed into ${content.length} items:`, content.map(item => `${item.type}: ${item.content.substring(0, 50)}...`));
  
  return content;
};

// Test function
export const testLatexRendering = async (): Promise<void> => {
  console.log('🧪 Testing LaTeX rendering...');
  
  try {
    const testLatex = '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}';
    const imageDataUrl = await renderLatexToImage(testLatex);
    console.log('✅ Test successful! Image data URL length:', imageDataUrl.length);
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Make test function available globally
(window as any).testLatexRendering = testLatexRendering;
