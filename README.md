# Backend - Ficha Oftalmológica HVA

Este backend existe por um único motivo: **esconder suas chaves de API**.

O site (`ficha-oftalmologica.jsx` / GitHub Pages) é público — qualquer pessoa
pode ver o código-fonte dele no navegador. Se a chave da OpenAI ou da
Anthropic estivesse dentro desse código, qualquer pessoa poderia copiá-la e
gastar seu crédito. Este backend fica entre o site e as APIs pagas,
guardando as chaves em segurança.

---

## 1. Crie as contas e gere as chaves

### OpenAI (transcrição de áudio)
1. Acesse https://platform.openai.com/api-keys
2. Crie uma conta (ou entre na existente) e cadastre um cartão
3. Clique em **Create new secret key** e copie a chave (começa com `sk-...`)
4. **Importante:** vá em **Settings → Limits** e defina um limite de gasto
   mensal (ex: US$ 20) para evitar surpresas

### Anthropic (classificação por tópicos)
1. Acesse https://console.anthropic.com/settings/keys
2. Crie uma conta e cadastre um cartão
3. Clique em **Create Key** e copie a chave (começa com `sk-ant-...`)
4. Defina também um limite de gasto em **Settings → Billing**

---

## 2. Suba este backend no Vercel (gratuito)

1. Crie uma conta em https://vercel.com (pode entrar direto com GitHub)
2. Crie um novo repositório no GitHub **só para este backend**
   (ex: `ficha-oftalmologica-backend`) e suba esta pasta inteira nele
3. No Vercel, clique em **Add New → Project**, selecione esse repositório
4. Antes de clicar em Deploy, vá em **Environment Variables** e adicione:

   | Nome | Valor |
   |---|---|
   | `OPENAI_API_KEY` | a chave que você copiou da OpenAI |
   | `ANTHROPIC_API_KEY` | a chave que você copiou da Anthropic |
   | `APP_SECRET` | invente uma senha longa e aleatória, ex: `hva-oftalmo-9f83k2` |

5. Clique em **Deploy**
6. Ao terminar, o Vercel te dá uma URL, algo como:
   `https://ficha-oftalmologica-backend.vercel.app`

Guarde essa URL e o valor que você colocou em `APP_SECRET` — você vai
precisar dos dois na tela de configuração do aplicativo (⚙️ no topo da
ficha).

---

## 3. Teste se está no ar

Abra no navegador: `https://sua-url.vercel.app/api/transcribe`
Deve aparecer algo como `{"error":"Método não permitido"}` — isso é
**normal e esperado** (a rota só aceita POST). Se aparecer erro 404, algo
deu errado no deploy.

---

## Custos (não é gratuito no uso, só a hospedagem é)

- **Vercel:** grátis para este volume de uso
- **OpenAI (transcrição):** ~US$ 0,003/minuto de áudio
- **Anthropic (classificação):** poucos centavos de dólar por consulta inteira

Uma consulta de 20-30 minutos fica em torno de **R$ 0,55 a R$ 1,10** no total.
Configure os limites de gasto (passo 1) para nunca ser surpreendido.

---

## Segurança

O `APP_SECRET` é uma proteção básica contra uso indevido por estranhos que
descubram a URL do backend — mas como o código do site é público, alguém
tecnicamente capaz ainda poderia extraí-lo. A proteção **real** contra
gastos indevidos são os limites de gasto configurados no passo 1. Revise-os
periodicamente.
