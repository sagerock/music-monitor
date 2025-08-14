// Test TikTok scraping locally
// Run with: node test-tiktok-local.js

const { ApifyClient } = require('apify-client');

async function testTikTokScraping() {
  const token = process.env.APIFY_API_TOKEN;
  
  if (!token) {
    console.error('Please set APIFY_API_TOKEN environment variable');
    process.exit(1);
  }

  const client = new ApifyClient({ token });
  const username = 'remiwolf';
  
  console.log(`Testing TikTok scraping for @${username}...`);
  
  // Try different actors
  const actors = [
    'clockworks/free-tiktok-scraper',
    'apify/tiktok-scraper',
    'microworlds/tiktok-scraper'
  ];
  
  for (const actorId of actors) {
    console.log(`\nTrying actor: ${actorId}`);
    try {
      const run = await client.actor(actorId).call({
        profiles: [`https://www.tiktok.com/@${username}`],
        resultsPerPage: 1,
        maxProfilesPerQuery: 1,
        shouldDownloadVideos: false,
        shouldDownloadCovers: false,
      });
      
      console.log('Waiting for run to finish...');
      await client.run(run.id).waitForFinish();
      
      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      
      if (items.length > 0) {
        console.log('Success! Profile data:');
        console.log(JSON.stringify(items[0], null, 2));
        
        // Show which fields contain follower data
        const profile = items[0];
        console.log('\nFollower count fields:');
        console.log('- fans:', profile.fans);
        console.log('- followersCount:', profile.followersCount);
        console.log('- followers:', profile.followers);
        console.log('- stats?.followerCount:', profile.stats?.followerCount);
        break;
      } else {
        console.log('No data returned');
      }
    } catch (error) {
      console.error(`Failed: ${error.message}`);
    }
  }
}

testTikTokScraping().catch(console.error);