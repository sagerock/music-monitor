# 🔒 Branch Protection Setup Guide

This guide helps you set up branch protection rules on GitHub to ensure code quality and provide a safe learning environment.

## 🎯 Why Branch Protection?

Branch protection helps:
- Prevent accidental changes to production code
- Ensure code review happens before merging
- Create a safe space for learning (mistakes in feature branches are OK!)
- Maintain code quality standards
- Teach best practices through process

## 📋 Recommended Protection Rules

### For `main` Branch (Production)

1. **Go to GitHub Repository Settings**
   - Navigate to Settings → Branches
   - Click "Add branch protection rule"
   - Branch name pattern: `main`

2. **Enable These Protection Rules:**

   ✅ **Require a pull request before merging**
   - Require approvals: 1
   - Dismiss stale pull request approvals when new commits are pushed
   - Require review from CODEOWNERS (optional)

   ✅ **Require status checks to pass before merging**
   - Status checks:
     - Build must pass
     - Linting must pass
     - Tests must pass (when added)

   ✅ **Require branches to be up to date before merging**
   - Ensures branch has latest changes from main

   ✅ **Require conversation resolution before merging**
   - All PR comments must be resolved

   ✅ **Include administrators**
   - Even admins must follow the rules (good for learning discipline)

   ⚠️ **Do NOT enable:**
   - Force push restrictions (we might need to fix mistakes)
   - Deletion protection (we want to clean up old branches)

### For `development` Branch (Integration)

1. **Create Another Protection Rule**
   - Branch name pattern: `development`

2. **Enable These (Less Strict) Rules:**

   ✅ **Require a pull request before merging**
   - Require approvals: 1 (can be self-approved for learning)
   - No dismissal of stale reviews needed

   ✅ **Require status checks to pass**
   - Only critical checks (build must succeed)

   ❌ **Allow force pushes**
   - For fixing mistakes during learning

## 🌳 Branch Strategy for Learning

```
main
  └── development
       ├── feature/indy-* (Indy's branches)
       ├── feature/dad-* (Your branches)
       └── experiment/* (Try new things safely)
```

### Branch Naming Rules
- `feature/indy-*` - Indy's feature branches
- `feature/dad-*` - Your feature branches  
- `bugfix/*` - Bug fixes
- `experiment/*` - Safe experimentation
- `docs/*` - Documentation updates

## 👨‍👦 Collaborative Review Process

### For Indy's Learning PRs:
1. **Indy creates PR** from `feature/indy-*` to `development`
2. **You review** with teaching comments
3. **Indy addresses feedback** (learning opportunity)
4. **You approve** when ready
5. **Indy merges** (celebrating the win!)

### For Your PRs:
1. **You create PR** with explanation comments
2. **Indy reviews** (learning by reading code)
3. **Discuss** any questions
4. **Merge** together

## 🎓 Learning-Friendly Settings

### Enable These GitHub Features:
1. **Squash merging** - Keeps history clean
2. **Auto-delete branches** - Reduces clutter
3. **Allow merge commits** - For special cases
4. **Suggested reviewers** - Automatically suggest you for Indy's PRs

### PR Templates
Create `.github/pull_request_template.md`:
```markdown
## What This PR Does
<!-- Brief description -->

## How to Test
<!-- Steps to verify the changes -->

## Learning Notes
<!-- What did you learn while coding this? -->

## Questions
<!-- Any questions for reviewer? -->

## Checklist
- [ ] Code runs locally
- [ ] No console errors
- [ ] Follows project patterns
- [ ] Added comments where helpful
```

## 🚀 Automation with GitHub Actions

### Basic CI/CD Workflow
Create `.github/workflows/ci.yml`:
```yaml
name: CI

on:
  pull_request:
    branches: [main, development]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm build
```

## 📝 CODEOWNERS File (Optional)

Create `.github/CODEOWNERS`:
```
# Global owners
* @sagerock

# Frontend specific
/frontend/ @sagerock @indy

# Backend specific  
/backend/ @sagerock

# Docs can be updated by anyone
/docs/ @sagerock @indy
*.md @sagerock @indy
```

## 🎯 Progressive Permissions

### Month 1: Training Wheels
- Indy can only merge to `development`
- All merges require your review
- Can't merge to `main`

### Month 2: Building Confidence  
- Can self-merge to `development` for simple changes
- Still requires review for `main`
- Can review others' PRs

### Month 3: Full Collaboration
- Can merge to `main` with review
- Can approve others' PRs
- Maintains protection rules

## ⚙️ How to Set Up

### Step 1: Configure Main Branch Protection
```bash
# These settings are configured in GitHub UI
# Settings → Branches → Add rule → "main"
```

### Step 2: Configure Development Branch
```bash
# Settings → Branches → Add rule → "development"
```

### Step 3: Add Indy as Collaborator
```bash
# Settings → Manage access → Invite collaborator
# Username: [Indy's GitHub username]
# Permission: Write (not Admin initially)
```

### Step 4: Create Initial Branches
```bash
git checkout -b development
git push -u origin development
```

## 🔍 Monitoring & Metrics

### Track Learning Progress:
- Number of PRs created
- Review turnaround time
- Quality of PR descriptions
- Code review discussions
- Successful merges

### GitHub Insights:
- Contributors graph
- Code frequency
- Commit activity
- PR merge rate

## 🎉 Celebrating Milestones

### Create Protected Celebration Branches:
- `milestone/first-pr` - Indy's first PR
- `milestone/first-feature` - First complete feature
- `milestone/100-commits` - 100th commit

These branches preserve important moments in the learning journey!

## 🆘 Troubleshooting

### "Can't push to protected branch"
- Always work in feature branches
- Never commit directly to main or development

### "PR can't be merged"
- Check if status checks are passing
- Ensure branch is up to date
- Resolve all conversations

### "Accidentally committed to main"
- Don't panic! 
- Create a new branch from main
- Reset main to previous commit (needs admin)
- Apply protection rules

## 📚 Additional Resources

- [GitHub Docs: Protected Branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Remember:** These rules create structure for learning, not barriers. Adjust as needed for your teaching style!