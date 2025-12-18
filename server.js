const express = require("express");
const crypto = require("crypto");

const app = express();
app.use(express.json());

// --- Configuración ---
const PORT = 8080;

// URLs reales en local (SIN docker)
const ACQUIRE_URL = "http://localhost:3001";
const PREDICT_URL = "http://localhost:3002";

// --- HEALTH ---
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "orchestrator"
  });
});

// --- RUN ---
app.post("/run", async (req, res) => {
  const correlationId = crypto.randomUUID();
  console.log(`[${correlationId}] RUN start`);

  try {
    // 1️⃣ Llamar a ACQUIRE
    const acquireRes = await fetch(`${ACQUIRE_URL}/data`, {
      method: "POST"
    });

    if (!acquireRes.ok) {
      throw new Error("Acquire failed");
    }

    const acquireData = await acquireRes.json();
    const { dataId, features } = acquireData;

    if (!dataId || !features || !Array.isArray(features)) {
      throw new Error("Invalid Acquire response");
    }

    console.log(`[${correlationId}] Acquire OK`);

    // 2️⃣ Llamar a PREDICT (MISMO FORMATO que Postman)
    const predictBody = {
      features,
      meta: {
        featureCount: features.length,
        dataId,
        source: "orchestrator",
        correlationId
      }
    };

    const predictRes = await fetch(`${PREDICT_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(predictBody)
    });

    if (!predictRes.ok) {
      throw new Error("Predict failed");
    }

    const predictData = await predictRes.json();
    const { prediction, predictionId } = predictData;

    console.log(`[${correlationId}] Predict OK`);

    // 3️⃣ Respuesta FINAL (contrato)
    res.json({
      dataId,
      predictionId,
      prediction,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error(`[${correlationId}] ERROR`, err.message);
    res.status(502).json({
      error: "Bad Gateway",
      detail: err.message
    });
  }
});

// --- START ---
app.listen(PORT, () => {
  console.log(`[ORCHESTRATOR] Listening on http://localhost:${PORT}`);
});
