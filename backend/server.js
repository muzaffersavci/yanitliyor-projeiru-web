const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviews');
const businessRoutes = require('./routes/business');
const adminRoutes = require('./routes/admin');
const consultantRoutes = require('./routes/consultant');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('CORS politikası ihlali'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/consultant', consultantRoutes);
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/competitor-analysis', require('./routes/competitor'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Yanıtlıyor API çalışıyor.' }));

app.use(errorHandler);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB bağlandı');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`));
  })
  .catch((err) => {
    console.error('MongoDB bağlantı hatası:', err.message);
    process.exit(1);
  });
