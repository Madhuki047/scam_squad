const SETTINGS_KEY = 'ss_device_settings'

const VOLUME = {
  hover: 0.025,
  click: 0.04,
  pickup: 0.07,
  phoneRing: 0.032,
  missionBriefing: 0.055,
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
const groupedSources = new Map()

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

function rememberSource(group, source) {
  if (!group) return
  if (!groupedSources.has(group)) groupedSources.set(group, new Set())
  groupedSources.get(group).add(source)
  source.onended = () => groupedSources.get(group)?.delete(source)
}

function stopGroupedSources(group) {
  const sources = groupedSources.get(group)
  if (!sources) return

  sources.forEach((source) => {
    try {
      source.stop()
    } catch {
      // Already ended.
    }
  })
  sources.clear()
}

function tone(
  freq,
  duration = 0.08,
  volume = 0.05,
  type = 'square',
  delay = 0,
  group = null,
) {
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
  rememberSource(group, osc)
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

function vintagePhoneRing() {
  const burst = [0, 0.065, 0.13, 0.195, 0.26, 0.325]
  burst.forEach((delay, index) => {
    const freq = index % 2 === 0 ? 690 : 610
    tone(freq, 0.052, VOLUME.phoneRing, 'square', delay, 'phoneRing')
    tone(
      freq * 1.5,
      0.045,
      VOLUME.phoneRing * 0.45,
      'sine',
      delay + 0.006,
      'phoneRing',
    )
  })

  const secondBurstOffset = 0.55
  burst.forEach((delay, index) => {
    const freq = index % 2 === 0 ? 675 : 595
    tone(
      freq,
      0.052,
      VOLUME.phoneRing,
      'square',
      secondBurstOffset + delay,
      'phoneRing',
    )
    tone(
      freq * 1.5,
      0.045,
      VOLUME.phoneRing * 0.45,
      'sine',
      secondBurstOffset + delay + 0.006,
      'phoneRing',
    )
  })
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
      vintagePhoneRing()
      break
    case 'missionBriefing':
      tone(420, 0.06, VOLUME.missionBriefing, 'triangle')
      tone(640, 0.08, VOLUME.missionBriefing * 0.8, 'sine', 0.055)
      tone(980, 0.1, VOLUME.missionBriefing * 0.65, 'triangle', 0.13)
      noise(0.035, VOLUME.missionBriefing * 0.35)
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
  const interval = name === 'phoneRing' ? 2100 : 1550
  const id = window.setInterval(() => playSfx(name), interval)
  loops.set(name, id)
}

export function stopSfxLoop(name) {
  const id = loops.get(name)
  if (id) {
    window.clearInterval(id)
    loops.delete(name)
  }
  stopGroupedSources(name)
}

export function stopAllSfxLoops() {
  loops.forEach((id) => window.clearInterval(id))
  loops.clear()
  groupedSources.forEach((_, group) => stopGroupedSources(group))
}
