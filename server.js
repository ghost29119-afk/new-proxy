const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

// Node-fetch v2 syntax
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for Render headers
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.static("."));
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20,
  })
);

// Safe domains and subdomain check
const SAFE_DOMAINS = [
  "example.com",
  "jsonplaceholder.typicode.com",
  "crazygames.com",
  "www.crazygames.com",
  "m.crazygames.com",
  "embed.crazygames.com"
];

function isAllowed(hostname) {
  return SAFE_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  );
}

// Proxy endpoint
app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("Missing ?url=");

  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return res.status(400).send("Invalid URL");
  }

  if (!isAllowed(parsedUrl.hostname)) {
    return res.status(403).send("Domain not allowed");
  }

  try {
    const response = await fetch(targetUrl, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      },
    });

    const body = await response.text();
    res.send(body);
  } catch (err) {
    console.error("Fetch failed:", err);
    res.status(500).send("Fetch failed");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Proxy running at http://localhost:${PORT}`);
});
