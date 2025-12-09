// faq-from-url.js

const axios = require('axios');
const cheerio = require('cheerio');

const config = {
  ollamaHost: 'http://localhost:11434',
  ollamaModel: 'llama3.2:latest',
  ollamaEmbeddingModel: 'nomic-embed-text',
  qdrantHost: 'https://fe15763d-58a7-4ed9-85d3-b8f846e97725.eu-west-1-0.aws.cloud.qdrant.io:6333/',
  qdrantCollection: 'my_collection',
  similarityThreshold: 0.7,
  faqCount: 5,
  maxContextLength: 2000,
  maxTokens: 1000,
  temperature: 0.3
};

function truncateContent(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, text.lastIndexOf(' ', maxLength)) + '...';
}

async function fetchTextFromURL(url) {
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);
  const title = $('title').text().trim();
  const body = $('body').text().replace(/\s+/g, ' ').trim();
  return { title, content: truncateContent(body, config.maxContextLength) };
}

async function generateEmbedding(text) {
  const res = await axios.post(`${config.ollamaHost}/api/embeddings`, {
    model: config.ollamaEmbeddingModel,
    prompt: text
  });
  return res.data.embedding;
}

async function searchSimilarContent(embedding) {
  const res = await axios.post(
    `${config.qdrantHost}/collections/${config.qdrantCollection}/points/search`,
    {
      vector: embedding,
      limit: 3,
      score_threshold: config.similarityThreshold
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'api-key': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.oYenP0WHne1_lggR66sYTJiHeOR0N8czWu7-cfscjFQ'
      }
    }
  );
  
  return res.data.result || [];
}

async function generateFAQs(content, similarSnippets = []) {
  let context = content;
  if (similarSnippets.length) {
    context += '\n\nContenuto correlato:\n';
    similarSnippets.forEach(snippet => {
      context += '- ' + snippet.payload.content.slice(0, 200) + '...\n';
    });
  }

  const prompt = `
You are an expert SEO and content strategist specialized in multilingual content optimization for AI search systems like AISO, SGE, GEO, and AIO.

Using only the RAG memory context provided to you, generate exactly 5 FAQs in Italian, strictly formatted in valid JSON with the following structure for each FAQ:

[
  {
    "question": "...",
    "answer": "..."
  }
]
Instructions:

Each FAQ must follow EEAT principles (Expertise, Experience, Authoritativeness, Trustworthiness).

Cover different search intents (informational, transactional, navigational, comparative, etc.).

Write in a natural, conversational tone appropriate for helpful user-centric content.

Use long-tail, searchable keywords in both questions and answers that reflect top user queries.

Answers should be concise but informative, demonstrating subject expertise.

Do not include any additional formatting, bullet points, intro/outro text, or characters outside the specified JSON format.

Output only the JSON array containing the 5 FAQs.
5 items are required, no more, no less.
TESTO DA ANALIZZARE COME CONTESTO:

${context}
`;

  const res = await axios.post(`${config.ollamaHost}/api/generate`, {
    model: config.ollamaModel,
    prompt,
    stream: false,
    options: {
      temperature: config.temperature,
      num_predict: config.maxTokens,
      stop: ['</json>']
    }
  });

  const output = res.data.response;
  const match = output.match(/\[\s*{[\s\S]*?}\s*\]/); // this regular expression matches an array (indicated by the surrounding square brackets) that contains an object (indicated by the curly braces) and allows for any amount of whitespace around and within the object.
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (err) {
      console.error('❌ Errore nel parsing JSON:', err);
    }
  }

  return [];
}

(async () => {
  const url = process.argv[2];
  if (!url) {
    console.error('❌ Inserisci l\'URL come parametro:\n\n   node faq-from-url.js https://esempio.com/articolo\n');
    process.exit(1);
  }

  try {
    console.log(`🔍 Estrazione contenuto da: ${url}`);
    const { title, content } = await fetchTextFromURL(url);
    const fullText = `Titolo: ${title}\n\nContenuto: ${content}`;

    console.log('🧠 Generazione embedding...');
    const embedding = await generateEmbedding(fullText);

    console.log('🔁 Recupero contenuti simili da Qdrant...');
    const similar = await searchSimilarContent(embedding);

    console.log('✍️ Generazione FAQ...');
    const faqs = await generateFAQs(fullText, similar);

    if (faqs.length) {
      console.log(JSON.stringify(faqs, null, 2));
    } else {
      console.log('⚠️ Nessuna FAQ generata.');
    }

  } catch (err) {
    console.error('❌ Errore:', err.message);
  }
})();
