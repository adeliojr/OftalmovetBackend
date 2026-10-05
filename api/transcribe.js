// api/transcribe.js
// Recebe um trecho de áudio da consulta e devolve o texto transcrito (via OpenAI).
// A chave da OpenAI fica só aqui no servidor — nunca no navegador.

module.exports = async (req, res) => {
  // Libera acesso apenas via POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  // Proteção simples contra uso indevido por terceiros
  if (req.headers["x-app-secret"] !== process.env.APP_SECRET) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  try {
    // Lê o áudio bruto enviado pelo navegador
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    if (buffer.length === 0) {
      return res.status(200).json({ text: "" });
    }

    const contentType = req.headers["content-type"] || "audio/webm";
    const blob = new Blob([buffer], { type: contentType });

    const formData = new FormData();
    formData.append("file", blob, "audio.webm");
    formData.append("model", "gpt-4o-mini-transcribe"); // modelo mais barato ($0,003/min)
    formData.append("language", "pt");

    const openaiRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: formData
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error("Erro OpenAI:", errText);
      return res.status(502).json({ error: "Falha na transcrição", detail: errText });
    }

    const data = await openaiRes.json();
    return res.status(200).json({ text: data.text || "" });

  } catch (err) {
    console.error("Erro no /api/transcribe:", err);
    return res.status(500).json({ error: "Erro interno na transcrição" });
  }
};

// Necessário para o Vercel não tentar interpretar o corpo da requisição como JSON
module.exports.config = {
  api: {
    bodyParser: false
  }
};
