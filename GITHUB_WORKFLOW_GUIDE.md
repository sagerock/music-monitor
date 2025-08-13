# 🚀 GitHub Workflow Guide - Simple & Practical

## 📖 The Story of a Feature

Imagine you and Indy are working on the Music Monitor app together. Here's how you collaborate without stepping on each other's toes:

## 🎯 The Simple Daily Workflow

### Morning: Start Fresh
```bash
# 1. Make sure you're on main branch
git checkout main

# 2. Get latest changes from GitHub
git pull origin main

# 3. Create your own branch for today's work
git checkout -b feature/dad-momentum-fix
```

### During the Day: Make Changes
```bash
# Edit files, add features, fix bugs...

# Save your work locally
git add .
git commit -m "Fix: improve momentum calculation accuracy"
```

### End of Day: Share Your Work
```bash
# Push your branch to GitHub
git push origin feature/dad-momentum-fix
```

### Get It Reviewed: Create Pull Request
1. Go to https://github.com/sagerock/music-monitor
2. You'll see a yellow banner: "feature/dad-momentum-fix had recent pushes"
3. Click "Compare & pull request"
4. Add description of what you did
5. Click "Create pull request"
6. Wait for review/approval
7. Click "Merge pull request" when approved

## 🎨 Real Scenario: You and Indy Collaboration

### Scenario 1: Indy Adds a Feature
```bash
# Indy's computer:
git checkout main
git pull origin main
git checkout -b feature/indy-artist-notes
# ... makes changes ...
git add .
git commit -m "Add: artist notes feature for A&R tracking"
git push origin feature/indy-artist-notes
# Creates PR on GitHub
```

### Scenario 2: You Review Indy's Code
1. Go to GitHub → Pull requests
2. Click on Indy's PR
3. Review the changes:
   - ✅ Click "Approve" if good
   - 💬 Leave comments for improvements
   - ❌ Request changes if needed

### Scenario 3: Merging Indy's Work
```bash
# After approval, on GitHub:
# Click "Merge pull request"
# Click "Confirm merge"

# Now everyone needs to update:
git checkout main
git pull origin main  # Gets Indy's changes
```

## 🔀 Common Situations & Solutions

### Situation 1: "I forgot to create a branch!"
```bash
# If you haven't committed yet:
git stash                    # Temporarily save changes
git checkout -b feature/new-branch
git stash pop               # Bring changes back

# If you already committed to main:
git checkout -b feature/new-branch  # Branch from here
git checkout main
git reset --hard HEAD~1    # Undo last commit on main
git checkout feature/new-branch  # Go back to your branch
```

### Situation 2: "My branch is out of date"
```bash
# Update your branch with latest main:
git checkout main
git pull origin main
git checkout feature/your-branch
git merge main
```

### Situation 3: "I want to see what changed"
```bash
# See what files changed:
git status

# See what changed in files:
git diff

# See commit history:
git log --oneline -10
```

## 📝 Commit Message Patterns

Use these prefixes for clear communication:
- `Add:` New feature
- `Fix:` Bug fix
- `Update:` Improvement to existing feature
- `Remove:` Deleted code/feature
- `Docs:` Documentation only
- `Style:` Formatting, no code change
- `Test:` Adding tests

Examples:
```bash
git commit -m "Add: playlist analysis feature for A&R discovery"
git commit -m "Fix: resolve dark mode text contrast issues"
git commit -m "Update: improve momentum algorithm accuracy"
git commit -m "Docs: add setup instructions for new developers"
```

## 🎯 Pull Request Best Practices

### Good PR Description:
```markdown
## What This Does
Adds a note-taking system for A&R professionals to track artist insights

## Changes Made
- Created new Notes component
- Added database table for notes
- Integrated with artist profile page

## How to Test
1. Go to any artist page
2. Click "Add Note" button
3. Type a note and save
4. Verify note appears in list

## Screenshots
[Include if UI changes]
```

### PR Size Guidelines:
- **Small PR**: 1-50 lines (quick review)
- **Medium PR**: 50-250 lines (normal review)
- **Large PR**: 250+ lines (detailed review needed)
- **Too Large**: 500+ lines (consider splitting)

## 🚦 The Flow Visualized

```
main branch:     ●────●────●────────────●────●
                      ↑              ↗
your branch:          └──●──●──●──●
                         ↑        ↑
                      create    push → PR → merge
```

## 🔑 Key Commands Reference

### Daily Use:
```bash
git status                  # What's changed?
git pull origin main        # Get latest
git checkout -b feature/x   # New branch
git add .                   # Stage changes
git commit -m "message"     # Save locally
git push origin branch      # Upload to GitHub
```

### Useful Commands:
```bash
git branch                  # List branches
git branch -a              # List all (including remote)
git checkout branch-name   # Switch branches
git log --oneline -5       # Recent commits
git diff                   # See changes
git stash                  # Temporarily save work
git stash pop              # Restore saved work
```

## 🎓 Learning by Doing

### Your First Practice PR:
1. Create branch: `git checkout -b practice/your-name`
2. Edit this file - add your name below
3. Commit: `git commit -m "Add: my name to practice list"`
4. Push: `git push origin practice/your-name`
5. Create PR on GitHub
6. Merge it!

**Practice List:**
- Sage was here! 
- Indy was here! 🎸
- [Add your name]

## 💡 Pro Tips

1. **Pull often** - Start each day with `git pull`
2. **Commit often** - Small commits are easier to review
3. **Branch names** - Be descriptive: `feature/artist-notes` not `feature1`
4. **Test before PR** - Make sure your code works
5. **Write clear messages** - Future you will thank you

## 🆘 When Things Go Wrong

### "I have merge conflicts!"
Don't panic! This happens when two people edit the same code:
1. Pull the latest main
2. Git will mark conflicts in files
3. Edit files to resolve conflicts
4. Remove the conflict markers (`<<<<`, `====`, `>>>>`)
5. Commit the resolution

### "I messed up my branch!"
You can always start fresh:
```bash
git checkout main
git pull origin main
git checkout -b feature/start-over
```

### "I pushed sensitive data!"
1. Don't panic
2. Remove from next commit
3. Ask for help to clean history
4. Change any exposed passwords/keys

## 🎯 The Golden Rules

1. **Never commit directly to main** - Always use branches
2. **Pull before you push** - Get latest changes first
3. **One feature per branch** - Keep changes focused
4. **Test before PR** - Make sure it works
5. **Review others' code** - Learn from reading

## 📚 Your Learning Path

### Week 1: Basics
- Create branches
- Make commits
- Push to GitHub

### Week 2: Collaboration  
- Create pull requests
- Review code
- Merge changes

### Week 3: Advanced
- Resolve conflicts
- Rebase branches
- Cherry-pick commits

## 🎉 You're Ready!

This workflow keeps your code organized and makes collaboration smooth. The more you use it, the more natural it becomes.

Remember: Git is like a time machine for your code - you can always go back if something goes wrong!

---

**Questions?** Try the command and see what happens. Git is very forgiving - you can almost always undo things!