import fs from 'fs'
import path from 'path'

function walk(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file)
    if (fs.statSync(full).isDirectory()) {
      walk(full)
      continue
    }
    if (!/\.tsx?$/.test(file)) continue
    const content = fs.readFileSync(full, 'utf8')
    const next = content.replace(
      /import \{ useAuth \} from '@\/lib\/AuthContext';?\r?\n/g,
      "import { useAuth } from '@/hooks/use-auth'\n"
    )
    if (next !== content) fs.writeFileSync(full, next)
  }
}

walk('src')
