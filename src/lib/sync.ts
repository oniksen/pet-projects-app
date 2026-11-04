export function markWriteStarted() {
  window.dispatchEvent(new Event('workspace:write'))
}
