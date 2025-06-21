const fetch = require("node-fetch");

async function analyzeWithMistral(interpretedFiles, doraMetrics) {
  const summary = interpretedFiles.map(f => `File: ${f.file}\n${f.interpretation}`).join("\n\n");

  const prompt = `
You are a DORA-aware engineering analyst.

DORA metrics:
- Lead Time: ${JSON.stringify(doraMetrics.lead_time)}
- Deployment Frequency: ${JSON.stringify(doraMetrics.deployment_frequency)}
- MTTR: ${JSON.stringify(doraMetrics.mttr)}
- CFR: ${JSON.stringify(doraMetrics.change_failure_rate)}

Interpreted code:
${summary}

Suggest improvements to the development process or code to improve these metrics.
`.trim();

  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "mistral",
      prompt,
      stream: false
    })
  });

  const data = await res.json();
  return data.response;
}

module.exports = { analyzeWithMistral };