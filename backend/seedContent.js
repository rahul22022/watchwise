const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Content = require('./models/Content');

dotenv.config();

// Sample content data
const sampleContent = [
  {
    title: "Stranger Things",
    type: "TV Show",
    genres: ["Sci-Fi", "Horror", "Drama"],
    platforms: [{ name: "Netflix", available: true }],
    description: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    releaseYear: 2016,
    rating: 8.7
  },
  {
    title: "The Last of Us",
    type: "TV Show",
    genres: ["Drama", "Action", "Sci-Fi"],
    platforms: [{ name: "HBO Max", available: true }],
    description: "After a global pandemic destroys civilization, a hardened survivor takes charge of a 14-year-old girl who may be humanity's last hope.",
    releaseYear: 2023,
    rating: 8.8
  },
  {
    title: "The Boys",
    type: "TV Show",
    genres: ["Action", "Comedy", "Crime"],
    platforms: [{ name: "Prime Video", available: true }],
    description: "A group of vigilantes set out to take down corrupt superheroes who abuse their superpowers.",
    releaseYear: 2019,
    rating: 8.7
  },
  {
    title: "Ted Lasso",
    type: "TV Show",
    genres: ["Comedy", "Drama", "Sports"],
    platforms: [{ name: "Apple TV+", available: true }],
    description: "American football coach Ted Lasso heads to London to manage AFC Richmond, a struggling English Premier League football team.",
    releaseYear: 2020,
    rating: 8.8
  },
  {
    title: "The Mandalorian",
    type: "TV Show",
    genres: ["Action", "Adventure", "Sci-Fi"],
    platforms: [{ name: "Disney+", available: true }],
    description: "The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.",
    releaseYear: 2019,
    rating: 8.7
  },
  {
    title: "Breaking Bad",
    type: "TV Show",
    genres: ["Crime", "Drama", "Thriller"],
    platforms: [{ name: "Netflix", available: true }],
    description: "A high school chemistry teacher diagnosed with terminal cancer teams up with a former student to manufacture crystal meth to secure his family's future.",
    releaseYear: 2008,
    rating: 9.5
  },
  {
    title: "The Bear",
    type: "TV Show",
    genres: ["Comedy", "Drama"],
    platforms: [{ name: "Hulu", available: true }],
    description: "A young chef from the fine dining world returns home to run his family's sandwich shop.",
    releaseYear: 2022,
    rating: 8.6
  },
  {
    title: "Succession",
    type: "TV Show",
    genres: ["Drama"],
    platforms: [{ name: "HBO Max", available: true }],
    description: "The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their father steps down from the company.",
    releaseYear: 2018,
    rating: 8.9
  },
  {
    title: "Inception",
    type: "Movie",
    genres: ["Action", "Sci-Fi", "Thriller"],
    platforms: [
      { name: "HBO Max", available: true },
      { name: "Prime Video", available: true }
    ],
    description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
    releaseYear: 2010,
    rating: 8.8
  },
  {
    title: "The Dark Knight",
    type: "Movie",
    genres: ["Action", "Crime", "Drama"],
    platforms: [
      { name: "HBO Max", available: true },
      { name: "Netflix", available: true }
    ],
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
    releaseYear: 2008,
    rating: 9.0
  },
  {
    title: "Parasite",
    type: "Movie",
    genres: ["Drama", "Thriller"],
    platforms: [{ name: "Hulu", available: true }],
    description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    releaseYear: 2019,
    rating: 8.5
  },
  {
    title: "Everything Everywhere All at Once",
    type: "Movie",
    genres: ["Action", "Adventure", "Comedy"],
    platforms: [
      { name: "Paramount+", available: true },
      { name: "Prime Video", available: true }
    ],
    description: "An aging Chinese immigrant is swept up in an insane adventure, where she alone can save the world by exploring other universes.",
    releaseYear: 2022,
    rating: 8.1
  },
  {
    title: "The Shawshank Redemption",
    type: "Movie",
    genres: ["Drama"],
    platforms: [
      { name: "Netflix", available: true },
      { name: "Prime Video", available: true }
    ],
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    releaseYear: 1994,
    rating: 9.3
  },
  {
    title: "Oppenheimer",
    type: "Movie",
    genres: ["Biography", "Drama", "History"],
    platforms: [{ name: "Peacock", available: true }],
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    releaseYear: 2023,
    rating: 8.5
  },
  {
    title: "The Office",
    type: "TV Show",
    genres: ["Comedy"],
    platforms: [{ name: "Peacock", available: true }],
    description: "A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.",
    releaseYear: 2005,
    rating: 9.0
  },
  {
    title: "Game of Thrones",
    type: "TV Show",
    genres: ["Action", "Adventure", "Drama", "Fantasy"],
    platforms: [{ name: "HBO Max", available: true }],
    description: "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.",
    releaseYear: 2011,
    rating: 9.2
  },
  {
    title: "The Crown",
    type: "TV Show",
    genres: ["Drama", "History", "Biography"],
    platforms: [{ name: "Netflix", available: true }],
    description: "Follows the political rivalries and romance of Queen Elizabeth II's reign and the events that shaped the second half of the 20th century.",
    releaseYear: 2016,
    rating: 8.6
  },
  {
    title: "Dune",
    type: "Movie",
    genres: ["Action", "Adventure", "Drama", "Sci-Fi"],
    platforms: [{ name: "HBO Max", available: true }],
    description: "Paul Atreides, a brilliant young man, must travel to the most dangerous planet to ensure the future of his family and his people.",
    releaseYear: 2021,
    rating: 8.0
  },
  {
    title: "Spider-Man: Across the Spider-Verse",
    type: "Movie",
    genres: ["Animation", "Action", "Adventure"],
    platforms: [{ name: "Netflix", available: true }],
    description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its existence.",
    releaseYear: 2023,
    rating: 8.7
  },
  {
    title: "Only Murders in the Building",
    type: "TV Show",
    genres: ["Comedy", "Crime", "Mystery"],
    platforms: [{ name: "Hulu", available: true }],
    description: "Three strangers who share an obsession with true crime suddenly find themselves wrapped up in one.",
    releaseYear: 2021,
    rating: 8.1
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Clear existing content
    await Content.deleteMany({});
    console.log('Cleared existing content');

    // Insert sample content
    await Content.insertMany(sampleContent);
    console.log(`Added ${sampleContent.length} content items`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
