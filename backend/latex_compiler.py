import tempfile
import os
from pathlib import Path
from typing import Optional
import subprocess
import shutil

def compile_latex_to_pdf(latex_content: str, output_filename: Optional[str] = None) -> bytes:
    """
    Compile LaTeX content to PDF using pdflatex.
    
    Args:
        latex_content: The LaTeX source code
        output_filename: Optional filename for the PDF (without extension)
        
    Returns:
        PDF bytes
        
    Raises:
        RuntimeError: If LaTeX compilation fails
    """
    # Create temporary directory
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        
        # Set output filename
        if output_filename is None:
            output_filename = "document"
        
        # Write LaTeX content to file
        tex_file = temp_path / f"{output_filename}.tex"
        with open(tex_file, 'w', encoding='utf-8') as f:
            f.write(latex_content)
        
        # Compile LaTeX to PDF using pdflatex
        try:
            # Run pdflatex command
            result = subprocess.run([
                '/Library/TeX/texbin/pdflatex',
                '-interaction=nonstopmode',
                '-output-directory', str(temp_path),
                str(tex_file)
            ], 
            capture_output=True, 
            text=True, 
            cwd=temp_path
            )
            
            if result.returncode != 0:
                error_msg = f"LaTeX compilation failed:\n{result.stdout}\n{result.stderr}"
                print(f"LaTeX compilation error: {error_msg}")
                raise RuntimeError(error_msg)
            
            # Read the generated PDF
            pdf_file = temp_path / f"{output_filename}.pdf"
            if not pdf_file.exists():
                raise RuntimeError("PDF file was not generated")
            
            with open(pdf_file, 'rb') as f:
                pdf_bytes = f.read()
            
            print(f"✅ Successfully compiled LaTeX to PDF ({len(pdf_bytes)} bytes)")
            return pdf_bytes
            
        except FileNotFoundError:
            raise RuntimeError("pdflatex not found. Please install LaTeX distribution (e.g., TeX Live, MiKTeX)")
        except Exception as e:
            raise RuntimeError(f"LaTeX compilation failed: {str(e)}")

def check_latex_installation() -> bool:
    """
    Check if LaTeX (pdflatex) is installed and available.
    
    Returns:
        True if pdflatex is available, False otherwise
    """
    try:
        result = subprocess.run(['/Library/TeX/texbin/pdflatex', '--version'], 
                              capture_output=True, 
                              text=True, 
                              timeout=10)
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False

# Test function
if __name__ == "__main__":
    # Test LaTeX compilation
    test_latex = r"""
\documentclass{article}
\usepackage{amsmath}
\usepackage{amssymb}
\begin{document}

There are plenty of other examples. In general, an inductive proof of a claim \( P \) consists of proving that a base case (BC) holds (usually \( P(0) \) or \( P(1) \)), making an induction hypothesis (IH) that assumes that \( P(k) \) is true for some value \( k \) that is greater than or equal to the base case, and lastly an induction step (IS) which uses the IH to prove that \( P(k + 1) \) holds.

\textbf{Example.} Prove via induction that \( \sum_{i=1}^{n} i = \frac{n(n+1)}{2} \).

\textbf{Solution.} We proceed via induction on \( n \).

\textbf{Base Case:} The base case occurs when \( n = 1 \). \( \sum_{i=1}^{1} i = 1 \) and \( \frac{1(1+1)}{2} = 1 \), and so the claim holds in the base case.

\textbf{Induction Hypothesis:} Assume that for some integer \( k \geq 1 \) we have that \( \sum_{i=1}^{k} i = \frac{k(k+1)}{2} \).

\textbf{Induction Step:} We must show that \( \sum_{i=1}^{k+1} i = \frac{(k+1)(k+2)}{2} \). Indeed:
\begin{align*}
\sum_{i=1}^{k+1} i &= (k + 1) + \sum_{i=1}^{k} i \\
&= (k + 1) + \frac{k(k + 1)}{2} \\
&= \frac{2(k + 1) + k(k + 1)}{2} \\
&= \frac{(k + 1)(2 + k)}{2} \\
&= \frac{(k + 1)(k + 2)}{2}
\end{align*}
(by the induction hypothesis).

\end{document}
"""
    
    print("Checking LaTeX installation...")
    if check_latex_installation():
        print("✅ LaTeX (pdflatex) is installed")
        try:
            pdf_bytes = compile_latex_to_pdf(test_latex, "test_document")
            print(f"✅ Test compilation successful! Generated {len(pdf_bytes)} bytes")
        except Exception as e:
            print(f"❌ Test compilation failed: {e}")
    else:
        print("❌ LaTeX (pdflatex) is not installed")
        print("Please install a LaTeX distribution:")
        print("- macOS: brew install --cask mactex")
        print("- Ubuntu/Debian: sudo apt-get install texlive-full")
        print("- Windows: Install MiKTeX or TeX Live")
