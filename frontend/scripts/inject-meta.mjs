// Runs after vite build. Link previews (WhatsApp etc.) don't run JS, so
// I pull the league name from my API here and write it into the built
// index.html. If the API can't be reached the build still passes with
// the default title.
import { readFileSync, writeFileSync } from 'node:fs';

const base = process.env.VITE_API_BASE;
const file = new URL('../dist/index.html', import.meta.url);

async function getName() {
  // backend on the free plan can be asleep, so give it time + one retry
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${base}/api/league/info`, { signal: AbortSignal.timeout(70000) });
      if (res.ok) return (await res.json()).name;
    } catch {}
  }
  return null;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

if (!base) {
  console.log('inject-meta: VITE_API_BASE not set, leaving default title');
} else {
  const name = await getName();
  if (!name || name === 'My Mini League') {
    console.log('inject-meta: no league name available, leaving default title');
  } else {
    let html = readFileSync(file, 'utf8');
    html = html
      .replace(/<title>[^<]*<\/title>/, () => `<title>${esc(name)}</title>`)
      .replace(/(<meta property="og:title" content=")[^"]*"/, (_, a) => `${a}${esc(name)}"`)
      .replace(/(<meta name="twitter:title" content=")[^"]*"/, (_, a) => `${a}${esc(name)}"`);
    writeFileSync(file, html);
    console.log(`inject-meta: set title to "${name}"`);
  }
}
