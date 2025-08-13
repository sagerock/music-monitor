# Music Monitor Deployment Checklist

Use this checklist to ensure a smooth deployment to production.

## Pre-Deployment Checklist

### 📋 Accounts & Services
- [ ] Railway account created and connected to GitHub
- [ ] Vercel account created and connected to GitHub  
- [ ] Supabase project is set up and accessible
- [ ] Spotify Developer app credentials available
- [ ] All required API keys and secrets generated

### 🔧 Local Development
- [ ] Application runs locally without errors
- [ ] All features tested (auth, profiles, ratings, follows, avatar upload)
- [ ] Database migrations are up to date
- [ ] Environment variables documented

## Railway Backend Deployment

### 🚂 Railway Setup
- [ ] New Railway project created
- [ ] GitHub repository connected
- [ ] PostgreSQL service added to project
- [ ] Backend service configured to use Dockerfile

### ⚙️ Backend Configuration
- [ ] All environment variables added from `railway.env.example`
- [ ] `DATABASE_URL` set to `${{Postgres.DATABASE_URL}}`
- [ ] `FRONTEND_URL` set to future Vercel domain
- [ ] `NODE_ENV` set to `production`
- [ ] JWT_SECRET is secure (32+ characters)
- [ ] CRON_JOB_SECRET is secure
- [ ] Supabase credentials added

### 🚀 Backend Deployment
- [ ] Initial deployment successful
- [ ] Health endpoint responds: `/health` returns 200
- [ ] Database migrations completed automatically
- [ ] Logs show no critical errors
- [ ] Railway domain/URL noted for frontend config

## Vercel Frontend Deployment

### ⚡ Vercel Setup  
- [ ] New Vercel project created
- [ ] GitHub repository connected
- [ ] Root directory set to `frontend`
- [ ] Framework preset: Next.js

### 🌐 Frontend Configuration
- [ ] `NEXT_PUBLIC_API_URL` set to Railway backend URL
- [ ] `NEXT_PUBLIC_SUPABASE_URL` added
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` added
- [ ] Build and deployment successful
- [ ] Vercel domain/URL noted

### 🔄 Backend Update
- [ ] Railway `FRONTEND_URL` updated with Vercel domain
- [ ] Backend redeployed with new CORS settings

## Supabase Production Configuration

### 🔐 Authentication Settings
- [ ] Site URL updated to Vercel domain
- [ ] Redirect URLs updated: `https://your-app.vercel.app/auth/callback`
- [ ] Authentication working on production

### 📁 Storage Configuration  
- [ ] `user-uploads` bucket exists
- [ ] Bucket set to Public access
- [ ] Avatar upload tested and working

## Testing & Verification

### 🧪 Functionality Tests
- [ ] Homepage loads correctly
- [ ] User registration/login works
- [ ] Artist search and leaderboard work
- [ ] User profiles load and update
- [ ] Comments and ratings can be posted
- [ ] Follow/unfollow functionality works
- [ ] Avatar upload/delete works
- [ ] Watchlist add/remove works
- [ ] Backend API endpoints respond correctly

### 📊 Health & Performance
- [ ] Backend health endpoint: `https://backend.railway.app/health`
- [ ] Frontend loads within 3 seconds
- [ ] No console errors on frontend
- [ ] Backend logs show normal operation
- [ ] Database queries performing well

### 📱 Cross-Platform Testing
- [ ] Desktop browser (Chrome, Safari, Firefox)
- [ ] Mobile responsive design
- [ ] Different screen sizes
- [ ] Dark/light mode if applicable

## Post-Deployment Setup

### 📈 Monitoring & Alerts
- [ ] Railway service monitoring enabled
- [ ] Vercel function monitoring enabled
- [ ] Error tracking configured
- [ ] Performance monitoring set up

### 🔄 Scheduled Jobs
- [ ] Cron jobs running automatically (check Railway logs)
- [ ] Manual job trigger tested with CRON_JOB_SECRET
- [ ] Data refresh working (new releases, artist snapshots)

### 🔒 Security Review
- [ ] All secrets are secure and not exposed
- [ ] CORS configured for production domains only
- [ ] Rate limiting active
- [ ] Environment variables follow principle of least privilege

## Documentation & Handover

### 📚 Documentation
- [ ] Update README.md with production URLs
- [ ] CLAUDE.md updated with deployment info
- [ ] Environment variables documented
- [ ] Deployment process documented

### 🎯 Final Verification
- [ ] Production URLs accessible and working
- [ ] All core features tested end-to-end
- [ ] Performance acceptable
- [ ] No critical errors in logs
- [ ] Team/stakeholders have access to necessary dashboards

## Cost & Resource Monitoring

### 💰 Cost Tracking
- [ ] Railway usage and costs monitored
- [ ] Vercel bandwidth and function usage tracked
- [ ] Supabase database size and requests monitored
- [ ] Alerts set for usage thresholds

### 📊 Resource Usage
- [ ] Database performance metrics reviewed
- [ ] API response times acceptable
- [ ] Frontend Core Web Vitals good
- [ ] Memory and CPU usage normal

---

## Environment URLs

**Production Frontend:** `https://your-app.vercel.app`
**Production Backend:** `https://your-backend.railway.app` 
**Health Check:** `https://your-backend.railway.app/health`

**Admin Dashboards:**
- Railway: `https://railway.app/project/your-project-id`
- Vercel: `https://vercel.com/your-username/your-app`
- Supabase: `https://app.supabase.com/project/your-ref`

---

✅ **Deployment Complete!** 

Your Music Monitor application is now live and ready for users.