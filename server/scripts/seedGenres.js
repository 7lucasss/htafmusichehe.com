const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Genre = require('../models/Genre');
const User = require('../models/User');

// Load env variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
};

// Default genres from the Song model
const defaultGenres = [
  {
    name: 'Pop',
    description: 'Nhạc pop phổ biến với giai điệu dễ nghe',
    color: '#ff6b6b',
    sortOrder: 1
  },
  {
    name: 'Rock',
    description: 'Nhạc rock với guitar mạnh mẽ và rhythm sôi động',
    color: '#4ecdc4',
    sortOrder: 2
  },
  {
    name: 'Hip-hop',
    description: 'Nhạc hip-hop với beat mạnh và rap',
    color: '#45b7d1',
    sortOrder: 3
  },
  {
    name: 'R&B',
    description: 'Rhythm and Blues với soul và cảm xúc',
    color: '#96ceb4',
    sortOrder: 4
  },
  {
    name: 'Jazz',
    description: 'Nhạc jazz với improvisation và swing',
    color: '#feca57',
    sortOrder: 5
  },
  {
    name: 'Electronic',
    description: 'Nhạc điện tử với synthesizer và beats',
    color: '#ff9ff3',
    sortOrder: 6
  },
  {
    name: 'Classical',
    description: 'Nhạc cổ điển với orchestra và compositions',
    color: '#54a0ff',
    sortOrder: 7
  },
  {
    name: 'Folk',
    description: 'Nhạc dân gian truyền thống',
    color: '#5f27cd',
    sortOrder: 8
  },
  {
    name: 'Country',
    description: 'Nhạc country với guitar acoustic và storytelling',
    color: '#00d2d3',
    sortOrder: 9
  },
  {
    name: 'Blues',
    description: 'Nhạc blues với cảm xúc và guitar',
    color: '#ff6348',
    sortOrder: 10
  },
  {
    name: 'Indie',
    description: 'Nhạc độc lập với phong cách riêng biệt',
    color: '#2ed573',
    sortOrder: 11
  },
  {
    name: 'Rap',
    description: 'Nhạc rap với lyrics nhanh và rhythm',
    color: '#747d8c',
    sortOrder: 12
  },
  {
    name: 'Nhạc Việt',
    description: 'Nhạc Việt Nam đương đại và truyền thống',
    color: '#ff4757',
    sortOrder: 13
  },
  {
    name: 'Acoustic',
    description: 'Nhạc acoustic với guitar và vocal tự nhiên',
    color: '#3742fa',
    sortOrder: 14
  }
];

const seedGenres = async () => {
  try {
    await connectDB();

    // Find an admin user to assign as creator
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('No admin user found. Creating a system admin user for seeding...');
      adminUser = new User({
        name: 'System Admin',
        email: 'system@htafmusic.com',
        password: 'system123', // This will be hashed by the pre-save middleware
        role: 'admin'
      });
      await adminUser.save();
      console.log('System admin user created');
    }

    // Clear existing genres
    await Genre.deleteMany({});
    console.log('Existing genres cleared');

    // Create new genres
    const genresWithCreator = defaultGenres.map(genre => ({
      ...genre,
      createdBy: adminUser._id
    }));

    const createdGenres = await Genre.insertMany(genresWithCreator);
    console.log(`${createdGenres.length} genres created successfully`);

    // Display created genres
    createdGenres.forEach(genre => {
      console.log(`- ${genre.name}: ${genre.description}`);
    });

    console.log('Genre seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding genres:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedGenres(); 