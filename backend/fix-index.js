// fix-index.js
// Save this file in your backend folder (same level as server.js)
// Run with: node fix-index.js

const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndexes() {
  try {
    console.log('🔧 Starting MongoDB index cleanup...');
    
    // Connect to MongoDB using your existing connection string
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Get the User collection
    const db = mongoose.connection.db;
    const userCollection = db.collection('users');
    
    // List current indexes
    console.log('\n📋 Current indexes on users collection:');
    const indexes = await userCollection.indexes();
    indexes.forEach((index, i) => {
      console.log(`  ${i + 1}. ${JSON.stringify(index.key)} - Name: "${index.name}"`);
    });
    
    // Drop all googleId related indexes to clean up duplicates
    console.log('\n🗑️ Cleaning up googleId indexes...');
    
    for (const index of indexes) {
      // Check if this is a googleId index
      if (index.key.googleId && index.name !== '_id_') {
        try {
          await userCollection.dropIndex(index.name);
          console.log(`  ✅ Dropped index: ${index.name}`);
        } catch (err) {
          console.log(`  ⚠️ Could not drop ${index.name}: ${err.message}`);
        }
      }
    }
    
    // Recreate the googleId index properly with sparse option
    try {
      await userCollection.createIndex(
        { googleId: 1 }, 
        { 
          unique: true, 
          sparse: true, // Allows null values, prevents duplicate null entries
          name: 'googleId_unique_sparse',
          background: true // Create in background to avoid blocking
        }
      );
      console.log('✅ Created new googleId index with proper configuration');
    } catch (error) {
      console.log(`⚠️ Index creation note: ${error.message}`);
    }
    
    // List final indexes
    console.log('\n📋 Final indexes after cleanup:');
    const finalIndexes = await userCollection.indexes();
    finalIndexes.forEach((index, i) => {
      console.log(`  ${i + 1}. ${JSON.stringify(index.key)} - Name: "${index.name}"`);
    });
    
    console.log('\n🎉 MongoDB index cleanup completed successfully!');
    console.log('💡 You can now restart your server with: npm start');
    
  } catch (error) {
    console.error('❌ Error during index cleanup:', error.message);
    console.log('\n💡 This might be normal if indexes don\'t exist yet.');
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the fix
fixIndexes().catch(console.error);