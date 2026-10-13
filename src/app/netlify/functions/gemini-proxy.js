const { GoogleGenAI } = require('@google/genai');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'GEMINI_API_KEY no está configurada' }) };
    }

    // Inicializamos el cliente oficial de Google Gen AI con la clave de entorno
    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Llamamos al modelo gemini-1.5-flash utilizando el SDK oficial
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
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

    return {
      statusCode: 200,
      body: JSON.stringify({ text: response.text })
    };

  } catch (error) {
    console.error('Error en la Netlify Function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Error interno del servidor' })
    };
  }
};
