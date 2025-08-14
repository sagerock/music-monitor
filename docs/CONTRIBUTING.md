# Contributing to Music Monitor 🎵

Welcome to the Music Monitor project! This guide will help you contribute effectively to our A&R scouting platform.

## 🎯 Project Mission

We're building an AI-powered tool to help A&R professionals discover fast-rising artists using Spotify data and social signals. Every contribution should align with making artist discovery more efficient and insightful.

## 🚀 Getting Started

### Option 1: GitHub Codespaces (Recommended for Beginners)
1. Click the green "Code" button on GitHub
2. Select "Open with Codespaces"
3. Click "New codespace"
4. Wait for environment to load (2-3 minutes)
5. You're ready to code! No installation needed

### Option 2: Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/sagerock/music-monitor.git
   cd music-monitor
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. Start development servers:
   ```bash
   pnpm dev
   ```

## 🌳 Branching Strategy

We use a simple, beginner-friendly branching model:

```
main (production-ready)
  └── development (integration branch)
       ├── feature/your-name-feature-description
       ├── bugfix/issue-number-description
       └── experiment/testing-new-ideas
```

### Branch Naming Convention
- `feature/indy-artist-notes` - New features
- `bugfix/123-fix-login-error` - Bug fixes (include issue number)
- `experiment/ml-momentum-algorithm` - Experimental features
- `docs/update-readme` - Documentation updates

## 📝 Making Changes

### 1. Create a New Branch
```bash
git checkout development
git pull origin development
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes
- Keep commits small and focused
- Write clear commit messages
- Test your changes locally

### 3. Commit Your Work
```bash
git add .
git commit -m "feat: add artist note system for A&R tracking"
```

#### Commit Message Format
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### 4. Push Your Branch
```bash
git push origin feature/your-feature-name
```

### 5. Create a Pull Request
1. Go to GitHub repository
2. Click "Pull requests" → "New pull request"
3. Select your branch
4. Fill out the PR template
5. Request review from team members

## 🎓 For Beginners (Learning Path)

### Your First Contribution
1. Start with a "good first issue" label
2. Read related code before making changes
3. Ask questions in PR comments - we're here to help!
4. Don't worry about perfection - we'll guide you

### Code Review Learning
- Every PR is a learning opportunity
- Read comments as constructive feedback
- Ask "why" if you don't understand
- Apply lessons to future contributions

### Pair Programming Sessions
- Weekly Live Share sessions available
- Screen sharing for complex features
- Real-time collaboration and learning

## 🏗️ Project Structure

```
music-monitor/
├── frontend/          # Next.js React app
│   ├── src/
│   │   ├── app/      # Page routes
│   │   ├── components/ # React components
│   │   └── lib/      # Utilities & API client
├── backend/           # Fastify API server
│   ├── src/
│   │   ├── api/      # API endpoints
│   │   ├── services/ # Business logic
│   │   └── integrations/ # External APIs
└── docs/              # Documentation
```

## 💻 Development Guidelines

### Frontend (React/Next.js)
- Use functional components with hooks
- Keep components small and focused
- Use Tailwind CSS for styling
- Follow existing component patterns

### Backend (Fastify/Node.js)
- Keep endpoints RESTful
- Add proper error handling
- Document API changes
- Write efficient database queries

### Database (PostgreSQL/Prisma)
- Always create migrations for schema changes
- Use meaningful table and column names
- Add appropriate indexes
- Document relationships

## 🧪 Testing

### Before Submitting PR
1. Test all changes locally
2. Check for console errors
3. Verify API endpoints work
4. Test on different screen sizes (frontend)
5. Run linting: `pnpm lint`

## 📚 Learning Resources

### Internal Docs
- [LEARNING_PATH.md](./LEARNING_PATH.md) - Structured learning journey
- [AR_FEATURES.md](./AR_FEATURES.md) - A&R-specific feature ideas
- [CLAUDE.md](./CLAUDE.md) - AI assistant guidelines

### External Resources
- [React Documentation](https://react.dev)
- [Next.js Tutorial](https://nextjs.org/learn)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)

## 🤝 Code of Conduct

### We Value
- **Respect**: Treat everyone with kindness
- **Learning**: Mistakes are opportunities to grow
- **Collaboration**: We succeed together
- **Innovation**: Creative A&R solutions welcome
- **Quality**: Write code you're proud of

### Communication
- Be patient with beginners
- Share knowledge generously
- Celebrate small wins
- Ask questions freely
- Provide constructive feedback

## 🎵 A&R-Specific Contributions

We especially welcome features that help with:
- Artist discovery algorithms
- Genre analysis tools
- Social signal integration
- Momentum tracking improvements
- Industry-specific metrics
- Label tracking features
- Playlist analysis
- Tour data integration

## 📮 Getting Help

### Where to Ask Questions
- **GitHub Issues**: For bugs and feature requests
- **Pull Request Comments**: For code-specific questions
- **Discussions**: For general questions and ideas
- **Live Share Sessions**: For real-time help

### Response Times
- PR Reviews: Within 24-48 hours
- Questions: Usually within 24 hours
- Urgent Issues: Tag with "urgent" label

## 🚢 Release Process

1. Features merged to `development` branch
2. Weekly integration to `main` branch
3. Automatic deployment to production
4. Release notes published

## 🏆 Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- Monthly highlight in team updates

## 🔄 Keeping Your Fork Updated

```bash
# Add upstream remote (one time)
git remote add upstream https://github.com/sagerock/music-monitor.git

# Sync your fork
git fetch upstream
git checkout development
git merge upstream/development
git push origin development
```

## 📈 Next Steps

1. Join our GitHub repository
2. Pick an issue labeled "good first issue"
3. Set up your development environment
4. Make your first contribution
5. Celebrate! 🎉

---

Remember: Every expert was once a beginner. We're excited to help you learn and grow while building something meaningful for the music industry!

**Questions?** Open an issue with the "question" label, and we'll help you get started.