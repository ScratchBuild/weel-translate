import { runtime } from '@/globals'
import { aid } from '@/functions/utils'

// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/runtime/sendMessage
export const sendMessage = message => aid(
  () => runtime.sendMessage(message),
  () => new Promise(() => {})
)

// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/runtime/onMessage
export const onMessage = {
  addListener: callback => aid(() => runtime.onMessage.addListener(callback)),
  removeListener: listener => aid(() => runtime.onMessage.removeListener(listener)),
  hasListener: listener => aid(() => runtime.onMessage.hasListener(listener))
}