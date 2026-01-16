const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

// Node-fetch v2 syntax (works on Chromebook)
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static("."));

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 20,
  })
);

// ✅ Domains we allow
const SAFE_DOMAINS = [
  "example.com",
  "jsonplaceholder.typicode.com",
  "crazygames.com",
];

// Function to allow subdomains
function isAllowed(hostname) {
  return SAFE_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  );
}

app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).send("Missing ?url=");
  }

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
    console.error(err);
    res.status(500).send("Fetch failed");
  }
});

app.listen(PORT, () => {
  console.log(`Proxy running at http://localhost:${PORT}`);
});
