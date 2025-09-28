// Test script for proxy connection
// Run this in browser console to test proxy

async function testProxyConnection() {
  console.log('🔍 Testing Proxy Connection...');
  console.log('Proxy: choip.mproxy.vn:12271');
  console.log('Username: tev');
  
  try {
    // Test 1: Check current IP
    console.log('\n📡 Test 1: Checking current IP...');
    const response = await fetch('https://httpbin.org/ip');
    const data = await response.json();
    console.log('Current IP:', data.origin);
    
    // Test 2: Check headers
    console.log('\n📋 Test 2: Checking headers...');
    const headersResponse = await fetch('https://httpbin.org/headers');
    const headersData = await headersResponse.json();
    console.log('Headers:', headersData.headers);
    
    // Test 3: Test Apple site
    console.log('\n🍎 Test 3: Testing Apple site...');
    const appleResponse = await fetch('https://www.apple.com/jp/shop/bag', {
      method: 'HEAD',
      mode: 'no-cors'
    });
    console.log('Apple site response:', appleResponse.status);
    
    console.log('\n✅ Proxy test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Proxy test failed:', error);
    return false;
  }
}

// Run the test
testProxyConnection();
