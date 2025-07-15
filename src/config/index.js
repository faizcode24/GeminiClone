

// require('dotenv').config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });
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
//     console.log('✅ MongoDB connected successfully');
//   } catch (error) {
//     console.error('MongoDB connection error:', error.message);
//     process.exit(1);
//   }
// };

// module.exports = { connectDB };


require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.DATABASE_URL;

  if (!uri) {
    console.error('❌ Error: DATABASE_URL is undefined. Please check your .env file.');
    process.exit(1);
  }

  try {
    // ✅ Cleaned up connection (Mongoose v6+ doesn't need options)
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
