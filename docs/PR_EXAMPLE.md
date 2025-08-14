# 🎯 Pull Request Example - Real Scenario

## Current Situation: Indy's Branch

When you see "This branch is 1 commit ahead of main" on GitHub, here's what's happening:

```
main:     ●──●──●──●
               ↑
               Last shared commit
                    ↓
indy:     ●──●──●──●──●
                      ↑
                   New commit (not in main)
```

## What This Means

✅ **Good News:** Indy has new work ready to share!
❓ **Question:** Should this work go into main?

## Step-by-Step: Creating the Pull Request

### 1️⃣ Indy Sees This on GitHub:
![Branch Status]
```
🔶 This branch is 1 commit ahead of sagerock:main
[Compare & pull request] button appears
```

### 2️⃣ Indy Clicks "Compare & pull request"

### 3️⃣ Indy Fills Out the PR Form:
```markdown
Title: Add artist discovery source tracking

Description:
## What This Does
Adds a field to track where we discovered each artist (Playlist, Radio, Social)

## Why It's Useful
Helps A&R teams understand which discovery sources are most effective

## Changes Made
- Added discovery_source field to artist cards
- Updated database schema
- Added dropdown selector in UI

## Testing Done
- Tested all three source options
- Verified data saves correctly
- Checked dark mode compatibility
```

### 4️⃣ You (Sage) Review the PR

**On GitHub Pull Request Page:**
- Click "Files changed" tab
- Review the code changes
- Leave comments if needed:
  ```
  "Great work! Consider adding 'Festival' as another source option"
  ```

### 5️⃣ Approve and Merge

**Three Options:**
1. ✅ **Approve** - "Looks good!"
2. 💬 **Comment** - "Good but needs these small changes"
3. ❌ **Request changes** - "Need to fix these issues first"

### 6️⃣ Click "Merge pull request"

**After Merging:**
```
main:     ●──●──●──●──● (now includes Indy's commit)
                      ↑
                   Indy's work is now in main!
```

## Common Scenarios & Solutions

### Scenario A: "My branch is behind main"
```bash
# Indy's computer:
git checkout indy/hello-world
git pull origin main        # Get latest main
git push origin indy/hello-world  # Update his branch on GitHub
```

### Scenario B: "I want to add more changes to my PR"
```bash
# Indy's computer (on same branch):
# Make more changes...
git add .
git commit -m "Add: additional improvements"
git push origin indy/hello-world
# PR automatically updates!
```

### Scenario C: "I need to fix something in my PR"
```bash
# After you request changes in the PR review:
# Indy makes the fixes...
git add .
git commit -m "Fix: address review feedback"
git push origin indy/hello-world
# PR shows new commit, ready for re-review
```

## 🎮 Interactive Practice

Let's practice right now with a real example:

### Your Turn:
1. I've created a branch: `docs/github-workflow-guide`
2. I'll push it to GitHub
3. You can review my Pull Request
4. We'll merge it together!

```bash
# What I'm doing now:
git add GITHUB_WORKFLOW_GUIDE.md PR_EXAMPLE.md
git commit -m "Docs: add comprehensive GitHub workflow guide"
git push origin docs/github-workflow-guide
```

Then:
1. Go to https://github.com/sagerock/music-monitor
2. Look for the yellow banner
3. Click "Compare & pull request"
4. Review and merge!

## 📝 Quick Reference

### Creating a PR:
1. Push your branch: `git push origin your-branch`
2. Go to GitHub
3. Click "Compare & pull request"
4. Describe your changes
5. Submit

### Reviewing a PR:
1. Go to Pull requests tab
2. Click on the PR
3. Review "Files changed"
4. Leave feedback
5. Approve/Request changes
6. Merge when ready

### After PR is Merged:
```bash
# Everyone updates their main:
git checkout main
git pull origin main
```

## 💡 Pro Tips for You and Indy

1. **Small PRs are better** - Easier to review
2. **Descriptive titles** - "Add artist notes" not "Update code"
3. **Test before PR** - Make sure it works
4. **Respond to feedback** - It's collaborative learning
5. **Celebrate merges!** - Every PR is progress

## 🎯 The Key Insight

**Pull Requests are conversations about code:**
- Indy: "Here's what I built, what do you think?"
- You: "Great work! Here's some feedback..."
- Both: "Let's merge it and make the app better!"

It's not just about the code - it's about learning and improving together!