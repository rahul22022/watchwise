const mongoose = require('mongoose');
const dotenv = require('dotenv');
const NetworkContent = require('./models/NetworkContent');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mock data generator for testing
const PLATFORMS = ['Netflix', 'HBO Max', 'Prime Video', 'Disney+', 'Hulu', 'Apple TV+', 'Peacock', 'Paramount+'];

const GENRES_LIST = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
  'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'
];

const SAMPLE_TITLES = {
  'Action': [
    { title: 'John Wick: Chapter 4', type: 'Movie', year: 2023, rating: 8.2 },
    { title: 'Mission: Impossible - Dead Reckoning', type: 'Movie', year: 2023, rating: 8.0 },
    { title: 'The Raid', type: 'Movie', year: 2011, rating: 7.6 },
    { title: 'Mad Max: Fury Road', type: 'Movie', year: 2015, rating: 8.1 },
    { title: 'Jack Ryan', type: 'TV Show', year: 2018, rating: 8.0 }
  ],
  'Comedy': [
    { title: 'Abbott Elementary', type: 'TV Show', year: 2021, rating: 8.2 },
    { title: 'The Good Place', type: 'TV Show', year: 2016, rating: 8.2 },
    { title: 'Palm Springs', type: 'Movie', year: 2020, rating: 7.4 },
    { title: 'Schitts Creek', type: 'TV Show', year: 2015, rating: 8.5 },
    { title: 'Brooklyn Nine-Nine', type: 'TV Show', year: 2013, rating: 8.4 }
  ],
  'Drama': [
    { title: 'The White Lotus', type: 'TV Show', year: 2021, rating: 8.0 },
    { title: 'Yellowstone', type: 'TV Show', year: 2018, rating: 8.7 },
    { title: 'The Dropout', type: 'TV Show', year: 2022, rating: 7.8 },
    { title: 'Mare of Easttown', type: 'TV Show', year: 2021, rating: 8.5 },
    { title: 'The Power of the Dog', type: 'Movie', year: 2021, rating: 6.8 }
  ],
  'Sci-Fi': [
    { title: 'Foundation', type: 'TV Show', year: 2021, rating: 7.5 },
    { title: 'Severance', type: 'TV Show', year: 2022, rating: 8.7 },
    { title: 'For All Mankind', type: 'TV Show', year: 2019, rating: 8.0 },
    { title: 'Westworld', type: 'TV Show', year: 2016, rating: 8.5 },
    { title: 'Dune: Part Two', type: 'Movie', year: 2024, rating: 8.8 }
  ],
  'Horror': [
    { title: 'The Fall of the House of Usher', type: 'TV Show', year: 2023, rating: 7.9 },
    { title: 'Wednesday', type: 'TV Show', year: 2022, rating: 8.1 },
    { title: 'A Quiet Place Part II', type: 'Movie', year: 2021, rating: 7.3 },
    { title: 'The Haunting of Hill House', type: 'TV Show', year: 2018, rating: 8.6 },
    { title: 'Talk to Me', type: 'Movie', year: 2022, rating: 7.1 }
  ],
  'Thriller': [
    { title: 'Reacher', type: 'TV Show', year: 2022, rating: 8.1 },
    { title: 'The Terminal List', type: 'TV Show', year: 2022, rating: 7.9 },
    { title: 'The Night Agent', type: 'TV Show', year: 2023, rating: 7.5 },
    { title: 'The Watcher', type: 'TV Show', year: 2022, rating: 7.0 },
    { title: 'Glass Onion', type: 'Movie', year: 2022, rating: 7.2 }
  ],
  'Crime': [
    { title: 'True Detective', type: 'TV Show', year: 2014, rating: 8.9 },
    { title: 'Mindhunter', type: 'TV Show', year: 2017, rating: 8.6 },
    { title: 'Ozark', type: 'TV Show', year: 2017, rating: 8.5 },
    { title: 'Fargo', type: 'TV Show', year: 2014, rating: 8.9 },
    { title: 'The Irishman', type: 'Movie', year: 2019, rating: 7.8 }
  ],
  'Documentary': [
    { title: 'The Last Dance', type: 'TV Show', year: 2020, rating: 9.1 },
    { title: 'Our Planet', type: 'TV Show', year: 2019, rating: 9.3 },
    { title: 'The Social Dilemma', type: 'Movie', year: 2020, rating: 7.6 },
    { title: 'Making a Murderer', type: 'TV Show', year: 2015, rating: 8.6 },
    { title: 'Prehistoric Planet', type: 'TV Show', year: 2022, rating: 8.6 }
  ]
};

const generateMockContent = (itemsPerPlatform = 25) => {
  const content = [];
  
  PLATFORMS.forEach(platform => {
    let itemCount = 0;
    
    Object.keys(SAMPLE_TITLES).forEach(genre => {
      SAMPLE_TITLES[genre].forEach(item => {
        if (itemCount >= itemsPerPlatform) return;
        
        // Randomly assign to platform to create variety
        if (Math.random() > 0.4) {
          content.push({
            title: item.title,
            type: item.type,
            genres: [genre, GENRES_LIST[Math.floor(Math.random() * GENRES_LIST.length)]],
            platform: platform,
            description: `${item.title} is a ${item.type.toLowerCase()} that brings ${genre.toLowerCase()} to life.`,
            releaseYear: item.year,
            rating: item.rating,
            externalSource: 'mock',
            lastUpdated: new Date()
          });
          itemCount++;
        }
      });
    });
  });
  
  return content;
};

const seedMockData = async () => {
  try {
    console.log('🗑️  Clearing existing network content...');
    await NetworkContent.deleteMany({ externalSource: 'mock' });
    
    console.log('📦 Generating mock data...');
    const mockContent = generateMockContent(25);
    
    console.log(`💾 Saving ${mockContent.length} items to database...`);
    
    let inserted = 0;
    let failed = 0;
    
    for (const item of mockContent) {
      try {
        await NetworkContent.findOneAndUpdate(
          { title: item.title, platform: item.platform },
          item,
          { upsert: true, new: true }
        );
        inserted++;
        process.stdout.write(`\r✓ Inserted: ${inserted}/${mockContent.length}`);
      } catch (error) {
        failed++;
        if (failed < 5) {
          console.error(`\n❌ Error saving ${item.title}:`, error.message);
        }
      }
    }
    
    console.log(`\n\n✅ Seeding complete!`);
    console.log(`   - Successfully inserted/updated: ${inserted}`);
    console.log(`   - Failed: ${failed}`);
    
    // Show statistics
    const stats = await NetworkContent.aggregate([
      { $match: { externalSource: 'mock' } },
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📊 Content by Platform:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} titles`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedMockData();
