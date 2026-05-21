// Case 3 — The Insider. Social engineering.
// Two levels: a friendly stranger at the archive door, then a pretext
// chat from a "colleague" who isn't.

const SCENES = {
  // --- Setup -----------------------------------------------------------
  'intro-1': {
    type: 'dialog',
    speaker: 'Agent Zoey',
    speakerColor: 'pink',
    text:
      'Cadet, hacking isn’t always about code. Sometimes the easiest way into a system… is through a person. Today, you’re the person.',
    next: 'easy-door',
  },

  // --- Level 1 (Easy): Friendly Faces ----------------------------------
  'easy-door': {
    type: 'narration',
    text:
      'You arrive at the office early. A man in a Unit Zero visitor badge is standing outside the secure archive room, looking frustrated. He smiles when he sees you.',
    next: 'easy-mark',
  },
  'easy-mark': {
    type: 'dialog',
    speaker: 'Visitor — "Mark"',
    speakerColor: 'orange',
    text:
      'Hey — you’re the new intern, right? I’m Mark, IT support. My badge isn’t scanning for some reason. Could you just tap yours so I can get in? I need to fix a server issue before the morning shift.',
    next: 'easy-choice',
  },
  'easy-choice': {
    type: 'choice',
    prompt: 'He looks friendly. He looks harmless. He looks like he belongs.',
    options: [
      { label: 'Tap your badge and let him in.', next: 'easy-fail-1' },
      { label: 'Refuse, step back, call your supervisor.', next: 'easy-win-1' },
    ],
  },
  'easy-fail-1': {
    type: 'narration',
    text:
      'The door unlocks. Mark steps inside immediately, plugs a USB stick into a workstation. Files begin copying. Agent Zoey appears behind you.',
    next: 'easy-zoey-fail',
  },
  'easy-zoey-fail': {
    type: 'dialog',
    speaker: 'Agent Zoey',
    speakerColor: 'pink',
    text:
      'Cadet. You didn’t let IT in. You let an attacker in. Social engineers don’t force doors open — they get people to open them.',
    next: 'easy-debrief',
  },
  'easy-win-1': {
    type: 'narration',
    text:
      'You step back and tap the internal comms. Zoey arrives a moment later. She asks the man for ID. He stammers and bolts. Security intercepts him at the exit.',
    next: 'easy-zoey-win',
  },
  'easy-zoey-win': {
    type: 'dialog',
    speaker: 'Agent Zoey',
    speakerColor: 'pink',
    text:
      'Good call, Cadet. That wasn’t IT. That was a social engineer testing our doors — and our people.',
    next: 'easy-debrief',
  },
  'easy-debrief': {
    type: 'debrief',
    title: 'WHAT JUST HAPPENED',
    bullets: [
      { head: 'Authority', body: '"I’m from IT."' },
      { head: 'Urgency', body: '"Before the morning shift."' },
      { head: 'Familiarity', body: '"You’re the new intern, right?"' },
      { head: 'Helplessness', body: '"My badge isn’t scanning."' },
      { head: 'Social pressure', body: 'You didn’t want to seem unhelpful.' },
    ],
    next: 'easy-mcq-1',
  },
  'easy-mcq-1': {
    type: 'mcq',
    label: 'CHECK 1 / 3',
    question:
      'Someone says, "I’m from IT, your boss said you’d help me. I just need your login for a minute." What is this?',
    options: ['Normal IT request', 'Social engineering', 'Harmless favour'],
    correctIndex: 1,
    explanation: 'Authority + urgency + a request for credentials. Classic.',
    next: 'easy-mcq-2',
  },
  'easy-mcq-2': {
    type: 'mcq',
    label: 'CHECK 2 / 3',
    question: 'Which of these is a red flag?',
    options: [
      'Urgent request from an unknown person',
      'Calm request from your known supervisor',
      'Scheduled maintenance email from official channel',
    ],
    correctIndex: 0,
    explanation: 'Urgency from a stranger is the single biggest tell.',
    next: 'easy-mcq-3',
  },
  'easy-mcq-3': {
    type: 'mcq',
    label: 'CHECK 3 / 3',
    question: 'What should you do if you’re not sure?',
    options: [
      'Help anyway to be polite',
      'Ignore it and hope it goes away',
      'Verify through a trusted channel (call, supervisor)',
    ],
    correctIndex: 2,
    explanation: 'Verify out-of-band. That’s how you become a human firewall.',
    next: 'easy-badge',
  },
  'easy-badge': {
    type: 'badge',
    name: 'Human Firewall — Beginner',
    next: 'hard-intro',
  },

  // --- Level 2 (Hard): The Insider -------------------------------------
  'hard-intro': {
    type: 'narration',
    text:
      'One week later. You’re back on archive duty. The internal chat blinks — a message from Agent Harper, someone you’ve seen around but never spoken to.',
    next: 'hard-harper',
  },
  'hard-harper': {
    type: 'dialog',
    speaker: 'Agent Harper',
    speakerColor: 'violet',
    text:
      'Hey — Zoey said you’re handling the archive project. I need the access code for the secure folder. She’s in a briefing and I need it ASAP.',
    next: 'hard-choice',
  },
  'hard-choice': {
    type: 'choice',
    prompt:
      'The profile picture is right. The tone is professional. The name is real.',
    options: [
      { label: 'Send the access code.', next: 'hard-fail-1' },
      { label: 'Check something first — view Harper’s profile.', next: 'hard-profile' },
      { label: 'Message Zoey on a separate channel.', next: 'hard-win-1' },
    ],
  },
  'hard-profile': {
    type: 'debrief',
    title: 'PROFILE INSPECTION',
    bullets: [
      'Account created yesterday.',
      'Job title slightly misspelled ("Senior Anaylst").',
      'No internal contact number on file.',
    ],
    next: 'hard-win-1',
  },
  'hard-fail-1': {
    type: 'narration',
    text: 'You paste the code. A red alert spins up: UNAUTHORISED ACCESS — ARCHIVE BREACH.',
    next: 'hard-zoey-fail',
  },
  'hard-zoey-fail': {
    type: 'dialog',
    speaker: 'Agent Zoey',
    speakerColor: 'pink',
    text:
      'Harper has been on leave for two weeks. That wasn’t her. You didn’t get hacked — you got played.',
    next: 'hard-debrief',
  },
  'hard-win-1': {
    type: 'dialog',
    speaker: 'Agent Zoey',
    speakerColor: 'pink',
    text:
      'I’m not in a briefing. And Harper’s on leave. Do NOT send anything. Come to my office.',
    next: 'hard-debrief',
  },
  'hard-debrief': {
    type: 'debrief',
    title: 'PRETEXTING — BROKEN DOWN',
    bullets: [
      { head: 'Pretexting', body: 'A believable backstory used as a weapon.' },
      { head: 'Authority exploitation', body: 'Using your boss’s name to apply pressure.' },
      { head: 'Urgency', body: 'Forcing fast decisions.' },
      { head: 'Verification', body: 'Always confirm unexpected requests on a known channel.' },
      { head: 'Least privilege', body: 'Never share access codes — even with people you know.' },
    ],
    next: 'badge-hard-3',
  },
  'badge-hard-3': {
    type: 'badge',
    name: 'Human Firewall',
    next: 'END_SUCCESS',
  },
}

const CASE = {
  id: '3',
  title: 'The Insider',
  theme: 'Social engineering',
  start: 'intro-1',
  scenes: SCENES,
}

export default CASE
