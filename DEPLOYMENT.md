# Deployment Configuration

## Vercel Setup

This is a monorepo with the Next.js frontend in the `frontend` directory.

### Important Vercel Settings:
- **Root Directory**: `frontend` (Set this in Vercel Dashboard → Settings → General)
- **Framework Preset**: Next.js (auto-detected)
- **Node.js Version**: 18.x

### Environment Variables Required:
- `NEXT_PUBLIC_API_URL`: https://music-monitor.onrender.com
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

### If Deployments Fail:
1. Check that Root Directory is set to `frontend` in Vercel Dashboard
2. Ensure environment variables are set
3. Don't modify the Root Directory setting

### Project Structure:
```
music-monitor/
├── frontend/          # Next.js app (deployed to Vercel)
│   ├── package.json   # Contains "next" dependency
│   └── vercel.json    # Frontend-specific Vercel config
├── backend/           # Fastify API (deployed to Render)
└── vercel.json        # Root config for monorepo build
```

### Note:
Never use `"rootDirectory"` in vercel.json - this setting only exists in the Vercel Dashboard.
EOF < /dev/null