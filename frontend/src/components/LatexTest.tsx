import React, { useState, useEffect } from 'react';
import { renderLatexToImage, renderDisplayLatexToImage } from '../utils/latexRenderer';

export const LatexTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testInlineMath = async () => {
    setIsLoading(true);
    try {
      addResult('Testing inline math: ∑_{i=1}^{n} i = \\frac{n(n+1)}{2}');
      const imageDataUrl = await renderLatexToImage('\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}');
      addResult(`✅ Inline math rendered successfully! Image size: ${imageDataUrl.length} characters`);
      
      // Display the image
      const img = document.createElement('img');
      img.src = imageDataUrl;
      img.style.maxWidth = '300px';
      img.style.border = '1px solid #ccc';
      img.style.margin = '10px';
      document.body.appendChild(img);
    } catch (error) {
      addResult(`❌ Inline math failed: ${error}`);
    }
    setIsLoading(false);
  };

  const testDisplayMath = async () => {
    setIsLoading(true);
    try {
      const displayMath = `\\begin{align*}
\\sum_{i=1}^{k+1} i &= (k + 1) + \\sum_{i=1}^{k} i \\\\
&= (k + 1) + \\frac{k(k + 1)}{2} \\\\
&= \\frac{(k + 1)(k + 2)}{2}
\\end{align*}`;
      
      addResult('Testing display math with align environment');
      const imageDataUrl = await renderDisplayLatexToImage(displayMath);
      addResult(`✅ Display math rendered successfully! Image size: ${imageDataUrl.length} characters`);
      
      // Display the image
      const img = document.createElement('img');
      img.src = imageDataUrl;
      img.style.maxWidth = '400px';
      img.style.border = '1px solid #ccc';
      img.style.margin = '10px';
      document.body.appendChild(img);
    } catch (error) {
      addResult(`❌ Display math failed: ${error}`);
    }
    setIsLoading(false);
  };

  const testComplexMath = async () => {
    setIsLoading(true);
    try {
      const complexMath = '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}';
      addResult('Testing complex math: integral');
      const imageDataUrl = await renderLatexToImage(complexMath);
      addResult(`✅ Complex math rendered successfully! Image size: ${imageDataUrl.length} characters`);
      
      // Display the image
      const img = document.createElement('img');
      img.src = imageDataUrl;
      img.style.maxWidth = '300px';
      img.style.border = '1px solid #ccc';
      img.style.margin = '10px';
      document.body.appendChild(img);
    } catch (error) {
      addResult(`❌ Complex math failed: ${error}`);
    }
    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
    // Remove all test images
    const images = document.querySelectorAll('img[src^="data:image/png"]');
    images.forEach(img => img.remove());
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>LaTeX Rendering Test</h2>
      <p>This component tests KaTeX LaTeX rendering with html2canvas.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testInlineMath} 
          disabled={isLoading}
          style={{ margin: '5px', padding: '10px 15px' }}
        >
          Test Inline Math
        </button>
        <button 
          onClick={testDisplayMath} 
          disabled={isLoading}
          style={{ margin: '5px', padding: '10px 15px' }}
        >
          Test Display Math
        </button>
        <button 
          onClick={testComplexMath} 
          disabled={isLoading}
          style={{ margin: '5px', padding: '10px 15px' }}
        >
          Test Complex Math
        </button>
        <button 
          onClick={clearResults} 
          style={{ margin: '5px', padding: '10px 15px', backgroundColor: '#f44336', color: 'white' }}
        >
          Clear Results
        </button>
      </div>

      {isLoading && <p>🔄 Testing LaTeX rendering...</p>}

      <div style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
        <h3>Test Results:</h3>
        {testResults.length === 0 ? (
          <p>No tests run yet. Click a button above to test LaTeX rendering.</p>
        ) : (
          testResults.map((result, index) => (
            <div key={index} style={{ marginBottom: '5px', fontFamily: 'monospace', fontSize: '12px' }}>
              {result}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Click "Test Inline Math" to test simple inline LaTeX</li>
          <li>Click "Test Display Math" to test complex align environment</li>
          <li>Click "Test Complex Math" to test integrals and other symbols</li>
          <li>Check if images appear below the buttons</li>
          <li>If images appear, KaTeX is working correctly!</li>
        </ol>
      </div>
    </div>
  );
};
