# Domain Access Control Guide

## How It Works

Music Monitor uses email domain validation to ensure only music industry professionals and students can create accounts. This happens during the signup process.

## System Overview

### 1. The Allowlist File
Location: `/frontend/src/lib/allowed-domains.ts`

This file contains all approved email domains organized into categories:
- **Educational**: Specific music schools only (Berklee, NYU, UCLA to start)
- **Record Labels**: Major and indie labels
- **Music Industry**: Streaming, media, agencies, etc.
- **Invited**: Special partnerships (currently empty)

### 2. Validation Process
When someone tries to sign up:
1. Their email domain is extracted (part after @)
2. The system checks if it matches:
   - Any domain in the educational list (specific schools)
   - Any domain in the record labels list
   - Any domain in the music industry list
   - Any domain in the invited list
3. If no match → Access denied screen appears
4. If match → Normal signup proceeds

### 3. Important Notes
- **Existing users** can always login, regardless of domain
- Only **new signups** are restricted
- The check is **case-insensitive**

## How to Add New Domains

### Quick Add (Single Domain)

1. Open `/frontend/src/lib/allowed-domains.ts`
2. Find the appropriate category
3. Add the domain in quotes with a comma

Example - Adding a music school:
```typescript
educational: [
  'berklee.edu',
  'nyu.edu',
  'ucla.edu',
  'juilliard.edu',  // ← Add here
]
```

Example - Adding a record label:
```typescript
recordLabels: [
  'universalmusic.com',
  'sonymusic.com',
  'newlabel.com',  // ← Add here
]
```

Example - Adding a music company:
```typescript
musicIndustry: [
  'spotify.com',
  'newcompany.com',  // ← Add here
]
```

### Bulk Add (Multiple Domains)

For multiple domains from a partnership:
```typescript
invited: [
  'partner1.com',
  'partner2.org',
  'partner3.net',
] as string[]
```

## Testing Domain Access

### Test if a domain works:
1. Go to the signup page
2. Try signing up with: `test@[domain-to-test]`
3. If you see the normal signup → Domain is approved
4. If you see "Industry Access Required" → Domain not approved

### Check current domains:
Look in `/frontend/src/lib/allowed-domains.ts` - all domains are listed there

## Common Scenarios

### Adding a Music School
Music schools need to be specifically added to the educational array:
```typescript
educational: [
  'berklee.edu',      // Berklee College of Music
  'nyu.edu',          // NYU (Steinhardt, Clive Davis)
  'ucla.edu',         // UCLA Herb Alpert School
  'juilliard.edu',    // The Juilliard School
  'curtis.edu',       // Curtis Institute
  'icmp.ac.uk',       // UK school (international)
]
```

Note: Students from schools not on the list should email indy@sagerock.com with their school email to request addition.

### Adding a Label Group
When adding a major label, include subsidiaries:
```typescript
recordLabels: [
  // Warner Music Group
  'warnermusic.com',     // Parent company
  'atlanticrecords.com', // Subsidiary
  'elektra.com',         // Subsidiary
]
```

### Adding Regional Offices
Include international domains:
```typescript
musicIndustry: [
  'sonymusic.com',       // US
  'sonymusic.co.uk',     // UK
  'sonymusic.de',        // Germany
  'sonymusic.co.jp',     // Japan
]
```

## Maintenance

### Regular Updates
1. Review access requests monthly
2. Remove domains of closed companies
3. Add new industry players as they emerge

### Security Considerations
- Don't add generic email providers (gmail.com, etc.)
- Verify company domains before adding
- Use the `invited` array for temporary/trial access

## Deployment

After making changes:
1. Save the file
2. Commit to git: `git add -A && git commit -m "Add new domains"`
3. Push to GitHub: `git push origin main`
4. Deploy to Vercel: `./deploy.sh`

The changes will be live in 2-3 minutes.

## Contact for Access Requests

Users who need access can email: **indy@sagerock.com**

Include:
- Full name
- Company/School
- Work email
- LinkedIn or proof of affiliation

## Troubleshooting

### Domain not working?
- Check for typos (common: .com vs .co)
- Ensure no 'www.' prefix
- Check if it's the correct corporate domain

### Build errors?
- Make sure arrays have commas between items
- Ensure the `invited` array has `as string[]` type
- Run `npm run build` locally to test

## Philosophy

The goal is to maintain quality while being inclusive:
- ✅ Welcome all legitimate students and professionals
- ✅ Keep the platform focused on serious A&R work
- ✅ Build a trusted community of music industry peers
- ❌ Avoid spam and non-industry accounts