// Case 1 — The Bait. Phishing.
// Two levels back to back: an obvious voucher trap, then a professional
// spear-phish. The teaching path runs the same beats whether the player
// falls for the bait or sees through it.

const PHISHING_MCQ = {
  type: 'mcq',
  label: 'KNOWLEDGE CHECK',
  question: 'Phishing is best described as:',
  options: [
    'When you catch a fish out of a river',
    'When you snoop around your siblings’ phone',
    'When a scammer tries to trick you into revealing your personal info',
    'When someone pretends to be you',
  ],
  correctIndex: 2,
  explanation:
    'Phishing is impersonation + a believable hook + a request for data or action. Anyone can fall for it — the defence is slowing down, not being clever.',
  next: 'badge-2',
}

const SCENES = {
  // --- Reception / arrival ----------------------------------------------
  'reception-1': {
    type: 'narration',
    text:
      'Day one. The lobby of Unit Zero is quieter than you expected. A receptionist is hammering at her keyboard behind a tall desk.',
    next: 'reception-2',
  },
  'reception-2': {
    type: 'dialog',
    speaker: 'You',
    speakerColor: 'cyan',
    text: 'Hello — could you please help me find the room S109?',
    next: 'reception-3',
  },
  'reception-3': {
    type: 'dialog',
    speaker: 'Receptionist',
    speakerColor: 'pink',
    text: 'Hi. Before anything — can I see a form of identification, please?',
    next: 'reception-4',
  },
  'reception-4': {
    type: 'dialog',
    speaker: 'You',
    speakerColor: 'cyan',
    text: 'There you go. (Hands over the lanyard.)',
    next: 'reception-5',
  },
  'reception-5': {
    type: 'dialog',
    speaker: 'Receptionist',
    speakerColor: 'pink',
    text:
      'Oh — you must be the new intern. Congratulations and welcome to the team. The room you’re looking for is on the first floor of the southern block.',
    next: 'reception-6',
  },
  'reception-6': {
    type: 'narration',
    text:
      'You take the lift up. S109 turns out to be a small workstation with one screen already on. A chat window blinks.',
    next: 'jane-1',
  },
  'jane-1': {
    type: 'dialog',
    speaker: 'Agent Jane',
    speakerColor: 'violet',
    text:
      'Welcome to Unit Zero. Stay sharp — nothing here is what it looks like.',
    next: 'inbox-ping',
  },

  // --- Level 1 (Easy): voucher phish -----------------------------------
  'inbox-ping': {
    type: 'narration',
    text:
      'A new email lands in the inbox the moment you sit down. The subject line glows in pink.',
    next: 'voucher-email',
  },
  'voucher-email': {
    type: 'narration',
    text:
      'From: hr-welcomedesk@unit-zero-benefits.cm\nSubject: 🎁 Your welcome gift voucher — claim before Friday!\n\n"Congratulations on joining Unit Zero! As a token of appreciation, we’ve prepared a £50 welcome voucher for you. Click below to claim it within 48 hours before it expires."\n\nA countdown timer ticks. A big green button reads CLAIM YOUR VOUCHER.',
    next: 'voucher-choice',
  },
  'voucher-choice': {
    type: 'choice',
    prompt: 'It’s your first day. What do you do?',
    options: [
      { label: 'Click the link and claim the voucher.', next: 'voucher-fail-1' },
      { label: 'Ignore it and flag it to your supervisor.', next: 'voucher-win-1' },
    ],
  },
  'voucher-fail-1': {
    type: 'narration',
    text:
      'The screen flashes. A loading bar fills, no warning sign in sight. A "verification" form appears asking for your name, employee ID, and home address. You fill it in.',
    next: 'voucher-fail-2',
  },
  'voucher-fail-2': {
    type: 'narration',
    text:
      'The form dissolves with a soft animation. "Voucher sent to your inbox!"\n\nA few minutes later — heavy footsteps. The door swings open.',
    next: 'zoey-failed',
  },
  'zoey-failed': {
    type: 'dialog',
    speaker: 'Agent Zoey',
    speakerColor: 'pink',
    text:
      'Cadet. Your credentials just tried to log into the building security system. Care to explain?',
    next: 'voucher-debrief',
  },
  'voucher-win-1': {
    type: 'dialog',
    speaker: 'Agent Zoey',
    speakerColor: 'pink',
    text:
      'Good instinct, Cadet. That email’s been bouncing around the building all morning. Now sit down — I want to walk you through why it’s a fake.',
    next: 'voucher-debrief',
  },
  'voucher-debrief': {
    type: 'debrief',
    title: 'THE EMAIL, BROKEN DOWN',
    intro:
      'Agent Zoey pulls the email up on the holographic screen and circles each tell in red.',
    bullets: [
      { head: 'Spoofed domain', body: 'unit-zero-benefits.cm ≠ unitzero.gov' },
      { head: 'Urgency tactic', body: '“Claim before Friday!” — pressure to act before thinking.' },
      { head: 'Impersonated logo', body: 'Colours slightly off; a near-miss of the real mark.' },
      { head: 'Personal info request', body: 'Classic credential harvesting.' },
    ],
    next: 'zoey-philosophy',
  },
  'zoey-philosophy': {
    type: 'dialog',
    speaker: 'Agent Zoey',
    speakerColor: 'pink',
    text:
      'Phishing isn’t about intelligence. It’s about psychology. Anyone can fall for it — even trained agents. What matters is learning to spot the hook.',
    next: 'phishing-101',
  },
  'phishing-101': {
    type: 'debrief',
    title: 'PHISHING 101',
    intro: 'Card filed in the case folder.',
    bullets: [
      { head: 'Impersonation', body: 'They pretend to be HR, your bank, your boss, a service you use.' },
      { head: 'The hook', body: 'They offer something tempting, or threaten something alarming.' },
      { head: 'Capture', body: 'They make you click a link or fill in a form.' },
      { head: 'Exploit', body: 'They use your info to break into systems or accounts.' },
    ],
    next: 'badge-1',
  },
  'badge-1': {
    type: 'badge',
    name: 'Hooked Once',
    next: 'week-later',
  },

  // --- Level 2 (Hard): the double bluff --------------------------------
  'week-later': {
    type: 'narration',
    text:
      'One week later. You’ve been digitising old case files and have started to feel like you belong. The inbox pings again.',
    next: 'spear-email',
  },
  'spear-email': {
    type: 'narration',
    text:
      'From: agentzoey.a@unitzero.gov\nSubject: Re: Case File Access — Action Required\n\n"Hey, I noticed you’ve been working on the digitisation project. I’m sharing a secure link to the encrypted case folder. Log in to verify your access level before end of day — the system resets at midnight. Let me know once you’re in."\n\nThe domain looks right. The tone is right. No countdown. No gift. It feels safe.',
    next: 'spear-choice',
  },
  'spear-choice': {
    type: 'choice',
    prompt: 'What do you do first?',
    options: [
      { label: 'Click the link.', next: 'spear-fail-1' },
      { label: 'Hover over the link to read the full URL.', next: 'spear-hover' },
      { label: 'Message Agent Zoey directly on a separate channel.', next: 'spear-win-1' },
    ],
  },
  'spear-hover': {
    type: 'mcq',
    label: 'HOVER PREVIEW',
    question:
      'The link reads unitzero.gov but hovering reveals: unitzero.gov.co — redirecting to document-verify.net. Is this the real Unit Zero website?',
    options: [
      'Yes — the unitzero.gov part means it’s ours.',
      'No — the real domain is unitzero.gov; .gov.co is a different domain entirely.',
      'Yes — the .co just means it’s a corporate mirror.',
      'No idea — best to click and find out.',
    ],
    correctIndex: 1,
    explanation:
      'Subdomain deception: everything to the LEFT of the last dot can be made to look like anything. unitzero.gov.co belongs to whoever bought gov.co.',
    next: 'spear-win-1',
  },
  'spear-fail-1': {
    type: 'narration',
    text:
      'A perfect clone of the Unit Zero login page loads. You enter your credentials. "Access confirmed. Thank you." Everything seems normal.',
    next: 'spear-fail-2',
  },
  'spear-fail-2': {
    type: 'narration',
    text:
      'An hour later you’re summoned to Agent Zoey’s office. You step inside. There are two Zoeys.',
    next: 'two-zoeys',
  },
  'two-zoeys': {
    type: 'dialog',
    speaker: 'Agent Zoey',
    speakerColor: 'pink',
    text:
      'This one was designed by professionals, Cadet. You weren’t careless — you were targeted. The attacker spoofed my name over a fake domain. Now we have a problem to fix.',
    next: 'log-puzzle',
  },
  'spear-win-1': {
    type: 'dialog',
    speaker: 'Agent Zoey',
    speakerColor: 'pink',
    text:
      'Smart move calling first. I never sent that email — someone spoofed my name over a fake domain. Sit down. I want you to help me trace it.',
    next: 'log-puzzle',
  },
  'log-puzzle': {
    type: 'multi',
    prompt:
      'Server log review. Flag the entries that are indicators of compromise.',
    options: [
      { label: 'Login attempt from a domain registered yesterday.', harmful: true },
      { label: 'Scheduled backup job ran at 03:00.', harmful: false },
      { label: 'Outbound redirect to document-verify.net.', harmful: true },
      { label: 'Header "From: Agent Zoey" with envelope-sender on .gov.co', harmful: true },
      { label: 'Cadet workstation requested unitzero.gov/cases (cached).', harmful: false },
      { label: 'POST /login carrying credential-harvest script tag in response.', harmful: true },
    ],
    debrief:
      'Display-name spoofing, subdomain trickery, malicious redirect, harvest script — four tells, all visible if you slow down and read.',
    next: 'spear-debrief',
  },
  'spear-debrief': {
    type: 'debrief',
    title: 'ADVANCED PHISHING',
    bullets: [
      { head: 'Display-name spoofing', body: 'The name on the email is not the actual sender.' },
      { head: 'Subdomain deception', body: 'unitzero.gov.co ≠ unitzero.gov.' },
      { head: 'No urgency ≠ safe', body: 'Pro-grade attacks deliberately stay calm.' },
      { head: 'Verify out-of-band', body: 'Confirm unexpected requests through a known channel.' },
    ],
    next: 'phishing-mcq',
  },
  'phishing-mcq': PHISHING_MCQ,
  'badge-2': {
    type: 'badge',
    name: 'Burned Twice, Wiser Once',
    next: 'END_SUCCESS',
  },
}

const CASE = {
  id: '1',
  title: 'The Bait',
  theme: 'Phishing',
  start: 'reception-1',
  scenes: SCENES,
}

export default CASE
