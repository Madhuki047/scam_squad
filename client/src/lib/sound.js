const SETTINGS_KEY = 'ss_device_settings'

const VOLUME = {
  hover: 0.025,
  click: 0.04,
  pickup: 0.07,
  phoneRing: 0.055,
  correct: 0.07,
  wrong: 0.07,
  lifeLost: 0.065,
  coins: 0.075,
  badge: 0.07,
  caseComplete: 0.08,
  caseFailed: 0.075,
}

let audioContext = null
let muted = readMuted()
let unlocked = false
const loops = new Map()

function readMuted() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return false
    const settings = JSON.parse(raw)
    return settings.sfx === false
  } catch {
    return false
  }
}

function getContext() {
  if (muted) return null
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return null
  if (!audioContext) audioContext = new AudioCtx()
  return audioContext
}

function gainNode(ctx, volume) {
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.012)
  gain.connect(ctx.destination)
  return gain
}

function tone(freq, duration = 0.08, volume = 0.05, type = 'square', delay = 0) {
  const ctx = getContext()
  if (!ctx || !unlocked) return

  const start = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const gain = gainNode(ctx, volume)

  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

  osc.connect(gain)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

function noise(duration = 0.05, volume = 0.04) {
  const ctx = getContext()
  if (!ctx || !unlocked) return

  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1

  const source = ctx.createBufferSource()
  const gain = gainNode(ctx, volume)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
  source.buffer = buffer
  source.connect(gain)
  source.start()
}

export async function unlockAudio() {
  const ctx = getContext()
  if (!ctx) return false
  try {
    await ctx.resume()
    unlocked = true
    return true
  } catch {
    return false
  }
}

export function setSfxMuted(nextMuted) {
  muted = nextMuted
  if (muted) stopAllSfxLoops()
}

export function playSfx(name) {
  if (muted) return
  unlockAudio()

  switch (name) {
    case 'hover':
      tone(720, 0.035, VOLUME.hover, 'triangle')
      break
    case 'click':
      tone(360, 0.045, VOLUME.click, 'square')
      break
    case 'pickup':
      noise(0.035, VOLUME.pickup)
      tone(260, 0.06, VOLUME.pickup, 'square', 0.025)
      break
    case 'phoneRing':
      tone(620, 0.16, VOLUME.phoneRing, 'sine')
      tone(520, 0.18, VOLUME.phoneRing, 'sine', 0.18)
      break
    case 'correct':
      tone(540, 0.07, VOLUME.correct, 'triangle')
      tone(820, 0.09, VOLUME.correct, 'triangle', 0.07)
      break
    case 'wrong':
      tone(180, 0.12, VOLUME.wrong, 'sawtooth')
      tone(120, 0.12, VOLUME.wrong, 'sawtooth', 0.1)
      break
    case 'lifeLost':
      noise(0.08, VOLUME.lifeLost)
      tone(95, 0.18, VOLUME.lifeLost, 'sawtooth', 0.03)
      break
    case 'coins':
      tone(760, 0.07, VOLUME.coins, 'triangle')
      tone(980, 0.08, VOLUME.coins, 'triangle', 0.06)
      tone(1220, 0.08, VOLUME.coins, 'triangle', 0.12)
      break
    case 'badge':
      tone(420, 0.08, VOLUME.badge, 'sine')
      tone(720, 0.1, VOLUME.badge, 'sine', 0.07)
      tone(1040, 0.13, VOLUME.badge, 'sine', 0.15)
      break
    case 'caseComplete':
      tone(360, 0.08, VOLUME.caseComplete, 'triangle')
      tone(540, 0.08, VOLUME.caseComplete, 'triangle', 0.08)
      tone(760, 0.14, VOLUME.caseComplete, 'triangle', 0.16)
      break
    case 'caseFailed':
      tone(260, 0.1, VOLUME.caseFailed, 'sawtooth')
      tone(160, 0.16, VOLUME.caseFailed, 'sawtooth', 0.1)
      break
    default:
      break
  }
}

export function startSfxLoop(name) {
  if (muted || loops.has(name)) return
  playSfx(name)
  const id = window.setInterval(() => playSfx(name), 1550)
  loops.set(name, id)
}

export function stopSfxLoop(name) {
  const id = loops.get(name)
  if (!id) return
  window.clearInterval(id)
  loops.delete(name)
}

export function stopAllSfxLoops() {
  loops.forEach((id) => window.clearInterval(id))
  loops.clear()
}
