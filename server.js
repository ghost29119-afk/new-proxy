// server.js

const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

// Node-fetch v2 syntax (works on Chromebook)
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static("."));
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // max 20 requests per minute
  })
);

// ✅ Domains we allow
const SAFE_DOMAINS = [
  "example.com",
  "jsonplaceholder.typicode.com",
  "crazygames.com",
  "www.crazygames.com",
  "m.crazygames.com",
  "embed.crazygames.com"
];

// Function to allow subdomains
function isAllowed(hostname) {
  return SAFE_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  );
}

// Proxy endpoint
app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).send("Missing ?url=");
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return r
