import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const mode = process.argv[2] ?? 'check'

function fail(message) {
  console.error(`[firebase-guard] ${message}`)
  process.exit(1)
}

function readEnv(file) {
  if (!fs.existsSync(file)) fail('.env.local not found')
  const values = {}
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (match) values[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '')
  }
  return values
}

const rcPath = path.join(root, '.firebaserc')
if (!fs.existsSync(rcPath)) fail('.firebaserc not found')

let rc
try {
  rc = JSON.parse(fs.readFileSync(rcPath, 'utf8'))
} catch {
  fail('.firebaserc is not valid JSON')
}

const projects = rc?.projects ?? {}
const names = Object.keys(projects)
if (names.length !== 1) fail('.firebaserc must contain exactly one project')
const projectId = projects[names[0]]
if (typeof projectId !== 'string' || projectId.length === 0) fail('.firebaserc project id is empty')

const env = readEnv(path.join(root, '.env.local'))
if (!env.VITE_FIREBASE_PROJECT_ID) fail('VITE_FIREBASE_PROJECT_ID is missing from .env.local')
if (env.VITE_FIREBASE_PROJECT_ID !== projectId) fail('project id mismatch between .env.local and .firebaserc')

const firebaseJsonPath = path.join(root, 'firebase.json')
if (!fs.existsSync(firebaseJsonPath)) fail('firebase.json not found')
const firebaseJson = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'))
const allowed = new Set(['firestore', 'emulators'])
for (const key of Object.keys(firebaseJson)) {
  if (!allowed.has(key)) fail(`firebase.json contains disallowed target: ${key}`)
}

const rulesPath = path.join(root, 'firestore.rules')
if (!fs.existsSync(rulesPath)) fail('firestore.rules not found')
const rules = fs.readFileSync(rulesPath, 'utf8')
if (!rules.includes('function isOwner()')) fail('firestore.rules is missing isOwner()')

const DUMMY_OWNER_UID = 'dummy-owner-uid'
if (mode === 'deploy' && (rules.includes('<OWNER_UID>') || rules.includes(DUMMY_OWNER_UID))) {
  fail('replace dummy-owner-uid with the real owner UID in firestore.rules before deploy')
}

console.log('[firebase-guard] Firebase scope OK')
