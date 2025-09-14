import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PdfDoc, mockPdfDocs } from '../types/pdf';

interface PdfContextType {
  pdfs: PdfDoc[];
  addPdf: (pdf: Omit<PdfDoc, 'id'>) => void;
  updatePdf: (id: string, updates: Partial<PdfDoc>) => void;
  deletePdf: (id: string) => void;
  getPdfById: (id: string) => PdfDoc | undefined;
}

const PdfContext = createContext<PdfContextType | undefined>(undefined);

interface PdfProviderProps {
  children: ReactNode;
}

export const PdfProvider: React.FC<PdfProviderProps> = ({ children }) => {
  const [pdfs, setPdfs] = useState<PdfDoc[]>(mockPdfDocs);

  const addPdf = (newPdf: Omit<PdfDoc, 'id'>) => {
    const pdfWithId: PdfDoc = {
      ...newPdf,
      id: Date.now().toString() // Simple ID generation for demo
    };
    setPdfs(prev => [pdfWithId, ...prev]);
  };

  const updatePdf = (id: string, updates: Partial<PdfDoc>) => {
    setPdfs(prev => 
      prev.map(pdf => 
        pdf.id === id ? { ...pdf, ...updates } : pdf
      )
    );
  };

  const deletePdf = (id: string) => {
    setPdfs(prev => prev.filter(pdf => pdf.id !== id));
  };

  const getPdfById = (id: string) => {
    return pdfs.find(pdf => pdf.id === id);
  };

  return (
    <PdfContext.Provider 
      value={{
        pdfs,
        addPdf,
        updatePdf,
        deletePdf,
        getPdfById
      }}
    >
      {children}
    </PdfContext.Provider>
  );
};

export const usePdfs = () => {
  const context = useContext(PdfContext);
  if (context === undefined) {
    throw new Error('usePdfs must be used within a PdfProvider');
  }
  return context;
};
