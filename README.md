# Vocabo - Smart Flashcard Learning App

**A portfolio project by Olena Kryvoviaz**

Vocabo is a modern flashcard application built with Next.js that helps people learn effectively through spaced repetition and interactive study sessions. Create custom decks, add flashcards, and study at your own pace with a clean, intuitive interface.

## ✨ Features

- 🎯 **Smart Study Sessions** - Interactive flashcard study mode
- 📚 **Custom Deck Creation** - Organize your learning materials
- 🔐 **Secure Authentication** - User accounts with Clerk
- 💾 **Persistent Storage** - Your progress is saved with Neon Database
- 🎨 **Modern UI** - Built with shadcn/ui components
- ⚡ **Fast Performance** - Powered by Next.js 15 with Turbopack

## 🚀 Quick Start & Testing

### Prerequisites
- Node.js 18+ installed
- A Neon Database account (for database)
- A Clerk account (for authentication)

### 1. Clone & Install
```bash
git clone <repository-url>
cd vocabo
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory with the following variables:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Database
DATABASE_URL=your_neon_database_connection_string
```

### 3. Database Setup
```bash
# Generate database schema
npm run db:generate

# Run migrations
npm run db:migrate
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start using the app!

## 🧪 Testing the App

1. **Sign Up/Sign In** - Create an account or sign in with your existing credentials
2. **Create a Deck** - Click "Create New Deck" on the dashboard
3. **Add Cards** - Add flashcards with questions and answers
4. **Study Mode** - Click "Study" to start an interactive learning session
5. **Track Progress** - See your deck statistics and study history

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: Clerk
- **UI Components**: shadcn/ui + Tailwind CSS
- **Language**: TypeScript
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── db/                  # Database schema and queries
├── actions/             # Server actions
└── lib/                 # Utility functions
```

## 🔧 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:studio    # Open Drizzle Studio (database GUI)
npm run lint         # Run ESLint
```

## 📝 About This Project

This is a portfolio project demonstrating modern web development practices including:
- Server-side rendering with Next.js
- Type-safe database operations with Drizzle ORM
- Secure authentication flows with Clerk
- Responsive design with Tailwind CSS
- Form handling and validation

Built with ❤️ by **Olena Kryvoviaz** as a showcase of full-stack development skills.
