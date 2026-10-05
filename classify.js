// api/classify.js
// Recebe um trecho de texto transcrito e devolve: o tópico da consulta e um resumo.
// A chave da Anthropic fica só aqui no servidor.

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  if (req.headers["x-app-secret"] !== process.env.APP_SECRET) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  try {
    let body = "";
    for await (const chunk of req) body += chunk;
    const { text } = JSON.parse(body || "{}");

    if (!text || !text.trim()) {
      return res.status(200).json({ topico: "outros", resumo: "" });
    }

    const prompt = `Você está organizando a transcrição de uma consulta veterinária oftalmológica (Dr. Adélio, HVA).

Classifique a frase abaixo em EXATAMENTE um destes tópicos:
- "queixa": o que o tutor relata sobre o problema do animal
- "diagnostico": a conclusão/diagnóstico dado pelo veterinário
- "tratamento": prescrição, medicamentos, posologia
- "orientacoes": cuidados, recomendações, avisos ao tutor
- "outros": qualquer outro assunto da consulta

Responda APENAS em JSON válido, sem nenhum texto antes ou depois, neste formato exato:
{"topico": "um_dos_valores_acima", "resumo": "a frase reescrita de forma limpa e objetiva, mantendo o sentido original"}

Frase da consulta: "${text.replace(/"/g, '\\"')}"`;

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("Erro Anthropic:", errText);
      return res.status(502).json({ error: "Falha na classificação", detail: errText });
    }

    const data = await anthropicRes.json();
    const rawText = data?.content?.[0]?.text || "";

    let parsed;
    try {
      // Remove possíveis marcações de bloco de código que o modelo às vezes adiciona
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      parsed = { topico: "outros", resumo: text };
    }

    if (!["queixa", "diagnostico", "tratamento", "orientacoes", "outros"].includes(parsed.topico)) {
      parsed.topico = "outros";
    }

    return res.status(200).json(parsed);

  } catch (err) {
    console.error("Erro no /api/classify:", err);
    return res.status(500).json({ error: "Erro interno na classificação" });
  }
};
