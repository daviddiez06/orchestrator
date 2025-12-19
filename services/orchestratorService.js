// services/orchestratorService.js

const ACQUIRE_URL = process.env.ACQUIRE_URL;
const PREDICT_URL = process.env.PREDICT_URL;



async function runFlow(correlationId) {

  // Acquire
  const acquireRes = await fetch(`${ACQUIRE_URL}/data`, {
    method: "POST"
  });

  if (!acquireRes.ok) {
    throw new Error("Acquire failed");
  }

  const acquireData = await acquireRes.json();
  const { dataId, features } = acquireData;

  if (!dataId || !Array.isArray(features)) {
    throw new Error("Invalid Acquire response");
  }

  console.log(`[${correlationId}] Acquire OK`);

  // Predict
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

  // Resultado final
  return {
    dataId,
    predictionId,
    prediction
  };
}

module.exports = {
  runFlow
};
