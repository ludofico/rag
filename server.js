const http = require("http");
const { exec } = require("child_process");
const readline = require("readline");

const OLLAMA_HOST = "localhost";
const OLLAMA_PORT = 11434;
const MODEL_NAME = "deepseek-r1"; // puoi cambiarlo con il tuo preferito

const sendToOllama = (prompt) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: MODEL_NAME,
      stream: false,
      messages: [
        {
          role: "system",
          content:
            "Agisci come un assistente terminale automatico. Rispondi solo con un singolo comando valido racchiuso in un blocco ```bash```, senza spiegazioni. Se non riesci, non rispondere affatto.",
        },
        { role: "user", content: prompt },
      ],
    });

    const options = {
      hostname: OLLAMA_HOST,
      port: OLLAMA_PORT,
      path: "/api/generate",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(body);
          const response = json.response?.trim();
          resolve(response);
        } catch (err) {
          reject(new Error("Risposta non valida da Ollama."));
        }
      });
    });

    req.on("error", (err) => reject(err));
    req.write(payload);
    req.end();
  });
};

const extractShellCommand = (text) => {
  if (!text) return null;
  const match = text.match(/```(?:bash|shell)?\s*([\s\S]*?)```/i);
  return match ? match[1].trim() : null;
};

const run = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("🟢 MCP Terminal Assistant attivo. Digita 'exit' per uscire.");

  while (true) {
    const question = await new Promise((resolve) =>
      rl.question("\n📥 Prompt: ", resolve)
    );

    if (question.trim().toLowerCase() === "exit") {
      console.log("🛑 Chiusura assistente MCP.");
      rl.close();
      process.exit(0);
    }

    let response;
    try {
      response = await sendToOllama(question);
    } catch (error) {
      console.error(`❌ Errore nella richiesta a Ollama: ${error.message}`);
      continue;l
    }

    const cmd = extractShellCommand(response);

    if (!cmd) {
      console.log("⚠️ Nessun comando valido trovato nell’output.");
      continue;
    }

    console.log(`\n🤖 Ollama suggerisce:\n\n${cmd}`);

    const confirm = await new Promise((resolve) =>
      rl.question("\n✅ Vuoi eseguire questo comando? [y/N]: ", resolve)
    );

    if (confirm.trim().toLowerCase() !== "y") {
      console.log("⏩ Comando annullato.");
      continue;
    }

    console.log(`\n🚀 Eseguendo comando...`);
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Errore durante l'esecuzione: ${error.message}`);
        return;
      }
      const output = stdout || stderr;
      console.log(`\n📤 Output:\n${output}`);
    });
  }
};

run();
