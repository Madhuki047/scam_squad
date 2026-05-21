// Case 4 — The Hotspot. Public Wi-Fi.
// Two levels: a free Tube hotspot at Oxford Circus, then a mall network
// analysis where the malicious AP hides among legitimate-sounding ones.

const SCENES = {
  'intro-1': {
    type: 'dialog',
    speaker: 'Agent Ricky',
    speakerColor: 'cyan',
    text:
      'Cadet, public Wi-Fi is the Wild West. No rules. No locks. No guarantees. Today’s lesson: the most dangerous network is the one that looks free.',
    next: 'easy-arrive',
  },

  // --- Level 1 (Easy): The Open Gate -----------------------------------
  'easy-arrive': {
    type: 'narration',
    text:
      'Oxford Circus, rush hour. You sit on a bench and open the laptop. The Wi-Fi list pops up:\n\n  _TFL_WiFi_Official\n  TFL_WiFi_Free\n  FREE_TUBE_WIFI_123\n  UnitZero_Guest (???)',
    next: 'easy-choice',
  },
  'easy-choice': {
    type: 'choice',
    prompt: 'You need to upload a report.',
    options: [
      { label: 'Connect to FREE_TUBE_WIFI_123 — strongest signal.', next: 'easy-fail-1' },
      { label: 'Use your mobile hotspot instead.', next: 'easy-win-1' },
    ],
  },
  'easy-fail-1': {
    type: 'narration',
    text:
      'The screen flickers. "Tube Wi-Fi requires verification. Please log in to continue." A fake portal asks for your Unit Zero email and password. You hesitate. You enter them.',
    next: 'easy-ricky-fail',
  },
  'easy-ricky-fail': {
    type: 'dialog',
    speaker: 'Agent Ricky',
    speakerColor: 'cyan',
    text:
      'Cadet. Someone just tried to access Unit Zero servers using your credentials. You connected to a rogue hotspot. That wasn’t TfL Wi-Fi — that was a trap.',
    next: 'easy-debrief',
  },
  'easy-win-1': {
    type: 'narration',
    text:
      'You tether to your phone instead. A man leaning against a pillar slams his laptop shut and walks off. Your phone buzzes.',
    next: 'easy-ricky-win',
  },
  'easy-ricky-win': {
    type: 'dialog',
    speaker: 'Agent Ricky',
    speakerColor: 'cyan',
    text:
      'Good instincts, Cadet. We’ve been tracking a rogue hotspot operator on the Central Line. You just avoided giving him your entire digital life.',
    next: 'easy-debrief',
  },
  'easy-debrief': {
    type: 'debrief',
    title: 'RED FLAGS',
    bullets: [
      { head: 'Open network', body: 'No password = no encryption.' },
      { head: 'Suspicious name', body: '"FREE_TUBE_WIFI_123" mimics the real network.' },
      { head: 'Fake login portal', body: 'TfL never asks for company credentials.' },
      { head: 'Strong signal', body: 'The attacker is physically nearby.' },
    ],
    next: 'easy-mcq-1',
  },
  'easy-mcq-1': {
    type: 'mcq',
    label: 'CHECK 1 / 3',
    question: 'Which Wi-Fi network is most dangerous?',
    options: [
      'Open network with no password',
      'Password-protected network',
      'Your mobile hotspot',
    ],
    correctIndex: 0,
    next: 'easy-mcq-2',
  },
  'easy-mcq-2': {
    type: 'mcq',
    label: 'CHECK 2 / 3',
    question: 'A login page appears after connecting to Wi-Fi. What do you do?',
    options: [
      'Enter your credentials.',
      'Disconnect immediately.',
      'Refresh the page.',
    ],
    correctIndex: 1,
    next: 'easy-mcq-3',
  },
  'easy-mcq-3': {
    type: 'mcq',
    label: 'CHECK 3 / 3',
    question: 'What’s the safest option in public?',
    options: [
      'Free Wi-Fi',
      'Mobile hotspot',
      'Any network with "Free" in the name',
    ],
    correctIndex: 1,
    next: 'badge-easy-4',
  },
  'badge-easy-4': {
    type: 'badge',
    name: 'Network Navigator — Beginner',
    next: 'hard-intro',
  },

  // --- Level 2 (Hard): The Silent Listener -----------------------------
  'hard-intro': {
    type: 'narration',
    text:
      'A nearby shopping mall has reported suspicious Wi-Fi behaviour. Three networks appear in the analyser — all with strong signals, all with similar names.',
    next: 'hard-scan',
  },
  'hard-scan': {
    type: 'multi',
    prompt:
      'Inspect the access points. Flag anything that indicates a rogue hotspot.',
    options: [
      { label: 'Mall_Guest_Free — no encryption (open).', harmful: true },
      { label: 'Mall_Guest_Free — MAC address rotates every few minutes.', harmful: true },
      { label: 'Mall_Guest — WPA2 with the mall’s posted password.', harmful: false },
      { label: 'Mall_Guest_Free — traffic spike when users open social apps.', harmful: true },
      { label: 'Mall_Guest_5G — same SSID structure, posted on signage.', harmful: false },
      { label: 'Mall_Guest_Free — device names appearing in plain text on the wire.', harmful: true },
    ],
    debrief:
      'MAC rotation + open encryption + plaintext device names + traffic spikes around logins is a textbook rogue access point.',
    next: 'hard-decision',
  },
  'hard-decision': {
    type: 'choice',
    prompt: 'What now?',
    options: [
      { label: 'Connect for "testing".', next: 'hard-fail-1' },
      { label: 'Flag the network as malicious.', next: 'hard-win-1' },
    ],
  },
  'hard-fail-1': {
    type: 'narration',
    text:
      'A "Your browser needs an update" popup fires the moment you connect. You start the install. A government-device alert spins up.',
    next: 'hard-zoey-fail',
  },
  'hard-zoey-fail': {
    type: 'dialog',
    speaker: 'Agent Zoey',
    speakerColor: 'pink',
    text:
      'Cadet. You just installed malware onto a government device. That wasn’t an update — that was an attack.',
    next: 'hard-debrief',
  },
  'hard-win-1': {
    type: 'dialog',
    speaker: 'Agent Ricky',
    speakerColor: 'cyan',
    text:
      'Nice work. That’s a rogue access point using MAC spoofing and packet sniffing. You just prevented a mall-wide credential harvest.',
    next: 'hard-debrief',
  },
  'hard-debrief': {
    type: 'debrief',
    title: 'TEACHING POINTS',
    bullets: [
      { head: 'Rogue hotspots mimic real networks', body: 'SSIDs are free to forge.' },
      { head: 'Encryption matters', body: 'WPA2/WPA3 vs open.' },
      { head: 'MAC spoofing', body: 'Attacker hiding identity behind a rotating address.' },
      { head: 'Fake update popups', body: 'A common malware delivery surface.' },
      { head: 'Never test by connecting', body: 'Verify the network name with staff first.' },
    ],
    next: 'badge-hard-4',
  },
  'badge-hard-4': {
    type: 'badge',
    name: 'Network Navigator',
    next: 'END_SUCCESS',
  },
}

const CASE = {
  id: '4',
  title: 'The Hotspot',
  theme: 'Public Wi-Fi',
  start: 'intro-1',
  scenes: SCENES,
}

export default CASE
