import '@fontsource/manrope/cyrillic-400.css'
import '@fontsource/manrope/latin-400.css'
import '@fontsource/manrope/cyrillic-500.css'
import '@fontsource/manrope/latin-500.css'
import '@fontsource/manrope/cyrillic-600.css'
import '@fontsource/manrope/latin-600.css'
import '@fontsource/manrope/cyrillic-700.css'
import '@fontsource/manrope/latin-700.css'
import '@fontsource/playfair-display/cyrillic-600-italic.css'
import '@fontsource/playfair-display/latin-600-italic.css'
import './index.css'
import ReactDOM from 'react-dom/client'
import { ConfigError } from './components/ConfigError'
import { envIsConfigured, envMissing } from './lib/env'

const root = ReactDOM.createRoot(document.getElementById('root')!)

if (!envIsConfigured) {
  root.render(<ConfigError missing={envMissing} />)
} else {
  import('./bootstrap').then(({ bootstrap }) => bootstrap(root))
}
