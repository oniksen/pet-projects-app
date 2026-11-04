import fs from 'node:fs'

const envPath = '.env.local'
const env = fs.readFileSync(envPath, 'utf8')
const match = env.match(/^VITE_FIREBASE_PROJECT_ID=(.*)$/m)
if (!match) throw new Error('VITE_FIREBASE_PROJECT_ID is missing from .env.local')

const projectId = match[1].trim().replace(/^['"]|['"]$/g, '')
if (!projectId) throw new Error('VITE_FIREBASE_PROJECT_ID is empty in .env.local')

fs.writeFileSync(
  '.firebaserc',
  `${JSON.stringify({ projects: { default: projectId } }, null, 2)}\n`,
  'utf8',
)

console.log('.firebaserc written')
