const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

const processGeminiMessage = async (content) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(content);
    return result.response.text();
  } catch (error) {
    throw new Error('Gemini API error: ' + error.message);
  }
};

module.exports = { processGeminiMessage };