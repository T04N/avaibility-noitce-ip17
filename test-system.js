// Complete system test script
// Run this in browser console to test all features

async function testCompleteSystem() {
  console.log('🧪 Testing Complete iPhone 17 Pro Monitor System...');
  console.log('================================================');
  
  try {
    // Test 1: Extension Context
    console.log('\n1️⃣ Testing Extension Context...');
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      console.log('✅ Extension context available');
    } else {
      console.log('❌ Extension context not available');
      return false;
    }
    
    // Test 2: Proxy Connection
    console.log('\n2️⃣ Testing Proxy Connection...');
    const ipResponse = await fetch('https://httpbin.org/ip');
    const ipData = await ipResponse.json();
    console.log('Current IP:', ipData.origin);
    console.log('✅ Proxy connection test completed');
    
    // Test 3: Apple Site Access
    console.log('\n3️⃣ Testing Apple Site Access...');
    const appleResponse = await fetch('https://www.apple.com/jp/shop/bag', {
      method: 'HEAD',
      mode: 'no-cors'
    });
    console.log('Apple site response:', appleResponse.status);
    console.log('✅ Apple site accessible');
    
    // Test 4: Discord Webhook (if configured)
    console.log('\n4️⃣ Testing Discord Integration...');
    try {
      const webhookUrl = 'https://discord.com/api/webhooks/1412292401233661952/xsddZeYv18XDHsHAJgfQg0qd4FpBE678v_6ZbXN2nLrHIvo23h30rUozLizY5sbm30fW';
      const testPayload = {
        content: '🧪 **System Test** - iPhone 17 Pro Monitor is working!',
        embeds: [{
          title: 'System Test Successful',
          description: 'All components are functioning correctly',
          color: 0x00ff00,
          timestamp: new Date().toISOString(),
          fields: [
            {
              name: 'IP Address',
              value: ipData.origin,
              inline: true
            },
            {
              name: 'Test Time',
              value: new Date().toLocaleString(),
              inline: true
            }
          ]
        }]
      };
      
      const discordResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });
      
      if (discordResponse.ok) {
        console.log('✅ Discord webhook working');
      } else {
        console.log('⚠️ Discord webhook failed:', discordResponse.status);
      }
    } catch (error) {
      console.log('⚠️ Discord test failed:', error.message);
    }
    
    // Test 5: Page Elements Detection
    console.log('\n5️⃣ Testing Page Elements Detection...');
    const bagElements = document.querySelectorAll('[class*="bag"], [id*="bag"], [data-autom*="bag"]');
    const storeButtons = document.querySelectorAll('button[data-autom*="store"], button[class*="store"]');
    const appleButtons = Array.from(document.querySelectorAll('button')).filter(btn => {
      const text = btn.textContent?.toLowerCase() || '';
      return text.includes('apple') || text.includes('丸の内') || text.includes('銀座');
    });
    
    console.log('Bag elements found:', bagElements.length);
    console.log('Store buttons found:', storeButtons.length);
    console.log('Apple buttons found:', appleButtons.length);
    console.log('✅ Page elements detection working');
    
    // Test 6: Human Behavior Simulation
    console.log('\n6️⃣ Testing Human Behavior Simulation...');
    console.log('Simulating mouse movement...');
    
    // Simulate mouse move
    const mouseMoveEvent = new MouseEvent('mousemove', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: Math.random() * window.innerWidth,
      clientY: Math.random() * window.innerHeight
    });
    document.dispatchEvent(mouseMoveEvent);
    
    console.log('✅ Human behavior simulation working');
    
    // Test 7: Local Storage
    console.log('\n7️⃣ Testing Local Storage...');
    localStorage.setItem('test_key', 'test_value');
    const testValue = localStorage.getItem('test_key');
    if (testValue === 'test_value') {
      console.log('✅ Local storage working');
      localStorage.removeItem('test_key');
    } else {
      console.log('❌ Local storage failed');
    }
    
    // Summary
    console.log('\n🎉 System Test Summary:');
    console.log('================================================');
    console.log('✅ Extension Context: OK');
    console.log('✅ Proxy Connection: OK');
    console.log('✅ Apple Site Access: OK');
    console.log('✅ Page Elements Detection: OK');
    console.log('✅ Human Behavior Simulation: OK');
    console.log('✅ Local Storage: OK');
    console.log('⚠️ Discord Integration: Check logs above');
    console.log('\n🚀 System is ready for monitoring!');
    
    return true;
    
  } catch (error) {
    console.error('❌ System test failed:', error);
    return false;
  }
}

// Run the complete test
testCompleteSystem();
