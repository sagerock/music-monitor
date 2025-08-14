# Fix for cron-job.org 404 Error

## The 404 error happens when the request method is wrong

### Correct Setup for cron-job.org:

1. **Login to your cron-job.org account**

2. **Edit your cronjob**

3. **In the BASIC tab:**
   - **URL**: `https://music-monitor.onrender.com/api/jobs/update-social-stats`
   - **Schedule**: Your preferred time

4. **In the ADVANCED tab (CRITICAL!):**
   - **Request method**: **POST** (not GET - this causes 404!)
   - **Enable custom headers**: Toggle ON
   - **Headers**: Click "Add header"
     - **Header name**: `secret`
     - **Header value**: `cronJobSecret123`
   
   OR if they want raw header format:
   ```
   secret: cronJobSecret123
   ```

5. **Save and test**

## Alternative: Test with webhook.site first

1. Go to [webhook.site](https://webhook.site)
2. Get a unique URL
3. Set your cron job to POST to that URL first
4. Verify it's sending POST with the header
5. Then switch back to your real URL

## If Still Getting 404:

The issue is definitely the request method. The endpoint only accepts POST requests:
- ✅ POST request = works
- ❌ GET request = 404 error

## Manual Test Command:
```bash
# This works (POST):
curl -X POST https://music-monitor.onrender.com/api/jobs/update-social-stats \
  -H "secret: cronJobSecret123"

# This gives 404 (GET):
curl https://music-monitor.onrender.com/api/jobs/update-social-stats
```

## Working Example Request:
```
POST /api/jobs/update-social-stats HTTP/1.1
Host: music-monitor.onrender.com
secret: cronJobSecret123
Content-Length: 0
```

Make sure cron-job.org is configured to send exactly this!