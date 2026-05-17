// ============================================
// Punto de entrada del servidor
// ============================================

import app from './app';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('');
  console.log('🛒 ================================');
  console.log('   LESLIE MINIMARKET BACKEND');
  console.log('🛒 ================================');
  console.log(`🚀 Servidor en: http://localhost:${PORT}`);
  console.log(`📋 API Docs:    http://localhost:${PORT}/api/health`);
  console.log('🛒 ================================');
  console.log('');
});