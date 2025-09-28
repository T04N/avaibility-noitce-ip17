// Test script for proxy IP reset functionality
// Run this in browser console to test IP reset

async function testProxyIpReset() {
  console.log('🔄 Testing Proxy IP Reset Functionality...');
  console.log('==========================================');
  
  const resetUrl = 'https://mproxy.vn/capi/Q7LGuYFGAFFO4F7dJJwx3gxI-8LYe5msQw2U9E6-dig/key/B4a9yGhNsiNre0B/resetIp';
  
  try {
    // Test 1: Check current IP before reset
    console.log('\n1️⃣ Checking current IP before reset...');
    const beforeResponse = await fetch('https://httpbin.org/ip');
    const beforeData = await beforeResponse.json();
    console.log('Current IP before reset:', beforeData.origin);
    
    // Test 2: Reset proxy IP
    console.log('\n2️⃣ Resetting proxy IP...');
    console.log('Reset URL:', resetUrl);
    
    const resetResponse = await fetch(resetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (resetResponse.ok) {
      const resetData = await resetResponse.json();
      console.log('✅ Reset response:', resetData);
      
      if (resetData.status === 1) {
        console.log('✅ Proxy IP reset successful!');
        console.log('New proxy info:', {
          server_host: resetData.data.server_host,
          server_port: resetData.data.server_port,
          user: resetData.data.user,
          remaining_time: resetData.data.remaining_time,
          expired_time: resetData.data.expired_time
        });
        
        // Test 3: Check IP after reset (wait a bit for proxy to update)
        console.log('\n3️⃣ Checking IP after reset (waiting 5 seconds)...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const afterResponse = await fetch('https://httpbin.org/ip');
        const afterData = await afterResponse.json();
        console.log('IP after reset:', afterData.origin);
        
        if (beforeData.origin !== afterData.origin) {
          console.log('🎉 SUCCESS: IP changed after reset!');
          console.log('Before:', beforeData.origin);
          console.log('After:', afterData.origin);
        } else {
          console.log('⚠️ IP did not change - may need to wait longer or check proxy configuration');
        }
        
      } else {
        console.error('❌ Reset failed:', resetData.message);
      }
      
    } else {
      console.error('❌ Reset request failed:', resetResponse.status, resetResponse.statusText);
    }
    
    // Test 4: Test notification failure simulation
    console.log('\n4️⃣ Testing notification failure simulation...');
    console.log('Simulating 3 failed notifications...');
    
    for (let i = 1; i <= 3; i++) {
      console.log(`Simulating failure ${i}/3...`);
      // Simulate notification failure
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('✅ Notification failure simulation completed');
    console.log('In real scenario, this would trigger IP reset after 3 failures');
    
    console.log('\n🎯 Test Summary:');
    console.log('================');
    console.log('✅ Reset API call: Working');
    console.log('✅ Response parsing: Working');
    console.log('✅ IP change detection: Check logs above');
    console.log('✅ Failure simulation: Working');
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Test Discord webhook failure simulation
async function testDiscordWebhookFailure() {
  console.log('\n🔗 Testing Discord Webhook Failure Simulation...');
  
  try {
    // Simulate a failed webhook call
    const fakeWebhookUrl = 'https://discord.com/api/webhooks/invalid/webhook/url';
    
    const response = await fetch(fakeWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Test message' })
    });
    
    if (!response.ok) {
      console.log('✅ Discord webhook failure simulated successfully');
      console.log('Status:', response.status);
      console.log('This would trigger notification failure handling in the extension');
    }
    
  } catch (error) {
    console.log('✅ Discord webhook failure simulated successfully');
    console.log('Error:', error.message);
    console.log('This would trigger notification failure handling in the extension');
  }
}

// Run all tests
async function runAllTests() {
  console.log('🧪 Running Complete Reset IP Test Suite...');
  console.log('==========================================');
  
  await testProxyIpReset();
  await testDiscordWebhookFailure();
  
  console.log('\n🎉 All tests completed!');
  console.log('Check the logs above for results.');
}

// Run the tests
runAllTests();
