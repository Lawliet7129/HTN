export type PdfDoc = {
  id: string;
  title: string;        // e.g., "Week 3: Induction"
  author?: string;      // optional
  updatedAt: string;    // ISO
  pages?: number;
  coverUrl?: string;    // optional; fallback to placeholder
  tags?: string[];
};

// Mock data for initial state
export const mockPdfDocs: PdfDoc[] = [
  {
    id: '1',
    title: 'CIS 3200 HW 2',
    author: 'Computer Science Department',
    updatedAt: '2024-03-15T14:20:00Z',
    pages: 8,
    coverUrl: '/sample-pdfs/CIS_3200_HW_2.pdf', // Now using PDF.js to generate thumbnail
    tags: ['computer-science', 'homework', 'algorithms', 'latex']
  },
  {
    id: '2',
    title: 'Week 1: Introduction to Calculus',
    author: 'Dr. Smith',
    updatedAt: '2024-01-15T10:30:00Z',
    pages: 45,
    coverUrl: '/sample-pdfs/CIS_3200_HW_2.pdf', // Using same PDF for demo
    tags: ['calculus', 'mathematics', 'week1']
  },
  {
    id: '3',
    title: 'Week 2: Limits and Continuity',
    author: 'Dr. Smith',
    updatedAt: '2024-01-22T14:15:00Z',
    pages: 52,
    coverUrl: '/sample-pdfs/CIS_3200_HW_2.pdf', // Using same PDF for demo
    tags: ['calculus', 'mathematics', 'week2']
  },
  {
    id: '4',
    title: 'Week 3: Induction',
    author: 'Dr. Johnson',
    updatedAt: '2024-01-29T09:45:00Z',
    pages: 38,
    coverUrl: '/sample-pdfs/CIS_3200_HW_2.pdf', // Using same PDF for demo
    tags: ['mathematics', 'induction', 'week3']
  },
  {
    id: '5',
    title: 'Linear Algebra Basics',
    author: 'Prof. Davis',
    updatedAt: '2024-02-05T16:20:00Z',
    pages: 67,
    coverUrl: '/sample-pdfs/CIS_3200_HW_2.pdf', // Using same PDF for demo
    tags: ['linear-algebra', 'mathematics']
  },
  {
    id: '6',
    title: 'Physics Lab Manual',
    author: 'Dr. Wilson',
    updatedAt: '2024-02-12T11:10:00Z',
    pages: 89,
    coverUrl: '/sample-pdfs/CIS_3200_HW_2.pdf', // Using same PDF for demo
    tags: ['physics', 'lab', 'experiments']
  },
  {
    id: '7',
    title: 'Chemistry Safety Guidelines',
    author: 'Safety Committee',
    updatedAt: '2024-02-19T13:30:00Z',
    pages: 23,
    coverUrl: '/sample-pdfs/CIS_3200_HW_2.pdf', // Using same PDF for demo
    tags: ['chemistry', 'safety', 'guidelines']
  },
  {
    id: '8',
    title: 'History of Science',
    author: 'Dr. Brown',
    updatedAt: '2024-02-26T15:45:00Z',
    pages: 156,
    coverUrl: '/sample-pdfs/CIS_3200_HW_2.pdf', // Using same PDF for demo
    tags: ['history', 'science', 'general']
  },
  {
    id: '9',
    title: 'Research Methods',
    author: 'Dr. Taylor',
    updatedAt: '2024-03-05T12:00:00Z',
    pages: 78,
    coverUrl: '/sample-pdfs/CIS_3200_HW_2.pdf', // Using same PDF for demo
    tags: ['research', 'methods', 'academic']
  },
  {
    id: '10',
    title: 'Statistics Fundamentals',
    author: 'Dr. Anderson',
    updatedAt: '2024-03-12T14:30:00Z',
    pages: 94,
    coverUrl: '/sample-pdfs/CIS_3200_HW_2.pdf', // Using same PDF for demo
    tags: ['statistics', 'mathematics', 'fundamentals']
  }
];
