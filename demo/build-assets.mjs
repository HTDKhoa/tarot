// Gom toàn bộ public/assets thành data URI để bản demo là một file HTML duy nhất.
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, extname } from "node:path";

const root = new URL("../public", import.meta.url).pathname;
const out = {};
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else {
      const ext = extname(p).toLowerCase();
      const mime = ext === ".png" ? "image/png" : ext === ".json" ? "application/json" : null;
      if (!mime) continue;
      out["/" + relative(root, p)] = `data:${mime};base64,${readFileSync(p).toString("base64")}`;
    }
  }
};
walk(join(root, "assets"));
writeFileSync(new URL("./asset-map.generated.json", import.meta.url), JSON.stringify(out));
console.log(`asset map: ${Object.keys(out).length} files`);
