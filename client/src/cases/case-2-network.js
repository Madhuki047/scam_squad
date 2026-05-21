// Case 2 — The Network. Cyberbullying.
// Two levels: subtle exclusion in a thread review, then a viral pile-on
// reconstruction. The teaching focuses on the quiet harms players tend
// to miss.

const SCENES = {
  // --- Setup -----------------------------------------------------------
  'intro-1': {
    type: 'dialog',
    speaker: 'Agent Ricky',
    speakerColor: 'cyan',
    text:
      'Cadet, cybercrime isn’t always code and servers. Sometimes the damage comes from a keyboard in a teenager’s bedroom. Today’s case is messy. It’s human. And it hurts in ways firewalls can’t block.',
    next: 'intro-2',
  },
  'intro-2': {
    type: 'narration',
    text:
      'You are reassigned to the Digital Wellbeing Desk. The first folder on your screen is from a 14-year-old named Emma.',
    next: 'easy-prompt',
  },

  // --- Level 1 (Easy): "Just Jokes" ------------------------------------
  'easy-prompt': {
    type: 'multi',
    prompt:
      'Six message threads flagged by the platform. Flag everything that crosses the line into cyberbullying.',
    options: [
      { label: '"You look disgusting in this photo lol."', harmful: true },
      { label: 'Group chat: Emma is left out of every plan, for weeks.', harmful: true },
      { label: 'Two friends argue about a homework assignment.', harmful: false },
      { label: '"Joke poll" — never tagged but obviously about Emma.', harmful: true },
      { label: 'A classmate comments "lol", "ok?", "yikes" under every post.', harmful: true },
      { label: '"Nice goal yesterday!" on a sports photo.', harmful: false },
    ],
    debrief:
      'Most players catch the loud punches. The quiet ones — silence, deniable jokes, drip-feed undermining — are harder to flag but land just as hard.',
    next: 'easy-debrief-1',
  },
  'easy-debrief-1': {
    type: 'dialog',
    speaker: 'Agent Ricky',
    speakerColor: 'cyan',
    text:
      'You caught the loud punches, Cadet. But you missed the quiet ones — the ones that land every day.',
    next: 'easy-timeline',
  },
  'easy-timeline': {
    type: 'debrief',
    title: 'TIMELINE',
    bullets: [
      { head: 'Day 1', body: 'First exclusion.' },
      { head: 'Day 5', body: 'Joke poll.' },
      { head: 'Day 12', body: 'Undermining comments increase.' },
      { head: 'Day 18', body: 'Emma stops posting.' },
      { head: 'Day 21', body: 'Emma stops coming to school.' },
    ],
    next: 'easy-explain',
  },
  'easy-explain': {
    type: 'debrief',
    title: 'BULLYING IS DEFINED BY',
    bullets: [
      { head: 'Repetition', body: 'A drip. A drip. A drip.' },
      { head: 'Harm', body: 'Even when nobody can point at a single moment.' },
      { head: 'Power imbalance', body: 'Numbers, status, audience.' },
      { head: 'Impact matters more than intent', body: '“Just joking” doesn’t erase damage.' },
    ],
    next: 'badge-easy-2',
  },
  'badge-easy-2': {
    type: 'badge',
    name: 'Empathy Activated',
    next: 'hard-intro',
  },

  // --- Level 2 (Hard): The Pile-On -------------------------------------
  'hard-intro': {
    type: 'narration',
    text:
      'A new file lands on your desk. Aaron, 16, posted a harmless video about a school policy. Within 48 hours it had spiralled into a viral meme.',
    next: 'hard-thread',
  },
  'hard-thread': {
    type: 'narration',
    text:
      'You scroll through the timeline:\n\n• Aaron posts a normal opinion video.\n• A classmate reshares it with the caption "this kid 💀".\n• Strangers create edits, jokes, captions.\n• Aaron DMs a classmate: "Please make it stop."\n• The classmate screenshots the DM and posts it publicly. Laughing emojis attached.',
    next: 'hard-judgment',
  },
  'hard-judgment': {
    type: 'multi',
    prompt:
      'Who is responsible? Flag every actor whose behaviour counts as cyberbullying.',
    options: [
      { label: 'The classmate who reshared with the death emoji.', harmful: true },
      { label: 'Strangers who joined the pile-on.', harmful: true },
      { label: 'The classmate who screenshotted Aaron’s private plea.', harmful: true },
      { label: 'Other students who saw it and stayed silent.', harmful: false },
      { label: 'Meme creators who edited the video.', harmful: true },
      { label: 'Aaron himself, for posting the original video.', harmful: false },
    ],
    debrief:
      'Anonymity does not remove accountability. A thousand small actions can crush someone just as much as one big one.',
    next: 'hard-ricky-1',
  },
  'hard-ricky-1': {
    type: 'dialog',
    speaker: 'Agent Ricky',
    speakerColor: 'cyan',
    text:
      'Intent doesn’t erase impact. But there’s a moment in this file you almost walked past.',
    next: 'hard-ricky-2',
  },
  'hard-ricky-2': {
    type: 'dialog',
    speaker: 'Agent Ricky',
    speakerColor: 'cyan',
    text:
      'That screenshot of him asking for help? That’s not collateral damage. That’s the cruellest thing in this whole file. In every bullying case you’ll ever work, there’s a moment like that — and it’s usually the one people walk past.',
    next: 'hard-debrief',
  },
  'hard-debrief': {
    type: 'debrief',
    title: 'TEACHING POINTS',
    bullets: [
      { head: 'Pile-ons cause real psychological harm', body: 'Scale changes everything.' },
      { head: 'Strangers can still be responsible', body: '"I didn’t know them" is not a defence.' },
      { head: 'Sharing private messages', body: 'A severe violation — the worst tier of harm in this file.' },
      { head: 'Bystanders escalate or de-escalate', body: 'Silence after the line is crossed is a choice.' },
    ],
    next: 'hard-mcq',
  },
  'hard-mcq': {
    type: 'mcq',
    label: 'KNOWLEDGE CHECK',
    question:
      'A friend’s account suddenly posts cruel things about you. The most likely explanation is...',
    options: [
      'They have always thought that way.',
      'Their account was hijacked or someone is impersonating them.',
      'The platform is broken.',
      'It is a system message.',
    ],
    correctIndex: 1,
    explanation:
      'Stolen / cloned accounts are a common cyberbullying delivery vector. Save evidence, verify out-of-band, report through the platform.',
    next: 'badge-hard-2',
  },
  'badge-hard-2': {
    type: 'badge',
    name: 'Digital Defender',
    next: 'END_SUCCESS',
  },
}

const CASE = {
  id: '2',
  title: 'The Network',
  theme: 'Cyberbullying',
  start: 'intro-1',
  scenes: SCENES,
}

export default CASE
