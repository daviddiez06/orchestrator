// controllers/orchestratorController.js
const crypto = require("crypto");
const { runFlow } = require("../services/orchestratorService");

// GET /health
function health(req, res) {
  res.json({
    status: "ok",
    service: "orchestrator"
  });
}

// POST /run
async function run(req, res) {
  const correlationId = crypto.randomUUID();
  console.log(`[${correlationId}] RUN start`);

  try {
    const result = await runFlow(correlationId);

    res.json({
      ...result,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error(`[${correlationId}] ERROR`, err.message);
    res.status(502).json({
      error: "Bad Gateway",
      detail: err.message
    });
  }
}

module.exports = {
  health,
  run
};
