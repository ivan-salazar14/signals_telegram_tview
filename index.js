import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// Middleware
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('✅ Webhook activo para TradingView + Telegram');
});

// Main webhook
app.post('/webhook', async (req, res) => {
  const data = req.body;

  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'No se recibió ningún dato válido' });
  }

  const { pair, signal, timeframe, price, comment } = data;

  const mensaje = `
📡 *ALERTA DE TRADINGVIEW*  
*Par:* ${pair || 'No especificado'}  
*Señal:* ${signal || 'N/A'}  
*Temporalidad:* ${timeframe || 'N/A'}  
*Precio:* ${price || 'N/A'}  
${comment ? `📝 Comentario: ${comment}` : ''}
  `;

  // Enviar a Telegram
  try {
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: mensaje,
        parse_mode: 'Markdown'
      })
    });

    const result = await response.json();

    if (!result.ok) {
      console.error('❌ Error al enviar a Telegram:', result);
    }

    res.status(200).json({ status: 'ok', telegram: result.ok });
  } catch (error) {
    console.error('❌ Error en el webhook:', error.message);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Webhook corriendo en puerto ${PORT}`);
});
