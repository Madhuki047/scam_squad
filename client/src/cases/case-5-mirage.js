// Case 5 — The Mirage. AI manipulation & deepfakes.
// Two levels: a six-image deepfake evidence review, then a CEO-fraud
// wire-transfer reconstruction where the deepfake is only one of three
// failures.

const SCENES = {
  'intro-1': {
    type: 'dialog',
    speaker: 'Agent Ricky',
    speakerColor: 'cyan',
    text:
      'This last case is different. Every threat you’ve studied had a tell: a bad domain, a fake urgency, a too-friendly stranger. This one has none of that. The threat looks exactly like someone you trust. It sounds like them. It moves like them. And it will ask you for something real.',
    next: 'easy-brief',
  },

  // --- Level 1 (Easy): The Evidence ------------------------------------
  'easy-brief': {
    type: 'narration',
    text:
      'A whistleblower dump contains six photographs being used as legal evidence. Your job: mark which images are deepfakes.',
    next: 'easy-flag',
  },
  'easy-flag': {
    type: 'multi',
    prompt: 'Flag every image you believe has been manipulated.',
    options: [
      { label: 'Image 1: A crowded street scene. (Looks natural; no obvious artefacts.)', harmful: false },
      { label: 'Image 2: A handshake in an office. (Hands are fused; an ear merges into the collar.)', harmful: true },
      { label: 'Image 3: Candid restaurant shot. (Slight noise, uneven lighting.)', harmful: false },
      { label: 'Image 4: Meeting room. (Reflection in the glass table doesn’t match the people in the room.)', harmful: true },
      { label: 'Image 5: Outdoor photo. (Motion blur consistent with a real candid.)', harmful: false },
      { label: 'Image 6: Close-up portrait. (Teeth unnaturally uniform; hair painted at the temples.)', harmful: true },
    ],
    debrief:
      'Most players catch 2 and 6 and over-flag 3. The hard one is image 4 — the reflection anomaly is exactly what AI still struggles to model.',
    next: 'easy-ricky',
  },
  'easy-ricky': {
    type: 'dialog',
    speaker: 'Agent Ricky',
    speakerColor: 'cyan',
    text:
      'Image 4 is the primary exhibit in a fraud trial. If your report goes forward as is, an innocent person could be convicted on fabricated evidence. The tell was the reflection.',
    next: 'easy-debrief',
  },
  'easy-debrief': {
    type: 'debrief',
    title: 'COMMON DEEPFAKE ARTEFACTS',
    bullets: [
      { head: 'Hands and fingers', body: 'Fused, extra, or missing digits.' },
      { head: 'Ears, hair, teeth', body: 'Soft "painted" edges; unnatural uniformity.' },
      { head: 'Environmental consistency', body: 'Reflections, shadows, light sources should agree.' },
      { head: 'Don’t over-flag', body: 'Real photos have imperfections — that isn’t fakery.' },
    ],
    next: 'badge-easy-5',
  },
  'badge-easy-5': {
    type: 'badge',
    name: 'Eyes Open',
    next: 'hard-intro',
  },

  // --- Level 2 (Hard): The Transfer ------------------------------------
  'hard-intro': {
    type: 'narration',
    text:
      'Two days later. Meridian Capital reports that their CFO, Helen Smith, has just wired £740,000 to an overseas supplier after a video call from the CEO. Their fraud monitor flagged it thirty minutes too late.',
    next: 'hard-timeline',
  },
  'hard-timeline': {
    type: 'debrief',
    title: 'INCIDENT TIMELINE',
    bullets: [
      { head: '09:14', body: 'Helen receives an email from the CEO. Account is real (compromised the night before).' },
      { head: '09:41', body: 'Helen replies asking for details.' },
      { head: '09:58', body: 'CEO video-calls Helen. Same face, same mannerisms.' },
      { head: '10:09', body: 'Helen authorises the £740,000 transfer.' },
    ],
    next: 'hard-points',
  },
  'hard-points': {
    type: 'multi',
    prompt:
      'Four possible places Helen could have caught this. Flag the ones that would have stopped it.',
    options: [
      { label: 'Spotting an email writing-style anomaly. (Account was legitimate.)', harmful: false },
      { label: 'Catching lip-sync delay on the video call at a sharp head turn.', harmful: true },
      { label: 'Noticing the receiving bank account was registered 48 hours ago with no history.', harmful: true },
      { label: 'Following the standing protocol that >£50k transfers need a separate-channel second sign-off.', harmful: true },
    ],
    debrief:
      'The deepfake was the delivery. The urgency was the weapon. The bypassed protocol was the actual breach. Three failures, not one.',
    next: 'hard-ricky-1',
  },
  'hard-ricky-1': {
    type: 'dialog',
    speaker: 'Agent Ricky',
    speakerColor: 'cyan',
    text:
      'The video was a deepfake — you’re right. But the deepfake wasn’t the weapon. The urgency was. Helen has worked with Marcus for eleven years. Of course she believed his face. The attackers knew she would. So they made sure she never had a reason to stop and follow the process.',
    next: 'hard-ricky-2',
  },
  'hard-ricky-2': {
    type: 'dialog',
    speaker: 'Agent Ricky',
    speakerColor: 'cyan',
    text:
      'The deepfake got her on the call. The urgency got her to skip the protocol. And nobody checked the receiving account. Three failures. Three. The technology was only one of them.',
    next: 'hard-recover',
  },
  'hard-recover': {
    type: 'choice',
    prompt: 'You ask if the money can be recovered.',
    options: [
      { label: '"Sometimes. Not always."', next: 'hard-debrief' },
    ],
  },
  'hard-debrief': {
    type: 'debrief',
    title: 'AI MANIPULATION — TEACHING POINTS',
    bullets: [
      { head: 'CEO fraud / BEC', body: 'Deepfake video + compromised email + urgency.' },
      { head: 'Video tells', body: 'Lip-sync at sharp head angles; collar / edge flicker.' },
      { head: 'Out-of-band verification', body: 'Hang up. Call back on a known number.' },
      { head: 'Process as protection', body: 'Protocols exist exactly to resist manipulation.' },
      { head: 'Receiving-account red flags', body: 'New registration, no history, overseas.' },
      { head: 'Wire transfers are usually irreversible', body: 'There is often no recall.' },
    ],
    next: 'hard-mcq-1',
  },
  'hard-mcq-1': {
    type: 'mcq',
    label: 'CHECK 1 / 2',
    question:
      'A video of your supervisor asks for your password. What do you do?',
    options: ['Send it.', 'Verify through another channel.', 'Ignore it.'],
    correctIndex: 1,
    next: 'hard-mcq-2',
  },
  'hard-mcq-2': {
    type: 'mcq',
    label: 'CHECK 2 / 2',
    question: 'Which of these is a sign of a deepfake?',
    options: [
      'Slightly unnatural blinking',
      'Perfect audio quality',
      'Familiar background',
    ],
    correctIndex: 0,
    next: 'badge-hard-5',
  },
  'badge-hard-5': {
    type: 'badge',
    name: 'The Mirage Broken',
    next: 'final-1',
  },

  // --- Final clearance -------------------------------------------------
  'final-1': {
    type: 'dialog',
    speaker: 'Agent Ricky',
    speakerColor: 'cyan',
    text:
      'Five cases, Cadet. Every single one had one thing in common. The attacker never forced anyone to do anything. They just made the wrong choice feel like the obvious one.',
    next: 'final-2',
  },
  'final-2': {
    type: 'dialog',
    speaker: 'Agent Ricky',
    speakerColor: 'cyan',
    text:
      'You’re cleared as a full agent of Unit Zero. Welcome to the team.',
    next: 'END_SUCCESS',
  },
}

const CASE = {
  id: '5',
  title: 'The Mirage',
  theme: 'AI manipulation',
  start: 'intro-1',
  scenes: SCENES,
}

export default CASE
