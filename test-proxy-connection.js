// Test proxy connection for iPhone 17/17 Pro Monitor Extension
// Run this in browser console to test proxy

async function testProxyConnection() {
  console.log('🔍 Testing proxy connection...');
  console.log('Proxy: ip.mproxy.vn:12271');
  console.log('Username: tev');
  console.log('Password: B4a9yGhNsiNre0B');
  console.log('');

  try {
    // Test 1: Check current IP
    console.log('📡 Test 1: Checking current IP...');
    const ipResponse = await fetch('https://httpbin.org/ip');
    const ipData = await ipResponse.json();
    console.log('✅ Current IP:', ipData.origin);
    console.log('');

    // Test 2: Check headers
    console.log('📡 Test 2: Checking request headers...');
    const headersResponse = await fetch('https://httpbin.org/headers');
    const headersData = await headersResponse.json();
    console.log('✅ Request headers:', headersData.headers);
    console.log('');

    // Test 3: Test Apple Japan access
    console.log('📡 Test 3: Testing Apple Japan access...');
    const appleResponse = await fetch('https://www.apple.com/jp/', {
      method: 'HEAD',
      mode: 'no-cors'
    });
    console.log('✅ Apple Japan accessible:', appleResponse.status === 0 ? 'Yes' : 'No');
    console.log('');

    // Test 4: Check User-Agent
    console.log('📡 Test 4: Checking User-Agent...');
    const uaResponse = await fetch('https://httpbin.org/user-agent');
    const uaData = await uaResponse.json();
    console.log('✅ User-Agent:', uaData['user-agent']);
    console.log('');

    console.log('🎉 Proxy connection test completed!');
    
  } catch (error) {
    console.error('❌ Proxy connection test failed:', error);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check if proxy is configured in browser');
    console.log('2. Verify proxy server is accessible');
    console.log('3. Check proxy credentials');
    console.log('4. Try different proxy protocol');
  }
}

// Test proxy rotation manager
function testProxyRotationManager() {
  console.log('🔄 Testing Proxy Rotation Manager...');
  
  if (typeof IPRotationManager !== 'undefined') {
    const manager = new IPRotationManager();
    console.log('✅ IPRotationManager available');
    console.log('Proxy stats:', manager.getProxyStats());
    console.log('Current proxy:', manager.getCurrentProxy());
  } else {
    console.log('❌ IPRotationManager not available');
    console.log('Make sure extension is loaded');
  }
}

// Test User-Agent rotation
function testUserAgentRotation() {
  console.log('🔄 Testing User-Agent Rotation...');
  
  if (typeof UserAgentRotation !== 'undefined') {
    const uaRotation = new UserAgentRotation();
    console.log('✅ UserAgentRotation available');
    console.log('Current User-Agent:', uaRotation.rotateUserAgent());
  } else {
    console.log('❌ UserAgentRotation not available');
    console.log('Make sure extension is loaded');
  }
}

// Run all tests
console.log('🚀 Starting iPhone 17/17 Pro Monitor Extension Proxy Tests...');
console.log('='.repeat(60));

// Test proxy connection
testProxyConnection().then(() => {
  console.log('');
  console.log('='.repeat(60));
  
  // Test proxy rotation manager
  testProxyRotationManager();
  console.log('');
  
  // Test User-Agent rotation
  testUserAgentRotation();
  console.log('');
  
  console.log('✅ All tests completed!');
});

// Export functions for manual testing
window.testProxyConnection = testProxyConnection;
window.testProxyRotationManager = testProxyRotationManager;
window.testUserAgentRotation = testUserAgentRotation;
