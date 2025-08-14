# 🤖 AI Coding Assistant Setup Guide

This guide helps you choose and set up AI coding assistants for the Music Monitor project.

## 🎯 Recommended Setup for Indy

**Best Option**: Use **Claude Code** or **Cursor** locally for primary development
- Full AI assistance while learning
- Better for complex features
- Can reference entire codebase

**Backup Option**: GitHub Codespaces for quick edits
- Works from any computer
- Includes GitHub Copilot
- Good for small changes

## 🖥️ Option 1: Claude Code (Recommended)

### Why Claude Code?
- Same AI that powers our conversations
- Understands the entire project context
- Great for learning - explains code clearly
- Free tier available

### Setup Steps:
1. **Download Claude Code**
   - Go to [claude.ai/download](https://claude.ai/download)
   - Install for Mac/Windows
   
2. **Clone the Repository**
   ```bash
   git clone https://github.com/sagerock/music-monitor.git
   cd music-monitor
   ```

3. **Open in Claude Code**
   - File → Open Folder → Select music-monitor
   
4. **Install Dependencies**
   ```bash
   pnpm install
   ```

5. **Start Coding!**
   ```bash
   pnpm dev
   ```

### Using Claude Code Effectively:
- Press `Cmd+K` (Mac) or `Ctrl+K` (Windows) to ask Claude anything
- Highlight code and ask "What does this do?"
- Say "Help me add [feature]" for guided implementation
- Use "Fix this error: [paste error]" for debugging

## 🎨 Option 2: Cursor AI

### Why Cursor?
- VS Code fork with AI built-in
- Great autocomplete
- Can reference documentation
- Good for rapid development

### Setup Steps:
1. **Download Cursor**
   - Go to [cursor.sh](https://cursor.sh)
   - Install the app

2. **Clone and Open**
   ```bash
   git clone https://github.com/sagerock/music-monitor.git
   ```
   - Open Cursor → Open folder

3. **Configure for Music Monitor**
   - Add to `.cursor/rules` (create if doesn't exist):
   ```
   Project: Music Monitor - A&R Discovery Platform
   Stack: Next.js, React, TypeScript, Tailwind, Fastify
   Style: Functional components, hooks, clean code
   Focus: A&R features for music industry
   ```

### Cursor Tips:
- `Cmd+K`: AI chat
- `Cmd+L`: Generate code
- `Tab`: Accept suggestions
- Reference files with `@filename`

## 💻 Option 3: VS Code + GitHub Copilot

### Setup:
1. **Install VS Code**
   - Download from [code.visualstudio.com](https://code.visualstudio.com)

2. **Install GitHub Copilot**
   - Extensions → Search "GitHub Copilot"
   - Sign in with GitHub
   - Student discount available!

3. **Clone and Open**
   ```bash
   git clone https://github.com/sagerock/music-monitor.git
   code music-monitor
   ```

## ☁️ Option 4: GitHub Codespaces + AI

### Already Set Up! Just:
1. Go to https://github.com/sagerock/music-monitor
2. Click "Code" → "Codespaces" → "Create codespace"
3. AI assistants available:
   - **GitHub Copilot** (if you have subscription)
   - **Codeium** (free alternative)
   - **Continue** (open source)

### Enabling AI in Codespaces:
- Copilot: Should auto-activate if you have subscription
- Codeium: Sign up at [codeium.com](https://codeium.com), get API key
- Continue: Configure with Claude API or local models

## 🔄 Hybrid Workflow (Recommended)

### Primary Development (80% of time)
Use **Claude Code** or **Cursor** locally:
```bash
# Morning routine
cd music-monitor
git pull origin development
code . # or open in Claude Code/Cursor
pnpm dev
```

### Quick Fixes (20% of time)
Use **GitHub Codespaces**:
- On iPad or Chromebook
- When away from main computer
- For quick PR reviews
- For small text changes

## 🎓 AI Learning Prompts for Beginners

### Claude Code Prompts:
```
"Explain this React component in simple terms"
"How do I add a button that saves a note?"
"What's the difference between props and state?"
"Help me understand this error: [paste error]"
"How would an A&R professional use this feature?"
```

### Cursor Prompts:
```
"Generate a component for artist notes"
"Add TypeScript types to this function"
"Refactor this to use React hooks"
"Create a test for this feature"
```

### Copilot Comments:
```javascript
// TODO: Create a function that calculates artist momentum
// based on follower growth and popularity change

// Component that displays artist genre tags with colors

// API call to fetch artist's recent tracks
```

## 📋 Comparison Table

| Feature | Claude Code | Cursor | VS Code + Copilot | Codespaces |
|---------|------------|--------|-------------------|------------|
| **AI Quality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Learning** | Best | Good | Good | OK |
| **Setup** | Easy | Easy | Medium | Instant |
| **Cost** | Free tier | Free tier | $10/mo | Free tier |
| **Offline** | No | Partial | Partial | No |
| **iPad** | No | No | No | Yes |

## 🚀 Quick Start Commands

### After Setup, Daily Workflow:
```bash
# Start your day
git checkout development
git pull origin development
git checkout -b feature/indy-new-feature

# Make changes with AI help
# Ask AI: "How do I add this feature?"

# Save your work
git add .
git commit -m "feat: add artist notes"
git push origin feature/indy-new-feature

# Create PR on GitHub
```

## 💡 Pro Tips

### For Learning:
1. **Start with Claude Code** - Best explanations
2. **Ask "why" not just "how"** - Understand the concepts
3. **Read AI's code before accepting** - Learn patterns
4. **Use AI to review your code** - "How can I improve this?"

### For Productivity:
1. **Let AI write boilerplate** - Focus on logic
2. **Use AI for debugging** - Paste errors directly
3. **Generate tests with AI** - Ensure quality
4. **Document with AI help** - Clear comments

## 🎵 Music Industry Prompts

Train your AI for A&R work:
```
"This is an A&R discovery platform"
"Users are music industry professionals"
"Features should help identify rising artists"
"Think about Spotify metrics and social signals"
"Consider how labels evaluate artists"
```

## 🆘 Troubleshooting

### Claude Code Issues:
- Update to latest version
- Check internet connection
- Restart the app

### Cursor Issues:
- Clear cache: Cmd+Shift+P → "Clear Cache"
- Reinstall extensions
- Check API limits

### Copilot Issues:
- Verify GitHub subscription
- Sign out and back in
- Check VS Code version

### Codespaces Issues:
- Rebuild container
- Check quota limits
- Try different browser

## 📚 Learning Resources

### AI Coding Tutorials:
- [Claude Code Basics](https://claude.ai/docs)
- [Cursor Tutorial](https://cursor.sh/docs)
- [Copilot Guide](https://docs.github.com/en/copilot)

### Best Practices:
- Don't rely 100% on AI - understand the code
- Review AI suggestions critically
- Use AI to learn, not just to complete tasks
- Ask AI to explain its suggestions

## 🎯 Choose Your Setup

### If you're Indy:
1. **Download Claude Code** (primary)
2. **Set up locally** with pnpm
3. **Use Codespaces** as backup
4. **Start with WELCOME_INDY.md**

### Why This Combo:
- Best learning experience with Claude
- Full features when needed
- Flexibility to code anywhere
- Same AI assistant throughout

---

**Ready to start?** Pick your tool and let's build amazing A&R features together! 🚀

**Remember**: The AI is your coding partner, not a replacement for understanding. Use it to learn faster, not to skip learning!