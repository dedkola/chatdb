// Test script to see what data gets extracted from conversations.json
const fs = require('fs');

function generateRandomId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

function cleanConversationData(rawData) {
  const messages = [];
  
  if (rawData.mapping) {
    Object.values(rawData.mapping).forEach((node) => {
      const msg = node.message;
      if (!msg) return;
      
      const role = msg.author?.role;
      if (role !== 'user' && role !== 'assistant') return;
      
      if (msg.content?.parts && msg.content.parts.length > 0) {
        const content = msg.content.parts.join('\n').trim();
        if (content) {
          messages.push({
            role: role,
            content: content,
            timestamp: msg.create_time,
          });
        }
      }
    });
  }

  return {
    conversation_id: rawData.id,
    random_id: generateRandomId(),
    title: rawData.title || 'Untitled Conversation',
    default_model_slug: rawData.default_model_slug,
    created_at: rawData.create_time ? new Date(rawData.create_time * 1000) : new Date(),
    updated_at: rawData.update_time ? new Date(rawData.update_time * 1000) : new Date(),
    added_to_database: new Date(),
    messages: messages,
    message_count: messages.length,
  };
}

// Read the conversations.json file
const rawConversations = JSON.parse(fs.readFileSync('conversations.json', 'utf8'));

console.log('📊 Total conversations in file:', rawConversations.length);
console.log('\n' + '='.repeat(80));

// Test with first 3 conversations
rawConversations.slice(0, 3).forEach((conv, idx) => {
  console.log(`\n🔍 Conversation ${idx + 1}:`);
  console.log('─'.repeat(80));
  
  const cleaned = cleanConversationData(conv);
  
  console.log('Title:', cleaned.title);
  console.log('Model:', cleaned.default_model_slug);
  console.log('Messages:', cleaned.message_count);
  console.log('Created:', cleaned.created_at.toISOString());
  
  console.log('\n💬 Messages:');
  cleaned.messages.forEach((msg, i) => {
    const preview = msg.content.substring(0, 80).replace(/\n/g, ' ');
    console.log(`  ${i + 1}. [${msg.role}] ${preview}${msg.content.length > 80 ? '...' : ''}`);
  });
});

console.log('\n' + '='.repeat(80));
console.log('✅ Test complete! This is what will be stored in MongoDB.');
