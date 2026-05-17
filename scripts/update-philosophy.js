const fs = require("fs");
const path = require("path");

const apiUrl = "https://api.quotable.io/random?tags=philosophy";
const readmePath = path.join(__dirname, "..", "README.md");

const startMarker = "<!-- PHILOSOPHY_OF_THE_DAY:START -->";
const endMarker = "<!-- PHILOSOPHY_OF_THE_DAY:END -->";

async function fetchQuote() {
  const response = await fetch(apiUrl, {
    headers: {
      "User-Agent": "philosophy-of-the-day-bot",
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return {
    content: data.content?.trim() || "Stay curious, stay humble.",
    author: data.author?.trim() || "Unknown",
  };
}

function updateReadme(block) {
  const readme = fs.readFileSync(readmePath, "utf8");
  const pattern = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);

  if (!pattern.test(readme)) {
    throw new Error("Markers not found in README.md");
  }

  const updated = readme.replace(pattern, block);
  if (updated !== readme) {
    fs.writeFileSync(readmePath, updated, "utf8");
  }
}

async function main() {
  const { content, author } = await fetchQuote();
  const today = new Date().toISOString().slice(0, 10);

  const block = [startMarker, `> "${content}" — ${author}`, "", `_Last updated: ${today}_`, endMarker].join("\n");

  updateReadme(block);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
