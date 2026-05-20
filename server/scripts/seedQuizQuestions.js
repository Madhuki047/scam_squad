import 'dotenv/config'
import mongoose from 'mongoose'
import QuizQuestion from '../models/QuizQuestion.js'

// 45 questions: 5 categories x 3 difficulties x 3 questions.
// Educational, ages 10-18. `correctIndex` is 0-based.
const QUESTIONS = [
  // --- PHISHING --------------------------------------------------------
  {
    category: 'phishing',
    difficulty: 'easy',
    question:
      "An email says 'URGENT: your account will be locked in 1 hour. Click here to verify.' What is it most likely?",
    options: [
      'A real bank notification',
      'A phishing scam',
      'An advertisement',
      'A subscription renewal',
    ],
    correctIndex: 1,
  },
  {
    category: 'phishing',
    difficulty: 'easy',
    question: 'What is the safest way to check if a link is real?',
    options: [
      'Click it and see what happens',
      'Hover over it to read the full URL first',
      'Forward it to all your friends',
      'Reply asking the sender to confirm',
    ],
    correctIndex: 1,
  },
  {
    category: 'phishing',
    difficulty: 'easy',
    question: 'Which is a typical sign of a phishing email?',
    options: [
      'It uses your full name in the greeting',
      'It comes from your bank’s official domain',
      'It threatens urgent action and contains a strange link',
      'It has no attachments',
    ],
    correctIndex: 2,
  },
  {
    category: 'phishing',
    difficulty: 'medium',
    question:
      "An email comes from 'support@arnazon-help.com' claiming to be Amazon. What’s wrong?",
    options: [
      'Nothing — Amazon uses many domains',
      'The domain is misspelled (typosquatting)',
      'The sender’s name is wrong',
      'It is missing an attachment',
    ],
    correctIndex: 1,
  },
  {
    category: 'phishing',
    difficulty: 'medium',
    question: '“Spear phishing” is different from regular phishing because it...',
    options: [
      'Targets a specific person using personal details',
      'Uses spears instead of hooks',
      'Only happens in spear-fishing season',
      'Always uses SMS',
    ],
    correctIndex: 0,
  },
  {
    category: 'phishing',
    difficulty: 'medium',
    question:
      "A login page URL is 'https://googIe.com' (capital i instead of L). This is...",
    options: [
      'Safe — it uses HTTPS',
      'A homograph attack using lookalike characters',
      'A typo by Google',
      'A test by your school',
    ],
    correctIndex: 1,
  },
  {
    category: 'phishing',
    difficulty: 'hard',
    question:
      'Even a phishing site with a valid HTTPS padlock is dangerous because...',
    options: [
      'HTTPS only proves the connection is encrypted, not that the site is honest',
      'HTTPS sites cannot be phishing',
      'The padlock is fake',
      'HTTPS is broken on phones',
    ],
    correctIndex: 0,
  },
  {
    category: 'phishing',
    difficulty: 'hard',
    question:
      'Which mitigation best stops credential phishing from succeeding?',
    options: [
      'Stronger passwords alone',
      'Multi-factor authentication (e.g. an app code)',
      'Using a longer username',
      'Saving passwords in your browser',
    ],
    correctIndex: 1,
  },
  {
    category: 'phishing',
    difficulty: 'hard',
    question: 'A “credential stuffing” attack uses...',
    options: [
      'Random guesses against your account',
      'Previously breached username/password pairs against many sites',
      'Phone calls instead of email',
      'Malware on the victim’s device',
    ],
    correctIndex: 1,
  },

  // --- CYBERBULLYING ---------------------------------------------------
  {
    category: 'cyberbullying',
    difficulty: 'easy',
    question:
      'If you see someone being bullied online, the BEST first step is to...',
    options: [
      'Reply with an even meaner message',
      'Save evidence (screenshot) and report it',
      'Ignore it forever',
      'Share the bully’s message widely',
    ],
    correctIndex: 1,
  },
  {
    category: 'cyberbullying',
    difficulty: 'easy',
    question: 'Cyberbullying is...',
    options: [
      'Only the use of bad words',
      'Any repeated, hostile online behaviour meant to harm someone',
      'Just teasing among friends',
      'Only what happens on one app',
    ],
    correctIndex: 1,
  },
  {
    category: 'cyberbullying',
    difficulty: 'easy',
    question: 'Most platforms let you...',
    options: [
      'Block, mute and report harmful accounts',
      'Send a virus to the bully',
      'See the bully’s home address',
      'Hack their account',
    ],
    correctIndex: 0,
  },
  {
    category: 'cyberbullying',
    difficulty: 'medium',
    question:
      'A friend’s account suddenly posts cruel things about you. The most likely explanation is...',
    options: [
      'They have always thought that way',
      'Their account was hijacked or someone is impersonating them',
      'The platform is broken',
      'It is a system message',
    ],
    correctIndex: 1,
  },
  {
    category: 'cyberbullying',
    difficulty: 'medium',
    question: '“Doxxing” means...',
    options: [
      'Hosting documents in the cloud',
      'Publishing someone’s private personal information online to harm them',
      'Sending too many messages',
      'Posting documents legally',
    ],
    correctIndex: 1,
  },
  {
    category: 'cyberbullying',
    difficulty: 'medium',
    question:
      'If a stranger demands money to keep your old chats private, this is...',
    options: [
      'A normal request',
      'Online extortion (sextortion) — report it, do not pay',
      'A free service',
      'A friendly warning',
    ],
    correctIndex: 1,
  },
  {
    category: 'cyberbullying',
    difficulty: 'hard',
    question:
      'Bystanders can reduce cyberbullying most effectively by...',
    options: [
      'Sharing the bully’s messages everywhere',
      'Privately supporting the target and reporting the abuse',
      'Telling the target it is their fault',
      'Doing nothing — it is not their problem',
    ],
    correctIndex: 1,
  },
  {
    category: 'cyberbullying',
    difficulty: 'hard',
    question:
      'Why is “callout culture” sometimes harmful even when the cause is justified?',
    options: [
      'It can become coordinated harassment that punishes far beyond the offence',
      'It always uses fake accounts',
      'It is illegal everywhere',
      'It never works',
    ],
    correctIndex: 0,
  },
  {
    category: 'cyberbullying',
    difficulty: 'hard',
    question:
      'Removing every record of online bullying yourself is often a bad idea because...',
    options: [
      'Deleting it sends the bully a worse message',
      'You need the screenshots as evidence for the platform or police',
      'It is impossible',
      'It costs money',
    ],
    correctIndex: 1,
  },

  // --- SOCIAL ENGINEERING ---------------------------------------------
  {
    category: 'social',
    difficulty: 'easy',
    question: 'Social engineering is...',
    options: [
      'Building social networks',
      'Tricking people into giving up information or access',
      'A type of computer virus',
      'A polite chat',
    ],
    correctIndex: 1,
  },
  {
    category: 'social',
    difficulty: 'easy',
    question:
      "A caller says 'I'm from IT, I just need your password to fix your computer.' You should...",
    options: [
      'Read it out',
      'Refuse and verify through known channels',
      'Whisper it',
      'Send it by email',
    ],
    correctIndex: 1,
  },
  {
    category: 'social',
    difficulty: 'easy',
    question: '“Tailgating” in security means...',
    options: [
      'Following too closely in a car',
      'Slipping into a secure door behind someone with a real badge',
      'Watching TV at night',
      'Repeating the last word',
    ],
    correctIndex: 1,
  },
  {
    category: 'social',
    difficulty: 'medium',
    question:
      'A caller knows your name, school, and favourite teacher. This information was most likely gathered from...',
    options: [
      'Magic',
      'Your public social media',
      'Your bank',
      'Your DNS records',
    ],
    correctIndex: 1,
  },
  {
    category: 'social',
    difficulty: 'medium',
    question: '“Pretexting” is when an attacker...',
    options: [
      'Pretends not to know the victim',
      'Invents a believable backstory to extract information',
      'Sends only text messages',
      'Writes a long pretext to a story',
    ],
    correctIndex: 1,
  },
  {
    category: 'social',
    difficulty: 'medium',
    question:
      'USB sticks dropped in a car park are dangerous because...',
    options: [
      'They might explode',
      'They can install malware when plugged in (a “baiting” attack)',
      'They are always empty',
      'They cost too much',
    ],
    correctIndex: 1,
  },
  {
    category: 'social',
    difficulty: 'hard',
    question:
      'The single best defence against most social-engineering calls is...',
    options: [
      'Always being polite',
      'Verifying the caller through a separate, trusted channel before acting',
      'Never picking up the phone',
      'Using a louder voice',
    ],
    correctIndex: 1,
  },
  {
    category: 'social',
    difficulty: 'hard',
    question: 'An insider threat is...',
    options: [
      'A spy outside the company',
      'A trusted person (employee, contractor) misusing their access',
      'A type of malware',
      'A scam targeted at insiders',
    ],
    correctIndex: 1,
  },
  {
    category: 'social',
    difficulty: 'hard',
    question: '“Vishing” combines...',
    options: [
      'Voice calls + phishing',
      'Video + fishing',
      'Virtual + shopping',
      'VPN + phishing',
    ],
    correctIndex: 0,
  },

  // --- PUBLIC WI-FI ----------------------------------------------------
  {
    category: 'wifi',
    difficulty: 'easy',
    question: 'Free public Wi-Fi at a café is risky because...',
    options: [
      'It is always slow',
      'Other people on the network can sometimes see or alter your traffic',
      'It charges you secretly',
      'It is always illegal',
    ],
    correctIndex: 1,
  },
  {
    category: 'wifi',
    difficulty: 'easy',
    question: 'When using public Wi-Fi, the safest practice is to...',
    options: [
      'Disable Wi-Fi entirely',
      'Use a trusted VPN and prefer HTTPS sites',
      'Share your password',
      'Turn off your screen',
    ],
    correctIndex: 1,
  },
  {
    category: 'wifi',
    difficulty: 'easy',
    question: 'An “Evil Twin” Wi-Fi network is...',
    options: [
      'A second router at home',
      'A fake hotspot pretending to be a real one to capture traffic',
      'A network for twins',
      'A backup Wi-Fi',
    ],
    correctIndex: 1,
  },
  {
    category: 'wifi',
    difficulty: 'medium',
    question: 'HTTPS on public Wi-Fi mainly protects...',
    options: [
      'The contents of your traffic from other users on the network',
      'Your laptop’s battery',
      'Your social-media privacy from your friends',
      'You from phishing emails',
    ],
    correctIndex: 0,
  },
  {
    category: 'wifi',
    difficulty: 'medium',
    question:
      "Connecting to a network named 'Free_Airport_WiFi' with no password is...",
    options: [
      'Safe because it is free',
      'Risky — anyone could have set it up',
      'Faster than other networks',
      'A great way to save data',
    ],
    correctIndex: 1,
  },
  {
    category: 'wifi',
    difficulty: 'medium',
    question:
      "A captive portal that asks for your bank login to 'connect' is...",
    options: [
      'Standard practice',
      'Almost certainly a scam — networks should never need your bank login',
      'Required by law',
      'A bonus',
    ],
    correctIndex: 1,
  },
  {
    category: 'wifi',
    difficulty: 'hard',
    question: 'Why is a corporate VPN a strong defence on hostile Wi-Fi?',
    options: [
      'It encrypts your traffic between you and the company before the local network sees it',
      'It speeds up the connection',
      'It hides your laptop’s MAC address forever',
      'It gives you unlimited data',
    ],
    correctIndex: 0,
  },
  {
    category: 'wifi',
    difficulty: 'hard',
    question:
      'An attacker performing an ARP-spoofing man-in-the-middle attack on Wi-Fi can be defeated mostly by...',
    options: [
      'Using HTTPS / TLS for everything',
      'Lowering your screen brightness',
      'Switching to 5GHz',
      'Changing your username',
    ],
    correctIndex: 0,
  },
  {
    category: 'wifi',
    difficulty: 'hard',
    question: '“Karma” attacks against Wi-Fi work because devices...',
    options: [
      'Broadcast the names of networks they remember and trust',
      'Always use HTTPS',
      'Refuse open networks',
      'Run antivirus',
    ],
    correctIndex: 0,
  },

  // --- AI MANIPULATION -------------------------------------------------
  {
    category: 'ai',
    difficulty: 'easy',
    question: 'A “deepfake” is...',
    options: [
      'A very deep lake',
      'An AI-generated video or audio of a real person doing or saying things they did not',
      'A new social network',
      'A type of password',
    ],
    correctIndex: 1,
  },
  {
    category: 'ai',
    difficulty: 'easy',
    question:
      "If a video call from 'your principal' demands money urgently and sounds odd, you should...",
    options: [
      'Send the money quickly',
      'Hang up and verify by calling the principal’s known number',
      'Ignore and forget it',
      'Post it online first',
    ],
    correctIndex: 1,
  },
  {
    category: 'ai',
    difficulty: 'easy',
    question: 'Generative AI can sometimes...',
    options: [
      'Confidently make up false facts (“hallucinate”)',
      'Never make mistakes',
      'Always cite real sources',
      'Only repeat what was typed',
    ],
    correctIndex: 0,
  },
  {
    category: 'ai',
    difficulty: 'medium',
    question:
      'A “prompt injection” attack against an AI chatbot tries to...',
    options: [
      'Hack the AI’s wires',
      'Hide instructions in input that trick the AI into ignoring its rules',
      'Inject the user with chemicals',
      'Speed up the AI',
    ],
    correctIndex: 1,
  },
  {
    category: 'ai',
    difficulty: 'medium',
    question:
      'A safe habit when an AI gives you an answer used for an important decision is to...',
    options: [
      'Trust it completely',
      'Verify key facts against a trusted source',
      'Forward it to a stranger',
      'Print and frame it',
    ],
    correctIndex: 1,
  },
  {
    category: 'ai',
    difficulty: 'medium',
    question: 'An AI voice clone usually needs...',
    options: [
      'Hours of secret recording in a studio',
      'Sometimes just a short sample of public audio',
      'Nothing at all',
      'A government licence',
    ],
    correctIndex: 1,
  },
  {
    category: 'ai',
    difficulty: 'hard',
    question:
      'A common defence against AI voice-clone scams targeting your family is to...',
    options: [
      'Agree a family safe word in advance',
      'Speak louder on the phone',
      'Use a new phone for every call',
      'Switch to email only',
    ],
    correctIndex: 0,
  },
  {
    category: 'ai',
    difficulty: 'hard',
    question: 'AI-generated phishing is often more dangerous because it...',
    options: [
      'Removes the broken-English clues that used to give scams away',
      'Always uses GIFs',
      'Is signed by the AI company',
      'Targets only AI users',
    ],
    correctIndex: 0,
  },
  {
    category: 'ai',
    difficulty: 'hard',
    question: 'Model “jailbreaking” refers to...',
    options: [
      'Escaping a real prison with AI',
      'Coaxing an AI into ignoring its safety policies',
      'Buying a new model phone',
      'Cleaning the model',
    ],
    correctIndex: 1,
  },
]

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set. Add it to server/.env')
    process.exit(1)
  }
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected. Replacing quiz questions...')
  await QuizQuestion.deleteMany({})
  await QuizQuestion.insertMany(QUESTIONS)
  console.log(`Inserted ${QUESTIONS.length} questions.`)
  await mongoose.disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
