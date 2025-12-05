const mongoose = require('mongoose');
require('dotenv').config();

const fixIndexes = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('watchlists');

    console.log('\n📋 Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx.key));
    });

    // Drop the problematic indexes
    console.log('\n🗑️  Dropping old indexes...');
    try {
      await collection.dropIndex('user_1_content_1');
      console.log('  ✅ Dropped user_1_content_1');
    } catch (err) {
      console.log('  ⚠️  Index user_1_content_1 not found (already dropped?)');
    }

    try {
      await collection.dropIndex('user_1_customTitle_1');
      console.log('  ✅ Dropped user_1_customTitle_1');
    } catch (err) {
      console.log('  ⚠️  Index user_1_customTitle_1 not found (already dropped?)');
    }

    // Create new indexes with proper partial filters
    console.log('\n➕ Creating new indexes...');
    
    await collection.createIndex(
      { user: 1, content: 1 },
      { 
        unique: true,
        partialFilterExpression: { content: { $type: 'objectId' } },
        name: 'user_1_content_1_partial'
      }
    );
    console.log('  ✅ Created user_1_content_1_partial (only for items with contentId)');

    await collection.createIndex(
      { user: 1, customTitle: 1 },
      { 
        unique: true,
        partialFilterExpression: { customTitle: { $exists: true, $type: 'string' } },
        name: 'user_1_customTitle_1_partial'
      }
    );
    console.log('  ✅ Created user_1_customTitle_1_partial (only for custom titles)');

    console.log('\n📋 New indexes:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx.key));
      if (idx.partialFilterExpression) {
        console.log(`    Filter:`, JSON.stringify(idx.partialFilterExpression));
      }
    });

    console.log('\n✅ Index fix complete! You can now add multiple items to watchlist.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

fixIndexes();
