

// require('dotenv').config();
// const mongoose = require('mongoose');

// const connectDB = async () => {
//   const uri = process.env.DATABASE_URL;
//   if (!uri) {
//     console.error('Error: DATABASE_URL is undefined. Please check your .env file.');
//     process.exit(1);
//   }
  
//   try {
//     await mongoose.connect(uri, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true
//     });
//     console.log('MongoDB connected');
//   } catch (error) {
//     console.error('MongoDB connection error:', error.message);
//     process.exit(1);
//   }
// };

// module.exports = { connectDB };



require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.DATABASE_URL;

  if (!uri) {
    console.error('❌ DATABASE_URL is undefined. Please check your .env file.');
    // process.exit(1);
  }

  try {
    await mongoose.connect(uri); // ✅ no options needed in Mongoose v6+
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // process.exit(1);
  }
};

module.exports = { connectDB };
