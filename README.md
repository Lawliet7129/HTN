# 3D Virtual Classroom

A Three.js-based 3D classroom environment with AI-powered LaTeX conversion and collaborative learning features.

## 🎯 Project Overview

I'm building a 3D classroom in Three.js using .glb models. The classroom has three main interactive areas that create an immersive educational experience:

### 📚 Bookshelf - AI-Powered Material Creation
Educators can upload materials here. A key feature is the ability to scan handwritten barebones proofs or notes. AI will process these, recognize the handwriting, and automatically generate a polished, rigorous LaTeX version. Educators can then publish these as PDFs or study materials within minutes, making them accessible to students directly on the 3D shelf.

### 📋 Bulletin Board - Collaborative Learning Forum
Functions like an Ed-style Q&A forum. Both students and educators can post questions, answers, and discussions, making it a collaborative learning space.

### 🖥️ Desk - Scheduling Integration Hub
Acts as an integration point with scheduling tools like Calendly or Zoom. Students can use it to book office hours, tutoring sessions, or group meetings with educators.

## ⚡ Core Innovation: LaTeX Pipeline

The core feature of the project is the **LaTeX pipeline**: educators upload handwritten notes, and the AI transforms them into rigorously formatted LaTeX documents that can be published in under five minutes. This enables a seamless workflow from handwritten draft to professional study material.

### Pipeline Workflow
1. **Upload** → Educator scans handwritten notes
2. **Process** → AI recognizes handwriting and extracts content
3. **Convert** → Generate polished LaTeX with proper formatting
4. **Publish** → Create PDF and make available on 3D bookshelf
5. **Access** → Students interact with materials in immersive 3D environment

## 🏗️ Project Architecture

The project is organized into four main components that work together to create the complete 3D classroom experience:

### 🎨 Frontend (`/frontend`)
**Three.js-based 3D classroom interface with interactive areas:**
- **Classroom Components**: 3D scene rendering, camera controls, and interaction systems
- **Bookshelf**: Material upload interface, AI processing pipeline, and LaTeX document management
- **Bulletin Board**: Q&A forum with posts, comments, and moderation features
- **Desk**: Scheduling integration with Calendly/Zoom for office hours and meetings

### ⚙️ Backend (`/backend`)
**Node.js/Express server handling core functionality:**
- **File Processing**: Upload handling, image preprocessing for AI analysis
- **AI Services**: Handwriting recognition and LaTeX conversion pipeline management
- **PDF Generation**: LaTeX compilation and document publishing
- **Authentication**: User management and session handling
- **API Controllers**: RESTful endpoints for all classroom features

### 🗄️ Database (`/database`)
**Data persistence layer for all classroom data:**
- **Migrations**: Database schema versioning and updates
- **Seeds**: Initial data and test fixtures
- **Models**: User data, study materials, forum posts, scheduling information

### 🤖 APIs (`/apis`)
**Specialized microservices for advanced functionality:**
- **Handwriting Recognition**: AI model integration for text extraction from images
- **LaTeX Conversion**: Document formatting, validation, and compilation
- **External Integrations**: Calendly, Zoom, Google Calendar API connections

## ✨ Key Features

### 🤖 AI-Powered LaTeX Pipeline
The revolutionary core feature that transforms handwritten content into professional documents:
1. **Upload**: Educators scan handwritten notes/images using the 3D bookshelf interface
2. **Recognition**: AI processes handwriting and extracts mathematical formulas and text
3. **Conversion**: Automatic LaTeX formatting with proper mathematical notation
4. **Publishing**: Generate professional PDFs and publish to classroom bookshelf
5. **Access**: Students interact with materials directly in the immersive 3D environment

### 🎮 Interactive Learning Spaces
- **3D Bookshelf**: Browse, search, and access AI-generated study materials in an immersive 3D interface
- **Bulletin Board**: Collaborative Q&A forum with real-time discussions and peer learning
- **Virtual Desk**: Seamless scheduling integration for office hours, tutoring, and group meetings

### 🔄 Seamless Workflow Integration
- **5-Minute Publishing**: From handwritten draft to professional study material in under 5 minutes
- **Real-time Collaboration**: Instant access to materials and discussions
- **Cross-platform Access**: Works on desktop, tablet, and mobile devices

## 🛠️ Technology Stack

- **Frontend**: Three.js, React, TypeScript
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **AI/ML**: Python services for handwriting recognition
- **LaTeX**: TeX Live for document compilation
- **Deployment**: Node.js with PM2 process management

## 📁 Detailed Folder Structure

```
HTN/
├── frontend/                    # Three.js 3D classroom interface
│   ├── src/
│   │   ├── components/
│   │   │   ├── classroom/       # 3D scene and interactions
│   │   │   ├── bookshelf/       # Material management
│   │   │   ├── bulletin/        # Q&A forum
│   │   │   └── desk/           # Scheduling interface
│   │   ├── utils/              # Helper functions
│   │   ├── assets/             # 3D models, textures, audio
│   │   └── styles/             # CSS and styling
│   └── public/                 # Static assets
├── backend/                    # Node.js server
│   ├── src/
│   │   ├── controllers/        # API route handlers
│   │   ├── services/          # Business logic
│   │   ├── models/            # Data models
│   │   ├── middleware/        # Auth, validation, etc.
│   │   ├── routes/            # API endpoints
│   │   └── utils/             # Server utilities
│   ├── uploads/               # File storage
│   └── temp/                  # Temporary processing files
├── database/                  # Data persistence
│   ├── migrations/            # Schema changes
│   └── seeds/                 # Test data
├── apis/                      # Microservices
│   ├── handwriting-recognition/ # AI text extraction
│   ├── latex-conversion/      # Document formatting
│   └── external-integrations/ # Third-party APIs
├── docs/                      # Documentation
├── scripts/                   # Setup and deployment
└── tests/                     # Test suites
```

## 🚀 Quick Start

1. **Setup Environment**
   ```bash
   ./scripts/setup/install-dependencies.sh
   ```

2. **Start Services**
   ```bash
   # Start PostgreSQL and Redis
   brew services start postgresql redis  # macOS
   # or
   sudo systemctl start postgresql redis  # Linux
   ```

3. **Configure Database**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

5. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - AI Services: http://localhost:5000-5002
   - Database: localhost:5432

## 📚 Documentation

- [API Documentation](./docs/api/)
- [Deployment Guide](./docs/deployment/)
- [User Guide](./docs/user-guide/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details