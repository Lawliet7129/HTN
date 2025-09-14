#!/bin/bash

# 3D Virtual Classroom - Dependency Installation Script
# This script installs all necessary dependencies for the project

set -e

echo "🚀 Setting up 3D Virtual Classroom dependencies..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
if [ ! -f package.json ]; then
    echo "Creating frontend package.json..."
    npm init -y
    npm install --save-dev @types/react @types/react-dom @types/three
    npm install react react-dom three @react-three/fiber @react-three/drei
    npm install --save-dev typescript @vitejs/plugin-react vite
fi
npm install
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -f package.json ]; then
    echo "Creating backend package.json..."
    npm init -y
    npm install express cors helmet morgan dotenv
    npm install --save-dev @types/express @types/cors @types/morgan @types/node
    npm install --save-dev typescript ts-node nodemon
    npm install prisma @prisma/client
    npm install multer sharp
    npm install jsonwebtoken bcryptjs
    npm install --save-dev @types/jsonwebtoken @types/bcryptjs
fi
npm install
cd ..

# Install AI service dependencies
echo "📦 Installing AI service dependencies..."
cd apis/handwriting-recognition
if [ ! -f requirements.txt ]; then
    echo "Creating Python requirements..."
    cat > requirements.txt << EOF
flask==2.3.3
flask-cors==4.0.0
torch==2.0.1
torchvision==0.15.2
opencv-python==4.8.1.78
Pillow==10.0.1
numpy==1.24.3
pytesseract==0.3.10
transformers==4.33.2
EOF
fi

if command -v pip3 &> /dev/null; then
    pip3 install -r requirements.txt
elif command -v pip &> /dev/null; then
    pip install -r requirements.txt
else
    echo "⚠️  Python pip not found. Please install Python dependencies manually."
fi
cd ../..

# Install LaTeX service dependencies
echo "📦 Installing LaTeX service dependencies..."
cd apis/latex-conversion
if [ ! -f requirements.txt ]; then
    echo "Creating LaTeX service requirements..."
    cat > requirements.txt << EOF
flask==2.3.3
flask-cors==4.0.0
jinja2==3.1.2
pylatex==1.4.2
EOF
fi

if command -v pip3 &> /dev/null; then
    pip3 install -r requirements.txt
elif command -v pip &> /dev/null; then
    pip install -r requirements.txt
else
    echo "⚠️  Python pip not found. Please install Python dependencies manually."
fi
cd ../..

# Install external integrations dependencies
echo "📦 Installing external integrations dependencies..."
cd apis/external-integrations
if [ ! -f requirements.txt ]; then
    echo "Creating integrations requirements..."
    cat > requirements.txt << EOF
flask==2.3.3
flask-cors==4.0.0
requests==2.31.0
google-api-python-client==2.100.0
google-auth-httplib2==0.1.1
google-auth-oauthlib==1.1.0
EOF
fi

if command -v pip3 &> /dev/null; then
    pip3 install -r requirements.txt
elif command -v pip &> /dev/null; then
    pip install -r requirements.txt
else
    echo "⚠️  Python pip not found. Please install Python dependencies manually."
fi
cd ../..

# Check for PostgreSQL
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL found: $(psql --version)"
else
    echo "⚠️  PostgreSQL not found. Please install PostgreSQL for the database."
    echo "   On macOS: brew install postgresql"
    echo "   On Ubuntu: sudo apt-get install postgresql postgresql-contrib"
fi

# Check for Redis
if command -v redis-server &> /dev/null; then
    echo "✅ Redis found: $(redis-server --version | head -n1)"
else
    echo "⚠️  Redis not found. Please install Redis for caching."
    echo "   On macOS: brew install redis"
    echo "   On Ubuntu: sudo apt-get install redis-server"
fi

# Check for LaTeX
if command -v pdflatex &> /dev/null; then
    echo "✅ LaTeX found: $(pdflatex --version | head -n1)"
else
    echo "⚠️  LaTeX not found. Please install TeX Live for PDF generation."
    echo "   On macOS: brew install --cask mactex"
    echo "   On Ubuntu: sudo apt-get install texlive-full"
fi

echo ""
echo "🎉 Dependency installation complete!"
echo ""
echo "Next steps:"
echo "1. Start PostgreSQL and Redis services"
echo "2. Configure environment variables in .env files"
echo "3. Set up the database: npm run db:migrate"
echo "4. Start development: npm run dev"
echo ""
echo "Service startup commands:"
echo "- PostgreSQL: brew services start postgresql (macOS) or sudo systemctl start postgresql (Linux)"
echo "- Redis: brew services start redis (macOS) or sudo systemctl start redis (Linux)"
