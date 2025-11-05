// Quick script to check MongoDB database contents
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Read .env file manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');
envLines.forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    process.env[key] = value;
  }
});

async function checkDatabase() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found in .env file');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas\n');

    const db = client.db('dbs');
    const collection = db.collection('conversations');

    // Get total count
    const totalCount = await collection.countDocuments();
    console.log(`📊 Total conversations: ${totalCount}\n`);

    // Count by source
    const chatgptCount = await collection.countDocuments({ source: 'chatgpt' });
    const ollamaCount = await collection.countDocuments({ source: 'ollama' });
    
    console.log(`🟢 ChatGPT conversations: ${chatgptCount}`);
    console.log(`🔵 Ollama conversations: ${ollamaCount}\n`);

    // Get recent Ollama conversations
    const recentOllama = await collection
      .find({ source: 'ollama' })
      .sort({ added_to_database: -1 })
      .limit(5)
      .toArray();

    if (recentOllama.length > 0) {
      console.log('🔵 Recent Ollama conversations:\n');
      recentOllama.forEach((conv, i) => {
        console.log(`${i + 1}. ${conv.title}`);
        console.log(`   Model: ${conv.default_model_slug}`);
        console.log(`   Messages: ${conv.message_count}`);
        console.log(`   Added: ${new Date(conv.added_to_database).toLocaleString()}`);
        console.log(`   ID: ${conv.conversation_id}\n`);
      });
    } else {
      console.log('❌ No Ollama conversations found in database\n');
      console.log('💡 Make sure to:');
      console.log('   1. Start Ollama: ollama serve');
      console.log('   2. Chat at http://localhost:3000/chat');
      console.log('   3. Conversations auto-save after each response\n');
    }

    // Get recent ChatGPT conversations
    const recentChatGPT = await collection
      .find({ source: 'chatgpt' })
      .sort({ added_to_database: -1 })
      .limit(3)
      .toArray();

    if (recentChatGPT.length > 0) {
      console.log('🟢 Recent ChatGPT conversations:\n');
      recentChatGPT.forEach((conv, i) => {
        console.log(`${i + 1}. ${conv.title}`);
        console.log(`   Model: ${conv.default_model_slug || 'N/A'}`);
        console.log(`   Messages: ${conv.message_count}`);
        console.log(`   Added: ${new Date(conv.added_to_database).toLocaleString()}\n`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('✅ Connection closed');
  }
}

checkDatabase();
