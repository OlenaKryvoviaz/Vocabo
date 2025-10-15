# Vocabo - AI-Powered Flashcard Learning Platform

**Product Portfolio by Olena Kryvoviaz**

A freemium vocabulary learning app that combines AI-powered content generation with subscription monetization. Built to demonstrate modern product strategy, technical architecture, and user experience design.

Check it here ->[https://vocabo-three.vercel.app/](https://vocabo-three.vercel.app/)

Video demo ->

[https://www.loom.com/share/8759b73f5ed64360a560b125c1fb7ee9](https://www.loom.com/share/8759b73f5ed64360a560b125c1fb7ee9)

## 🎯 Product Overview

**Problem**: Traditional flashcard apps lack intelligent content creation and scalable monetization models.

**Solution**: AI-powered flashcard generation with a freemium subscription model that drives user engagement and revenue growth.

## 🚀 Key Achievements

### 💰 Business Strategy
- **Freemium Model**: Free tier (3 decks) → Pro upgrade path (unlimited + AI features)
- **AI Monetization**: Premium AI flashcard generation drives subscription conversions
- **Feature Gating**: Strategic limitations encourage organic upgrade behavior
- **User Retention**: Smart retry system and progress tracking increase engagement

### 🛠 Technical Architecture
- **Modern Stack**: Next.js 15, TypeScript, Drizzle ORM, Neon PostgreSQL
- **AI Integration**: OpenAI GPT-4 with structured content generation
- **Authentication**: Clerk with social login and subscription billing
- **Security**: Enterprise-grade data isolation and ownership verification
- **UI/UX**: Responsive design with shadcn/ui and accessibility standards

### 🎨 Product Features
- **Intelligent Study System**: Spaced repetition with automatic retry for incorrect answers
- **AI Content Generation**: Language-optimized flashcard creation using GPT-4
- **Progress Analytics**: Real-time tracking and performance visualization  
- **Responsive Design**: Cross-platform experience with keyboard shortcuts

## 🏆 Product Management Skills Demonstrated

### 📊 Strategy & Planning
- **Market Analysis**: Identified gap in AI-powered educational tools
- **Feature Prioritization**: Balanced user value with technical complexity
- **Monetization Strategy**: Designed freemium conversion funnel
- **User Journey Mapping**: Optimized onboarding and upgrade paths

### 🔄 Execution & Growth
- **MVP Development**: Shipped core features with iterative improvements
- **A/B Testing Ready**: Feature flags and analytics infrastructure
- **Scalable Architecture**: Built for user growth and feature expansion
- **Security First**: Implemented enterprise-grade data protection

### 🎯 User Experience
- **Accessibility Standards**: WCAG-compliant design system
- **Performance Optimization**: Sub-second load times with modern tooling
- **Error Handling**: User-friendly feedback and recovery flows
- **Mobile-First Design**: Responsive across all device types

---

## 🛠 Technical Stack

**Frontend**: Next.js 15, TypeScript, shadcn/ui, Tailwind CSS  
**Backend**: Neon PostgreSQL, Drizzle ORM, Server Actions  
**Auth & Billing**: Clerk with Stripe integration  
**AI**: OpenAI GPT-4 with Vercel AI SDK  
**Infrastructure**: Serverless deployment ready

---

<details>
<summary>🚀 <strong>Optional: Local Development Setup</strong></summary>

### Prerequisites
- Node.js 18+, Neon Database account, Clerk account, OpenAI API key

### Quick Start
```bash
git clone <repository-url>
cd vocabo && npm install
```

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
DATABASE_URL=your_neon_url
OPENAI_API_KEY=your_openai_key
```

### Run
```bash
npm run db:migrate && npm run dev
```

### Test Key Features
- **Free Plan**: Create 3 decks, test upgrade prompts
- **Pro Plan**: AI generation, unlimited decks  
- **Study Flow**: Keyboard navigation, progress tracking
- **Security**: Test with multiple accounts for data isolation

</details>
