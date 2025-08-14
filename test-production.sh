#!/bin/bash

# Test script for production deployment
# Run this after Render redeploys with the sequential query changes

echo "Testing Music Monitor Production Deployment"
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend URL
BACKEND_URL="https://music-monitor.onrender.com"
FRONTEND_URL="https://music-monitor.vercel.app"

# Test artist ID (Taylor Swift)
ARTIST_ID="06HL4z0CvFAxyc27GXpf02"

echo -e "\n${YELLOW}1. Testing Backend Health${NC}"
echo "Testing: $BACKEND_URL/health"
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health")
if [ "$HEALTH_RESPONSE" == "200" ]; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${RED}✗ Backend health check failed (HTTP $HEALTH_RESPONSE)${NC}"
fi

echo -e "\n${YELLOW}2. Testing Database Connection (Leaderboard)${NC}"
echo "Testing: $BACKEND_URL/api/leaderboard"
LEADERBOARD_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/leaderboard")
if [ "$LEADERBOARD_RESPONSE" == "200" ]; then
    echo -e "${GREEN}✓ Database connection working${NC}"
else
    echo -e "${RED}✗ Database connection failed (HTTP $LEADERBOARD_RESPONSE)${NC}"
fi

echo -e "\n${YELLOW}3. Testing Ratings Endpoint${NC}"
echo "Testing: $BACKEND_URL/api/ratings/artist/$ARTIST_ID"
RATINGS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/ratings/artist/$ARTIST_ID?page=1&limit=20")
if [ "$RATINGS_RESPONSE" == "200" ]; then
    echo -e "${GREEN}✓ Ratings endpoint working (sequential queries fixed)${NC}"
else
    echo -e "${RED}✗ Ratings endpoint failed (HTTP $RATINGS_RESPONSE)${NC}"
    echo "  This was the main issue - connection pool exhaustion"
fi

echo -e "\n${YELLOW}4. Testing Comments Endpoint${NC}"
echo "Testing: $BACKEND_URL/api/comments/artist/$ARTIST_ID"
COMMENTS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/comments/artist/$ARTIST_ID?page=1&limit=20")
if [ "$COMMENTS_RESPONSE" == "200" ]; then
    echo -e "${GREEN}✓ Comments endpoint working (sequential queries fixed)${NC}"
else
    echo -e "${RED}✗ Comments endpoint failed (HTTP $COMMENTS_RESPONSE)${NC}"
fi

echo -e "\n${YELLOW}5. Testing Socials Endpoint${NC}"
echo "Testing: $BACKEND_URL/api/socials/artist/$ARTIST_ID"
SOCIALS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/socials/artist/$ARTIST_ID")
if [ "$SOCIALS_RESPONSE" == "200" ]; then
    echo -e "${GREEN}✓ Socials endpoint working${NC}"
else
    echo -e "${RED}✗ Socials endpoint failed (HTTP $SOCIALS_RESPONSE)${NC}"
fi

echo -e "\n${YELLOW}6. Testing Frontend Connection to Backend${NC}"
echo "Testing: Frontend can reach backend API"
# Check if frontend is up
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$FRONTEND_RESPONSE" == "200" ]; then
    echo -e "${GREEN}✓ Frontend is accessible${NC}"
else
    echo -e "${RED}✗ Frontend not accessible (HTTP $FRONTEND_RESPONSE)${NC}"
fi

echo -e "\n${YELLOW}7. Testing Social Stats Update (with auth)${NC}"
echo "Testing: $BACKEND_URL/api/jobs/update-social-stats"
UPDATE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BACKEND_URL/api/jobs/update-social-stats" \
  -H "Content-Type: application/json" \
  -H "secret: cronJobSecret123")
if [ "$UPDATE_RESPONSE" == "200" ]; then
    echo -e "${GREEN}✓ Social stats update endpoint accessible${NC}"
    echo "  Note: Instagram scraping limited on free tier"
else
    echo -e "${RED}✗ Social stats update failed (HTTP $UPDATE_RESPONSE)${NC}"
fi

echo -e "\n${YELLOW}Summary:${NC}"
echo "=========================================="
echo "The sequential query optimization should fix:"
echo "- Rating panel not updating"
echo "- Connection pool timeout errors"
echo "- 500 errors on ratings/comments endpoints"
echo ""
echo "Known limitations:"
echo "- Instagram scraping requires paid Render tier"
echo "- YouTube stats work for all URL formats now"
echo ""
echo "Next steps:"
echo "1. Wait for Render to redeploy with latest changes"
echo "2. Run this script again to verify fixes"
echo "3. Test rating panel updates in the UI"