// Test the save endpoint
async function testSave() {
  try {
    const response = await fetch('http://localhost:3000/api/chat/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Save from Script',
        messages: [
          { role: 'user', content: 'Hello test', timestamp: Math.floor(Date.now() / 1000) },
          { role: 'assistant', content: 'Hi test response', timestamp: Math.floor(Date.now() / 1000) + 1 }
        ],
        model: 'test-model'
      }),
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Save successful!');
      console.log('📝 Conversation ID:', data.conversation_id);
    } else {
      console.log('❌ Save failed:', data.error);
      if (data.details) {
        console.log('Details:', data.details);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSave();
