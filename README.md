# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# LaTeX Resume Editor

A modern, no-code LaTeX resume editor built with React, FastAPI, and Supabase. Create professional resumes with fine-tuned layout control, live preview, and PDF export.

## 🚀 Features

- **No-code editing**: Visual editor with drag-and-drop sections
- **LaTeX quality**: Professional typesetting powered by Tectonic
- **Live preview**: See changes in real-time
- **Fine-tuned control**: Adjust margins, spacing, fonts, and layout
- **Multiple resumes**: Save and manage multiple resume versions
- **Modern auth**: Secure authentication with Supabase
- **Fast performance**: JWT signing keys for sub-2ms auth verification

## 🛠 Tech Stack

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- React Router
- Supabase Client

**Backend:**
- FastAPI
- Tectonic LaTeX Engine
- Python 3.9+

**Database & Auth:**
- Supabase (PostgreSQL + Auth + Storage)

## 📦 Installation

### Prerequisites

1. **Tectonic LaTeX Engine**: Install from [tectonic-typesetting.io](https://tectonic-typesetting.io/install.html)
2. **Node.js 18+**: [nodejs.org](https://nodejs.org)
3. **Python 3.9+**: [python.org](https://python.org)
4. **Supabase Account**: [supabase.com](https://supabase.com)

### Frontend Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your Supabase credentials to .env.local
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:8000

# Start development server
npm run dev
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python main.py
```

### Database Setup

1. Create a new Supabase project
2. Run the migration script in your Supabase SQL editor:
   ```sql
   -- Copy and paste contents from supabase/migrations/001_initial_schema.sql
   ```
3. Enable JWT Signing Keys in Supabase Dashboard:
   - Go to Settings → JWT Keys
   - Click "Migrate to JWT Signing Keys"
   - Generate new API keys
   - Update your `.env.local` with the new keys

## 📁 Project Structure

### Frontend (`src/`)
```
src/
├── components/           # Reusable UI components
│   ├── Header.jsx       # App header with navigation
│   ├── Layout.jsx       # Main layout wrapper
│   ├── LoadingSpinner.jsx # Loading indicator
│   ├── EditorSidebar.jsx # Resume editor sidebar
│   └── ResumePreview.jsx # PDF-style preview
├── contexts/
│   └── AuthContext.jsx  # Authentication state management
├── lib/
│   └── supabase.js      # Supabase client config
├── pages/               # Main page components
│   ├── LoginPage.jsx    # User authentication
│   ├── SignUpPage.jsx   # User registration
│   ├── Dashboard.jsx    # Resume management dashboard
│   └── ResumeEditor.jsx # Main editor interface
├── App.jsx              # Root app component with routing
├── main.jsx            # React app entry point
└── index.css           # Global styles and Tailwind
```

### Backend (`backend/`)
```
backend/
├── main.py              # FastAPI app with LaTeX compilation
├── requirements.txt     # Python dependencies
└── [generated files]    # Temporary LaTeX/PDF files
```

### Database (`supabase/`)
```
supabase/
└── migrations/
    └── 001_initial_schema.sql # Database schema and RLS policies
```

## 🔧 Configuration Files

- **package.json**: Frontend dependencies and scripts
- **vite.config.js**: Vite build configuration  
- **tailwind.config.js**: Tailwind CSS customization
- **postcss.config.js**: PostCSS configuration
- **.env.example**: Environment variables template

## 🗄 Database Schema

- **users**: User profiles (extends Supabase Auth)
- **resumes**: Resume metadata (title, timestamps)
- **resume_data**: Resume content (JSONB with layout + sections)

## 🚀 Usage

1. **Sign up/Login**: Create account or sign in
2. **Create Resume**: Click "New Resume" on dashboard
3. **Edit Content**: Use the sidebar to edit sections
4. **Customize Layout**: Adjust spacing, fonts, margins in Settings
5. **Preview**: See live preview on the right panel
6. **Export PDF**: Click "Export PDF" to download

## 🎨 Customization

### Adding Your LaTeX Template

Replace the template in `backend/main.py` in the `generate_latex()` function with your custom LaTeX code from Overleaf. The function receives structured data and should return LaTeX code.

### Styling

Modify `src/index.css` and `tailwind.config.js` for custom colors, fonts, and styling.

## 🔒 Authentication & Security

- Row Level Security (RLS) policies ensure users only access their data
- JWT signing keys provide fast local token validation
- Modern Supabase Auth with email/password and OAuth options

## 📊 Performance

- **Auth verification**: ~2ms (with JWT signing keys vs ~1s with legacy)
- **Local development**: Hot reload with Vite
- **Production build**: Optimized bundle with tree-shaking

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Troubleshooting

**Tectonic not found:**
```bash
# Install Tectonic
curl --proto '=https' --tlsv1.2 -fsSL https://drop-sh.fullyjustified.net | sh
```

**Supabase connection issues:**
- Verify your `.env.local` has correct Supabase URL and keys
- Check if JWT signing keys are enabled in Supabase dashboard

**PDF compilation fails:**
- Ensure Tectonic is in your PATH
- Check FastAPI logs for LaTeX compilation errors