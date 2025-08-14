import axios from 'axios';

async function testAlertAPI() {
  const API_URL = 'http://localhost:3001';
  
  try {
    // First, we need to get a valid token
    // For testing, we'll use a Supabase token
    // In production, this would come from the frontend auth
    
    console.log('Testing alert creation API...');
    console.log('Note: This requires a valid authentication token');
    console.log('Please test from the frontend with a logged-in user');
    
    // Try to create an alert without auth to test error handling
    try {
      const response = await axios.post(`${API_URL}/api/alerts`, {
        artistId: '06HL4z0CvFAxyc27GXpf02', // Taylor Swift
        threshold: 5,
      });
      console.log('Unexpected success without auth:', response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ Auth check working correctly - 401 returned for unauthenticated request');
        console.log('Response:', error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAlertAPI();