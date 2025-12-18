// server.js
const express = require("express");
const orchestratorRoutes = require("./routes/orchestratorRoutes");

const PORT = 8080;

const app = express();
app.use(express.json());

app.use("/", orchestratorRoutes);

app.listen(PORT, () => {
  console.log(`[ORCHESTRATOR] Listening on http://localhost:${PORT}`);
});






