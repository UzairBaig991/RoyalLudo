export const CONFIG = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/royal-ludo',
  jwtSecret: process.env.JWT_SECRET || 'royal_ludo_jwt_secret_key_2026_super_secure',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || '*',
};
