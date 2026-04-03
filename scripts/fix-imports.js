import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const distPath = path.resolve(__dirname, '../dist')

function fixImports(dir) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      fixImports(fullPath)
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8')
      
      // Fix relative imports: add .js extension if missing
      // This regex looks for: import ... from './foo' or './foo/bar'
      // and replaces it with './foo.js' or './foo/bar.js'
      const fixedContent = content.replace(
        /(from\s+['"])(\.\.?\/[^'"]+?)(['"])/g,
        (match, p1, p2, p3) => {
          if (p2.endsWith('.js') || p2.endsWith('.json') || p2.endsWith('.css')) {
            return match
          }
          return `${p1}${p2}.js${p3}`
        }
      )

      if (content !== fixedContent) {
        fs.writeFileSync(fullPath, fixedContent)
        console.log(`Fixed imports in: ${fullPath}`)
      }
    }
  }
}

if (fs.existsSync(distPath)) {
  console.log('Fixing imports in dist folder...')
  fixImports(distPath)
  console.log('Finished fixing imports.')
} else {
  console.error('Dist folder not found!')
}
