const { GoogleGenAI } = require('@google/genai');

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload)
  };
}

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = JSON.parse(event.body || '{}');
    if (typeof prompt !== 'string' || !prompt.trim()) {
      return jsonResponse(400, { error: 'El mensaje no puede estar vacío' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('Falta configurar la variable GEMINI_API_KEY');
      return jsonResponse(500, { error: 'GEMINI_API_KEY no está configurada' });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        timeout: 10000,
        retryOptions: { attempts: 1 }
      }
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Eres un asistente de compras experto, amable y conciso para "DashStore", una tienda online. Ayuda a los usuarios a elegir productos, resolver dudas sobre compras y guiarles en el carrito. Responde siempre de forma amigable y en español.\n\nUsuario: ${prompt}`
            }
          ]
        }
      ]
    });

    return jsonResponse(200, { text: response.text || '' });

  } catch (error) {
    console.error('Error en la Netlify Function:', error);
    const message = String(error?.message || '');
    const isTimeout = ['TimeoutError', 'AbortError'].includes(error?.name) || error?.status === 504 || /deadline|timed? ?out|timeout/i.test(message);
    const isUnavailable = error?.status === 429 || error?.status === 503;

    if (isTimeout) {
      return jsonResponse(504, { error: 'Gemini tardó demasiado en responder. Inténtalo de nuevo.' });
    }

    if (isUnavailable) {
      return jsonResponse(502, { error: 'Gemini está temporalmente saturado o alcanzó su límite gratuito. Inténtalo de nuevo en unos minutos.' });
    }

    return jsonResponse(502, { error: 'No se pudo generar una respuesta. Revisa los logs de la función en Netlify.' });
  }
};
