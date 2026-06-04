import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { IconArrowRight, IconFlag, IconLock } from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext.jsx'
import { isCaseModeUnlocked } from '../lib/caseProgress.js'
import { api } from '../lib/api.js'
import { BADGES } from '../lib/badges.js'
import { playSfx } from '../lib/sound.js'
import threadImage1 from '../assets/case2/thread1.jpeg'
import threadImage2 from '../assets/case2/thread2.jpeg'
import threadImage3 from '../assets/case2/thread3.jpeg'
import threadImage4 from '../assets/case2/thread4.jpeg'
import threadImage5 from '../assets/case2/thread5.jpeg'
import threadImage6 from '../assets/case2/thread6.jpeg'
import threadImage7 from '../assets/case2/thread7.jpeg'
import threadImage8 from '../assets/case2/thread8.jpeg'
import fillerImage from '../assets/filler.jpg'
import oxfordCircusStationImage from '../assets/case4/oxford-circus-station.svg'
import publicWifiThreatsImage from '../assets/case4/public-wifi-threats.svg'

const INTRO_STEPS = [
  {
    label: 'UNIT ZERO HQ - RECEPTION',
    time: 'DAY 1 - 08:42',
    speaker: 'Jane',
    speakerKey: 'jane',
    bubble: 'Morning. Visitor ID, please. Unit Zero does not do mystery guests.',
    intern: 'left',
  },
  {
    label: 'UNIT ZERO HQ - RECEPTION',
    time: 'DAY 1 - 08:43',
    speaker: 'Intern',
    speakerKey: 'intern',
    bubble: 'There you go. I was told to report for my first shift today.',
    intern: 'center',
  },
  {
    label: 'UNIT ZERO HQ - RECEPTION',
    time: 'DAY 1 - 08:44',
    speaker: 'Jane',
    speakerKey: 'jane',
    bubble:
      'Oh, you must be the new intern. Congratulations. Room S109 is down the hall.',
    intern: 'center',
  },
  {
    label: 'UNIT ZERO HQ - RECEPTION',
    time: 'DAY 1 - 08:45',
    speaker: 'Jane',
    speakerKey: 'jane',
    bubble: 'Log into your workstation and read the welcome notes before briefing.',
    intern: 'right',
  },
  {
    label: 'UNIT ZERO HQ - RECEPTION',
    time: 'DAY 1 - 08:46',
    speaker: 'Intern',
    speakerKey: 'intern',
    bubble: 'Thanks, Jane. I will head to S109 now.',
    intern: 'right',
  },
]

const RED_FLAGS = [
  {
    title: 'Spoofed domain',
    text: 'The sender used hr-rewards-unitzero.com, not the official Unit Zero domain.',
  },
  {
    title: 'Artificial urgency',
    text: 'The email pushed a two-hour deadline to rush your decision.',
  },
  {
    title: 'Visual impersonation',
    text: 'The logo and HR wording were copied to look official at a glance.',
  },
  {
    title: 'Credential harvesting',
    text: 'The form asked for personal and employee details a voucher never needs.',
  },
]

const VETERAN_LESSONS = [
  {
    title: 'Display name spoofing',
    text: 'The name shown in an email is not always the real sender.',
  },
  {
    title: 'Domain deception',
    text: 'unitzero.gov.co is not the same as unitzero.gov.com.',
  },
  {
    title: 'Calm can still be dangerous',
    text: 'Sophisticated phishing may avoid panic tactics and obvious errors.',
  },
  {
    title: 'Verify out-of-band',
    text: 'Confirm unexpected requests through a separate trusted channel.',
  },
]

const TRACE_INDICATORS = [
  {
    id: 'display',
    label: 'Display name: Agent Zoey',
    suspicious: false,
    detail: 'A familiar display name alone is not proof of identity.',
  },
  {
    id: 'reply',
    label: 'Reply-To: case-access@unitzero.gov.co',
    suspicious: true,
    detail: 'The reply-to uses a lookalike domain controlled outside Unit Zero.',
  },
  {
    id: 'domain',
    label: 'Link host: secure.unitzero.gov.co',
    suspicious: true,
    detail: 'The registered domain is gov.co, not the Unit Zero gov.com domain.',
  },
  {
    id: 'time',
    label: 'Sent: 16:20, near end of day',
    suspicious: false,
    detail: 'Timing can add pressure, but it is not enough by itself.',
  },
  {
    id: 'source',
    label: 'Source IP reputation: recent credential harvest kit',
    suspicious: true,
    detail: 'Infrastructure reputation links this email to active phishing.',
  },
]

const VETERAN_QUIZ = [
  {
    question: 'Why is agentzoey.a@unitzero.gov not automatically trustworthy?',
    options: [
      'All government-looking emails are unsafe.',
      'The display name and sender can be spoofed or compromised.',
      'Casual wording always proves an email is fake.',
      'Short emails are always phishing.',
    ],
    answer: 1,
  },
  {
    question: 'Which domain is the suspicious lookalike in this case?',
    options: [
      'unitzero.gov.com',
      'mail.unitzero.gov.com',
      'unitzero.gov.co',
      'casefiles.unitzero.gov.com',
    ],
    answer: 2,
  },
  {
    question: 'What should you do before using an unexpected login link?',
    options: [
      'Click quickly before the request expires.',
      'Forward the link to another intern.',
      'Verify through a separate trusted channel.',
      'Trust it if there are no typos.',
    ],
    answer: 2,
  },
  {
    question: 'Why does "no panic tactic" not make the email safe?',
    options: [
      'Only messages with countdowns are dangerous.',
      'Calm emails cannot contain links.',
      'Safe emails always mention rewards.',
      'Professional phishing can sound calm and routine.',
    ],
    answer: 3,
  },
  {
    question: 'What is credential harvesting?',
    options: [
      'Encrypting files after a backup.',
      'Scanning a computer for old documents.',
      'Tricking someone into entering login details into a fake portal.',
      'Sending a security reminder to staff.',
    ],
    answer: 2,
  },
  {
    question: 'Which clue is strongest in the server-log trace?',
    options: [
      'The sender uses a friendly tone.',
      'The email mentions a real project.',
      'A link host on a lookalike domain.',
      'The message is not very long.',
    ],
    answer: 2,
  },
  {
    question: 'What does hovering over a link help reveal?',
    options: [
      'The sender password.',
      'The real destination URL before clicking.',
      'Whether the email has been read.',
      'The exact attacker location.',
    ],
    answer: 1,
  },
  {
    question: 'Why is messaging Agent Zoey directly safer?',
    options: [
      'It deletes the phishing email automatically.',
      'It makes the link expire.',
      'It uses a separate trusted channel to verify the request.',
      'It blocks every future phishing email.',
    ],
    answer: 2,
  },
  {
    question: 'What should happen after credentials are typed into a fake portal?',
    options: [
      'Try the same password again later.',
      'Assume access was confirmed safely.',
      'Ignore it if the page looked official.',
      'Treat it as a breach and report it immediately.',
    ],
    answer: 3,
  },
  {
    question: 'What is the best overall lesson from The Double Bluff?',
    options: [
      'Only typo-filled emails are phishing.',
      'Legitimate-looking requests still need verification.',
      'Supervisors never send links.',
      'A familiar sender name proves the email is safe.',
    ],
    answer: 1,
  },
]

const CASE2_THREADS = [
  {
    id: 'direct-insults',
    title: "Comment chain on Emma's profile",
    source: 'GlowLoop social feed',
    reportId: 'GL-2048-A',
    moment: 'After school, Monday',
    place: "Emma's profile",
    confidence: 61,
    queueNote: 'Forwarded by two students in Emma\'s year.',
    correctAction: 'flag',
    profile: { handle: '@maxbyte', posts: 42, reports: 2, relation: 'classmate' },
    messages: [
      { author: '@maxbyte', time: '15:04', text: 'emma is actually so annoying' },
      { author: '@maxbyte', time: '15:05', text: 'like why is she even here' },
      { author: '@emma.draws', time: '15:06', text: 'can you stop please' },
    ],
    explanation:
      'Direct insults targeting Emma are abusive comments, not normal disagreement.',
  },
  {
    id: 'appearance-mockery',
    title: 'Photo reply pile-on',
    source: 'Photo post replies',
    reportId: 'GL-2048-B',
    moment: 'Evening, Monday',
    place: 'Photo replies',
    confidence: 58,
    queueNote: 'Pulled from comments under Emma\'s latest photo.',
    correctAction: 'flag',
    profile: { handle: '@mirrorfail', posts: 18, reports: 1, relation: 'unknown' },
    messages: [
      { author: '@mirrorfail', time: '19:22', text: 'not the haircut again' },
      { author: '@mirrorfail', time: '19:23', text: 'someone tell her mirrors exist' },
      { author: '@tess88', time: '19:24', text: 'leave her alone' },
    ],
    explanation:
      'Appearance mockery is targeted humiliation. Platforms should treat that as bullying.',
  },
  {
    id: 'repeated-targeting',
    title: 'Replies after Emma joins',
    source: 'GlowLoop replies',
    reportId: 'GL-2048-C',
    moment: 'Tuesday afternoon',
    place: 'Class feed replies',
    confidence: 54,
    queueNote: 'A short burst of replies after Emma joined the thread.',
    correctAction: 'flag',
    profile: { handle: '@crashpost', posts: 103, reports: 3, relation: 'same year group' },
    timeline: ['15:12', '15:19', '15:27', '15:40'],
    messages: [
      { author: '@crashpost', time: '15:12', text: 'not this again' },
      { author: '@crashpost', time: '15:19', text: 'emma always makes it weird' },
      { author: '@crashpost', time: '15:27', text: 'nobody was talking to you' },
      { author: '@crashpost', time: '15:40', text: 'okayyy...' },
    ],
    explanation:
      'Repetition is a key bullying signal. One comment might be conflict; a repeated stream becomes targeting.',
  },
  {
    id: 'group-exclusion',
    title: 'ArtTable group chat',
    source: 'Private group export',
    reportId: 'GL-2048-D',
    moment: 'Across the week',
    place: 'ArtTable chat',
    confidence: 37,
    queueNote: 'Export from a group chat Emma used to be active in.',
    correctAction: 'flag',
    profile: { handle: 'Group: ArtTable', posts: 12, reports: 0, relation: 'friend group' },
    timeline: [
      'Tue 18:42 - Emma: are we still doing the film thing?',
      'Tue 18:44 - Nina: oh nvm',
      'Thu 12:10 - Emma: where did everyone sit?',
      'Thu 12:31 - Kai: we already filled the spots sorry',
      'Sat 19:03 - Emma: invite did not work',
      'Sat 19:04 - Mika: inside joke, do not worry',
      'Mon 16:18 - Emma: is this still the project chat?',
      'Mon 16:52 - seen by 5',
    ],
    messages: [
      { author: '@nina', time: 'Tue 18:41', text: 'movie later?' },
      { author: '@emma.draws', time: 'Tue 18:42', text: 'i can come if there is space' },
      { author: '@nina', time: 'Tue 18:44', text: 'oh nvm' },
      { author: '@kai', time: 'Thu 12:10', text: 'new table today' },
      { author: '@emma.draws', time: 'Thu 12:11', text: 'where?' },
      { author: '@kai', time: 'Thu 12:31', text: 'we already filled the spots sorry' },
      { author: '@mika', time: 'Sat 19:03', text: 'wait who added Emma' },
      { author: '@nina', time: 'Mon 16:52', text: 'seen by 5' },
    ],
    explanation:
      'Passive exclusion can be cyberbullying when it is repeated and coordinated to isolate someone.',
  },
  {
    id: 'plausible-deniability',
    title: 'Short comments from @johnhaha67',
    source: 'Cross-post activity log',
    reportId: 'GL-2048-E',
    moment: 'Mon-Sun',
    place: "Emma's recent posts",
    confidence: 33,
    queueNote: 'Short comments copied from a few of Emma\'s recent posts.',
    correctAction: 'flag',
    profile: { handle: '@johnhaha67', posts: 9, reports: 0, relation: 'follows Emma' },
    timeline: [
      'Mon - Emma posts sketch: @johnhaha67 "lol"',
      'Tue - Emma posts lunch photo: @johnhaha67 "imagine"',
      'Thu - Emma posts homework win: @johnhaha67 "sure Emma"',
      'Fri - Emma posts outfit: @johnhaha67 "interesting timing"',
      'Sun - Emma deletes reply after @johnhaha67 "not this again"',
    ],
    messages: [
      { author: '@johnhaha67', time: 'Mon 20:14', text: 'lol' },
      { author: '@johnhaha67', time: 'Tue 12:03', text: 'imagine' },
      { author: '@johnhaha67', time: 'Thu 18:20', text: 'sure Emma' },
      { author: '@johnhaha67', time: 'Fri 21:09', text: 'interesting timing' },
      { author: '@johnhaha67', time: 'Sun 16:44', text: 'not this again' },
    ],
    explanation:
      '"Just joking" comments can be plausible deniability. The pattern shows repeated targeting.',
  },
  {
    id: 'one-off-disagreement',
    title: 'Debate under a group project post',
    source: 'GlowLoop class feed',
    reportId: 'GL-2048-F',
    moment: 'Wednesday morning',
    place: 'Project post',
    confidence: 46,
    queueNote: 'A classroom thread with a disagreement in the replies.',
    correctAction: 'dismiss',
    profile: { handle: '@rowan7', posts: 27, reports: 0, relation: 'project partner' },
    messages: [
      { author: '@emma.draws', time: '10:11', text: 'i think the poster needs sources first' },
      { author: '@rowan7', time: '10:12', text: 'i disagree, it is fine as it is' },
      { author: '@emma.draws', time: '10:13', text: "okay, let's ask the group" },
    ],
    explanation:
      'A one-off disagreement between equal participants is conflict, not cyberbullying.',
  },
  {
    id: 'consensual-banter',
    title: 'Friends joking after a game',
    source: 'GlowLoop game clip replies',
    reportId: 'GL-2048-G',
    moment: 'Friday night',
    place: 'Game clip replies',
    confidence: 49,
    queueNote: 'A clip from last night\'s game session.',
    correctAction: 'dismiss',
    profile: { handle: '@maya-lol', posts: 64, reports: 0, relation: 'friend' },
    messages: [
      { author: '@emma.draws', time: '21:30', text: 'i cannot believe i missed that easy shot' },
      { author: '@maya-lol', time: '21:31', text: 'legendary fail, but you carried us last round' },
      { author: '@emma.draws', time: '21:31', text: 'fair. i deserve that one' },
    ],
    explanation:
      'Playful banter with consent and friendly context should not be treated as bullying.',
  },
  {
    id: 'constructive-comment',
    title: 'Art club feedback',
    source: 'GlowLoop creative post',
    reportId: 'GL-2048-H',
    moment: 'Sunday afternoon',
    place: 'Art club post',
    confidence: 41,
    queueNote: 'A comment under Emma\'s art club post.',
    correctAction: 'dismiss',
    profile: { handle: '@sketchroom', posts: 88, reports: 0, relation: 'art club' },
    messages: [
      { author: '@sketchroom', time: '17:02', text: 'the color palette is strong' },
      { author: '@sketchroom', time: '17:03', text: 'maybe add contrast around the title so it is easier to read' },
      { author: '@emma.draws', time: '17:05', text: 'good idea, thanks' },
    ],
    explanation:
      'Constructive comments focus on the work and do not target, shame, or repeat harm.',
  },
]

const CASE2_THREAD_IMAGES = {
  'direct-insults': threadImage1,
  'appearance-mockery': threadImage2,
  'repeated-targeting': threadImage3,
  'group-exclusion': threadImage4,
  'plausible-deniability': threadImage5,
  'one-off-disagreement': threadImage6,
  'consensual-banter': threadImage7,
  'constructive-comment': threadImage8,
}

const CASE2_TEACHING_POINTS = [
  {
    title: 'Conflict vs bullying',
    text: 'Bullying often involves repetition, intent, and a power imbalance.',
  },
  {
    title: 'Passive exclusion counts',
    text: 'Repeatedly cutting someone out of chats, plans, and events can cause real harm.',
  },
  {
    title: 'Plausible deniability',
    text: '"Just joking", "lol", and vague comments can hide targeted harassment.',
  },
  {
    title: 'Cumulative harm',
    text: 'Cyberbullying can build through many small hits instead of one obvious attack.',
  },
  {
    title: 'Witness responsibility',
    text: 'Platforms and bystanders can enable bullying by ignoring soft behaviour patterns.',
  },
]

const CASE2_PASS_THRESHOLD = 6
const CASE2_DECISION_REWARD = 10
const CASE2_VETERAN_PASS_THRESHOLD = 5

const CASE2_VETERAN_EVIDENCE = [
  {
    id: 'original-video',
    label: 'Evidence 01',
    title: 'Original video',
    source: 'GlowLoop video post',
    time: 'Day 1 - 16:12',
    handle: '@aaron.codes',
    caption: 'I think the phone policy should give students a say.',
    stat: '32 views - 4 comments',
    body:
      'Aaron gives a calm opinion about a school policy. No target, no insult, no pile-on.',
    severity: 'Normal post',
  },
  {
    id: 'first-reshare',
    label: 'Evidence 02',
    title: 'First reshare',
    source: 'Classmate repost',
    time: 'Day 1 - 18:40',
    handle: '@jayloop',
    caption: 'this kid 💀',
    stat: '214 shares - comments accelerating',
    body:
      'The repost turns Aaron into the joke and gives other people a target.',
    severity: 'Escalation start',
  },
  {
    id: 'viral-spread',
    label: 'Evidence 03',
    title: 'Viral spread',
    source: 'Public trend feed',
    time: 'Day 2 - 09:05',
    handle: '#policykid',
    caption: 'Most replies mock Aaron. A few users tell people to stop.',
    stat: '1.8k comments - 620 reshares',
    body:
      'People who do not know Aaron still add pressure when they join the mockery.',
    severity: 'Scale harm',
  },
  {
    id: 'private-dm',
    label: 'Evidence 04',
    title: 'Private DM screenshot',
    source: 'Screenshot posted publicly',
    time: 'Day 2 - 20:17',
    handle: '@jayloop',
    caption: 'Aaron: "Please make it stop."',
    stat: 'Reposted with laughing emojis',
    body:
      'Aaron asks privately for help. The message is screenshotted and turned into entertainment.',
    severity: 'Worst act',
    critical: true,
  },
  {
    id: 'meme-threads',
    label: 'Evidence 05',
    title: 'Meme threads',
    source: 'Edit and caption posts',
    time: 'Day 3 - 11:32',
    handle: '#policykid edits',
    caption: 'Jokes, captions, edits, and reaction clips keep spreading.',
    stat: 'Hundreds of anonymous contributors',
    body:
      'Meme creators may feel distant from Aaron, but their posts keep the harm alive.',
    severity: 'Distributed harm',
  },
]

const CASE2_VETERAN_JUDGMENTS = [
  {
    id: 'original-video',
    question: 'Is Aaron\'s original video harmful?',
    answer: 'no',
    options: [
      { value: 'yes', label: 'Yes, posting an opinion caused the problem.' },
      { value: 'no', label: 'No, it is harmless criticism of a policy.' },
    ],
    explanation:
      'The original video is not bullying. Aaron expresses an opinion without targeting anyone.',
    correctFeedback:
      'Correct - Aaron posted a harmless opinion about a school policy without targeting anyone.',
    wrongFeedback:
      'Wrong - the pile-on came later. Aaron\'s original video was normal criticism, not bullying.',
  },
  {
    id: 'first-resharer',
    question: 'Is the first resharer responsible for escalation?',
    answer: 'yes',
    options: [
      { value: 'yes', label: 'Yes, the repost frames Aaron as a joke.' },
      { value: 'no', label: 'No, only later commenters are responsible.' },
    ],
    explanation:
      'The first reshare helps turn a normal post into a target for mockery.',
    correctFeedback:
      'Correct - the first reshare helped frame Aaron as a joke and escalated the pile-on.',
    wrongFeedback:
      'Wrong - later commenters matter, but the first reshare still helped start the escalation.',
  },
  {
    id: 'strangers',
    question: 'Are strangers responsible when they join the pile-on?',
    answer: 'yes',
    options: [
      { value: 'yes', label: 'Yes, distance does not remove accountability.' },
      { value: 'no', label: 'No, they do not personally know Aaron.' },
    ],
    explanation:
      'Strangers can still cause real harm. Anonymous distance does not make the impact disappear.',
    correctFeedback:
      'Correct - strangers still add pressure when they join the public mockery.',
    wrongFeedback:
      'Wrong - not knowing Aaron does not remove responsibility for contributing to the pile-on.',
  },
  {
    id: 'meme-creators',
    question: 'Are meme creators responsible for keeping the harm going?',
    answer: 'yes',
    options: [
      { value: 'yes', label: 'Yes, memes can amplify bullying.' },
      { value: 'no', label: 'No, memes are automatically harmless.' },
    ],
    explanation:
      'A meme is not harmless just because it is framed as a joke. It can extend the pile-on.',
    correctFeedback:
      'Correct - meme creators can keep humiliation spreading, even when they call it a joke.',
    wrongFeedback:
      'Wrong - "just a meme" is not an excuse when the meme amplifies bullying.',
  },
  {
    id: 'private-plea',
    question: 'Is sharing Aaron\'s private plea a serious violation?',
    answer: 'yes',
    options: [
      { value: 'yes', label: 'Yes, and it is the cruellest act in the file.' },
      { value: 'no', label: 'No, public jokes are worse than private screenshots.' },
    ],
    explanation:
      'The private screenshot is the worst moment. Aaron reached out for help and someone turned that fear into entertainment.',
    correctFeedback:
      'Correct - sharing Aaron\'s private plea is the cruellest act in the file.',
    wrongFeedback:
      'Wrong - Aaron asked privately for help, and posting that vulnerable moment publicly is the most serious violation.',
    critical: true,
  },
  {
    id: 'bystanders',
    question: 'Did bystanders escalate or de-escalate the situation?',
    answer: 'both',
    options: [
      { value: 'escalate', label: 'They only escalated it.' },
      { value: 'de-escalate', label: 'They only de-escalated it.' },
      { value: 'both', label: 'They could do either, depending on their actions.' },
    ],
    explanation:
      'Bystanders can pile on, share, stay silent, defend, report, or ask people to stop.',
    correctFeedback:
      'Correct - bystanders can escalate with shares or de-escalate by defending, reporting, or refusing to join.',
    wrongFeedback:
      'Wrong - bystanders are not fixed in one role. Their choices can either escalate or reduce the harm.',
  },
]

const CASE2_VETERAN_TEACHING_POINTS = [
  {
    title: 'Viral pile-ons cause harm',
    text: 'Scale changes impact. Hundreds of small jokes can feel like a single attack that never ends.',
  },
  {
    title: 'Strangers are accountable',
    text: 'Not knowing Aaron does not erase responsibility for joining public humiliation.',
  },
  {
    title: 'Private messages stay private',
    text: 'Sharing Aaron\'s plea after he asked for help is a severe violation.',
  },
  {
    title: 'Anonymity is not immunity',
    text: 'Online distance can hide a person from consequences, but it does not remove the harm.',
  },
  {
    title: 'Bystanders change outcomes',
    text: 'A bystander can escalate with a share or de-escalate by defending, reporting, or refusing to join.',
  },
  {
    title: 'Intent does not erase impact',
    text: 'A thousand small actions can crush someone just as much as one big one.',
  },
]

const CASE2_VETERAN_QUIZ = [
  {
    question: 'What makes a viral pile-on harmful?',
    options: [
      'Only one person is involved.',
      'Many people repeatedly target or mock the same person.',
      'The original post always deserves punishment.',
      'It only happens in private chats.',
    ],
    answer: 1,
  },
  {
    question: 'Why can strangers be responsible for Aaron\'s harm?',
    options: [
      'They helped amplify the mockery even without knowing him.',
      'They are responsible only if they go to his school.',
      'They cannot be responsible because they are strangers.',
      'They are responsible only if Aaron replies to them.',
    ],
    answer: 0,
  },
  {
    question: 'Why is sharing Aaron\'s private DM severe?',
    options: [
      'It proves Aaron started the pile-on.',
      'It exposes a vulnerable plea and turns it into entertainment.',
      'It is harmless if the screenshot is funny.',
      'It matters less than public comments.',
    ],
    answer: 1,
  },
  {
    question: 'Why is "just a meme" not always harmless?',
    options: [
      'Memes can extend humiliation and invite more people to join.',
      'All memes are cyberbullying.',
      'Memes only matter if they include a real name.',
      'Memes disappear immediately online.',
    ],
    answer: 0,
  },
  {
    question: 'How can bystanders escalate harm?',
    options: [
      'By reporting the abuse.',
      'By asking others to stop.',
      'By sharing, liking, or adding jokes to the pile-on.',
      'By checking on Aaron privately.',
    ],
    answer: 2,
  },
  {
    question: 'What does impact vs intent mean here?',
    options: [
      'Good intent always cancels harm.',
      'Only the first poster\'s intent matters.',
      'A joke can still hurt when it contributes to a pile-on.',
      'Impact is irrelevant online.',
    ],
    answer: 2,
  },
  {
    question: 'What does online anonymity change?',
    options: [
      'It removes accountability.',
      'It can hide identity, but it does not remove responsibility.',
      'It makes every post harmless.',
      'It means only classmates can bully.',
    ],
    answer: 1,
  },
  {
    question: 'Why does Aaron\'s private plea matter most?',
    options: [
      'It was the moment he needed someone to step in.',
      'It made the original video offensive.',
      'It proved the memes were correct.',
      'It was less important because it was private.',
    ],
    answer: 0,
  },
  {
    question: 'What is the difference between criticism and cyberbullying?',
    options: [
      'Criticism targets an idea; cyberbullying targets and harms a person.',
      'Criticism is always illegal.',
      'Cyberbullying only happens between friends.',
      'There is no difference online.',
    ],
    answer: 0,
  },
  {
    question: 'What is a good way to de-escalate a viral bullying situation?',
    options: [
      'Make a new caption so everyone sees it.',
      'Screenshot private messages for proof of drama.',
      'Refuse to share, report abuse, support the target, and ask others to stop.',
      'Tell the target to ignore everyone.',
    ],
    answer: 2,
  },
]

const CASE3_SOCIAL_ENGINEERING_SIGNS = [
  {
    title: 'Authority impersonation',
    text: '"I am from IT" asks you to trust a role before verifying the person.',
  },
  {
    title: 'Urgency',
    text: '"Before the morning shift" pressures you to act before checking.',
  },
  {
    title: 'Familiarity',
    text: '"You are the new intern, right?" makes the request feel personal and normal.',
  },
  {
    title: 'Helplessness',
    text: '"My badge is not scanning" makes you want to solve the problem for him.',
  },
  {
    title: 'Social pressure',
    text: 'Not wanting to seem rude or unhelpful can push you into skipping verification.',
  },
  {
    title: 'Trusted channels',
    text: 'A supervisor, security desk, or official staff directory is safer than a stranger at the door.',
  },
]

const CASE3_TRAINING_EXAMPLES = [
  'Pretending to be staff',
  'Using authority',
  'Creating urgency',
  'Acting friendly',
  'Making you feel guilty',
  'Applying pressure',
]

const CASE3_KNOWLEDGE_CHECK = [
  {
    question:
      'Someone says: "I am from IT. Your boss said you would help me. I just need your login for a minute." What is this?',
    options: ['Normal teamwork', 'Social engineering', 'A software bug'],
    answer: 1,
    feedback:
      'Correct - they are using authority and pressure to manipulate you into giving access.',
    wrongFeedback:
      'Wrong - an unknown person using IT, your boss, and a rushed login request is social engineering.',
  },
  {
    question: 'Which is the clearest red flag?',
    options: [
      'Urgent request plus unknown person',
      'A calm coworker using their own badge',
      'A scheduled supervisor meeting',
    ],
    answer: 0,
    feedback:
      'Correct - urgency plus an unknown person is a classic pressure tactic.',
    wrongFeedback:
      'Wrong - the danger sign is the urgent request from someone you have not verified.',
  },
  {
    question: 'What should you do if you are unsure?',
    options: [
      'Help quickly so you do not seem rude',
      'Verify through a trusted channel',
      'Give temporary access and report later',
    ],
    answer: 1,
    feedback:
      'Correct - trusted channels let you help without handing access to an attacker.',
    wrongFeedback:
      'Wrong - when access is involved, verify through a trusted channel before helping.',
  },
]

const CASE3_INTRO_DIALOGUE = [
  "Cadet, hacking isn't always about code.",
  'Sometimes the easiest way into a system is through a person.',
  'You have been here for weeks now. You know the office. You know the staff.',
  'And that is exactly when people become vulnerable.',
  'Today, you are the person.',
]

const CASE3_MARK_DIALOGUE = [
  'Hey - you are the new intern, right?',
  'I am Mark. IT support.',
  'My badge is not scanning.',
  'Could you tap yours so I can get in?',
  'I need to fix a server issue before the morning shift.',
]

const CASE3_VETERAN_PASS_SCORE = 5

const CASE3_VETERAN_INTRO = [
  "Cadet, attackers don't always pretend to be strangers.",
  'Sometimes they pretend to be the people you trust most.',
  "Today you're about to learn why verification matters.",
]

const CASE3_VETERAN_VERIFICATION = [
  "I'm not in a briefing.",
  'Harper has been on leave.',
  'Do NOT send anything.',
  'Come to my office.',
]

const CASE3_VETERAN_BREACH = [
  'Harper has been on leave for two weeks.',
  "That wasn't her.",
  "You didn't get hacked.",
  'You got played.',
]

const CASE3_VETERAN_PROFILE_FINDINGS = [
  {
    title: 'Account created yesterday',
    text: 'A real internal staff account should not appear brand new for an established agent.',
  },
  {
    title: 'Job title slightly misspelled',
    text: 'Small profile errors can reveal a fake or hastily created pretext.',
  },
  {
    title: 'No internal contact number',
    text: 'Missing trusted contact details make it harder to verify the request safely.',
  },
]

const CASE3_VETERAN_JUDGMENTS = [
  {
    id: 'strongest-clue',
    question: 'Which clue was the strongest warning sign?',
    options: [
      { value: 'profile', label: 'The profile had a typo.' },
      { value: 'verified-away', label: 'Verification with Zoey revealed Harper was unavailable.' },
      { value: 'professional-tone', label: 'The chat sounded professional.' },
      { value: 'archive-project', label: 'The request mentioned the archive project.' },
    ],
    answer: 'verified-away',
    correctFeedback:
      'Correct - trusted verification proved the request could not really be Harper.',
    wrongFeedback:
      'Wrong - profile clues matter, but Zoey confirming Harper was unavailable is the strongest warning.',
  },
  {
    id: 'tactic',
    question: 'What social engineering tactic was used?',
    options: [
      { value: 'malware', label: 'Malware injection' },
      { value: 'pretexting', label: 'Pretexting' },
      { value: 'brute-force', label: 'Brute forcing' },
      { value: 'encryption', label: 'Encryption' },
    ],
    answer: 'pretexting',
    correctFeedback:
      'Correct - the attacker built a believable story to make the request feel legitimate.',
    wrongFeedback:
      'Wrong - this is pretexting: a false story used to win trust and access.',
  },
  {
    id: 'authority',
    question: 'Why was "Zoey said..." effective?',
    options: [
      { value: 'authority', label: 'It exploited authority.' },
      { value: 'technical', label: 'It proved the request was technical.' },
      { value: 'public', label: 'It made the code public.' },
      { value: 'harmless', label: 'It removed all risk.' },
    ],
    answer: 'authority',
    correctFeedback:
      'Correct - invoking Zoey pressures the intern to obey a trusted authority.',
    wrongFeedback:
      'Wrong - "Zoey said" works because authority can be weaponised.',
  },
  {
    id: 'urgency',
    question: 'Why was "ASAP" included?',
    options: [
      { value: 'formatting', label: 'To match Unit Zero formatting' },
      { value: 'urgency', label: 'To create urgency pressure' },
      { value: 'kindness', label: 'To sound polite' },
      { value: 'backup', label: 'To start a backup process' },
    ],
    answer: 'urgency',
    correctFeedback:
      'Correct - urgency is designed to rush decisions before verification happens.',
    wrongFeedback:
      'Wrong - ASAP is pressure. It tries to make speed feel more important than verification.',
  },
  {
    id: 'access-codes',
    question: 'Why is sharing access codes dangerous?',
    options: [
      { value: 'least-privilege', label: 'It violates least privilege and bypasses controls.' },
      { value: 'slow', label: 'It makes the archive slower.' },
      { value: 'friendly', label: 'It proves you are helpful.' },
      { value: 'temporary', label: 'It is safe if temporary.' },
    ],
    answer: 'least-privilege',
    correctFeedback:
      'Correct - access codes bypass controls and give power to someone who may not be authorised.',
    wrongFeedback:
      'Wrong - sharing access codes breaks least privilege and bypasses security controls.',
  },
  {
    id: 'before-sharing',
    question: 'What should happen before sharing sensitive access information?',
    options: [
      { value: 'trusted-channel', label: 'Verify through a trusted channel.' },
      { value: 'reply-chat', label: 'Reply in the same chat.' },
      { value: 'send-first', label: 'Send first, report later.' },
      { value: 'ask-attacker', label: 'Ask the requester if they are real.' },
    ],
    answer: 'trusted-channel',
    correctFeedback:
      'Correct - use a trusted channel before sharing anything sensitive.',
    wrongFeedback:
      'Wrong - sensitive access information should only move after trusted-channel verification.',
  },
]

const CASE3_VETERAN_TEACHING_POINTS = [
  {
    title: 'Pretexting uses believable stories',
    text: 'The archive project, Harper name, and Zoey reference made the lie feel routine.',
  },
  {
    title: 'Authority can be weaponised',
    text: 'Attackers borrow trusted names to pressure people into compliance.',
  },
  {
    title: 'Urgency pressures bad decisions',
    text: 'ASAP was included to make verification feel like a delay.',
  },
  {
    title: 'Verification defeats social engineering',
    text: 'Calling or messaging Zoey through a trusted channel exposed the pretext.',
  },
  {
    title: 'Never share access codes',
    text: 'Codes are security controls, not chat attachments.',
  },
  {
    title: 'Trust should be verified',
    text: 'Internal names, profile pictures, and professional tone are not proof.',
  },
]

const CASE3_VETERAN_QUIZ = [
  {
    question: 'What is pretexting?',
    options: [
      'Encrypting files for storage',
      'Using a believable false story to gain trust or access',
      'Scanning a network for open ports',
      'Deleting old accounts',
    ],
    answer: 1,
  },
  {
    question: 'Why is an internal-looking message still risky?',
    options: [
      'Internal tools never show names',
      'Attackers can impersonate trusted staff or compromise accounts',
      'Professional tone always means fraud',
      'Only external email can be dangerous',
    ],
    answer: 1,
  },
  {
    question: 'What tactic is used by saying "Zoey said you would help"?',
    options: [
      'Authority exploitation',
      'File compression',
      'Password rotation',
      'Network segmentation',
    ],
    answer: 0,
  },
  {
    question: 'Why do attackers add urgency like "ASAP"?',
    options: [
      'To give the victim time to verify',
      'To pressure fast action before careful checking',
      'To make the message shorter',
      'To prove the request is approved',
    ],
    answer: 1,
  },
  {
    question: 'What is the safest response to a surprise access-code request?',
    options: [
      'Send the code if the profile picture looks right',
      'Verify through a trusted channel before sharing anything',
      'Ask the requester to promise they are staff',
      'Post the code in a group chat',
    ],
    answer: 1,
  },
  {
    question: 'What does least privilege mean here?',
    options: [
      'Give access only to people who are authorised and need it',
      'Give everyone temporary access',
      'Use the shortest access code',
      'Trust anyone from the same department',
    ],
    answer: 0,
  },
  {
    question: 'Which profile clue is suspicious?',
    options: [
      'A verified internal phone number',
      'Account created yesterday',
      'A normal department name',
      'A long employment history',
    ],
    answer: 1,
  },
  {
    question: 'Why is replying in the same suspicious chat not enough?',
    options: [
      'The same channel may be controlled by the attacker',
      'Chats cannot contain text',
      'It always alerts security automatically',
      'It deletes the evidence',
    ],
    answer: 0,
  },
  {
    question: 'What should you report after receiving a suspicious access request?',
    options: [
      'Only the profile picture',
      'The request, account details, and any suspicious clues',
      'Nothing if you did not send the code',
      'Your own password',
    ],
    answer: 1,
  },
  {
    question: 'What is the main lesson of this case?',
    options: [
      'Trust familiar names without question',
      'Verification matters even when the request appears internal',
      'Access codes are safe in private chats',
      'Urgent requests skip normal controls',
    ],
    answer: 1,
  },
]

const CASE4_ROOKIE_INTRO = [
  'Cadet, public Wi-Fi is the Wild West.',
  'No rules. No locks. No guarantees.',
  "Today's lesson: the most dangerous network is usually the one that looks free.",
  "We've received reports of suspicious Wi-Fi activity around Oxford Circus Station.",
  "Head over there and upload the field report. Let's see what catches your eye.",
]

const CASE4_WIFI_NETWORKS = [
  {
    name: 'TFL_WiFi_Official',
    secure: true,
    status: 'Protected network',
  },
  {
    name: 'TFL_WiFi_Free',
    secure: true,
    status: 'Protected network',
  },
  {
    name: 'FREE_TUBE_WIFI_123',
    secure: false,
    status: 'Open network',
  },
  {
    name: 'UnitZero_Guest',
    secure: true,
    status: 'Protected network',
  },
]

const CASE4_FAILURE_DIALOGUE = [
  'Cadet. Someone just attempted to access Unit Zero systems using your credentials.',
  'You connected to a rogue hotspot.',
  "That wasn't TfL Wi-Fi.",
  'It was an attacker.',
]

const CASE4_SUCCESS_DIALOGUE = [
  'Good instincts, Cadet.',
  "We've been tracking a rogue hotspot operator on the Central Line.",
  'You just avoided handing over your entire digital life.',
]

const CASE4_PUBLIC_WIFI_TOPICS = [
  {
    title: 'Rogue Hotspots',
    text: 'Attackers create fake networks with familiar names so people connect by mistake.',
  },
  {
    title: 'Man-in-the-Middle Attacks',
    text: 'On unsafe networks, attackers may sit between you and the service you are using.',
  },
  {
    title: 'Session Hijacking',
    text: 'Stolen session data can let attackers act as you without needing your password.',
  },
  {
    title: 'Credential Harvesting',
    text: 'Fake login pages collect usernames and passwords instead of verifying access.',
  },
]

const CASE4_WIFI_TEACHING_POINTS = [
  {
    title: 'Familiar names create trust',
    text: 'A network name can look official without being official.',
  },
  {
    title: 'People love free Wi-Fi',
    text: 'Attackers know free access makes people lower their guard.',
  },
  {
    title: 'Devices auto-connect',
    text: 'Saved or similar network names can pull devices onto unsafe networks.',
  },
  {
    title: 'Open networks lack protection',
    text: 'No password often means less protection for traffic and identity.',
  },
]

const CASE4_KNOWLEDGE_CHECK = [
  {
    question: 'Which Wi-Fi network is most dangerous?',
    options: [
      'Open network with no password',
      'Password protected network',
      'Mobile hotspot',
    ],
    answer: 0,
    feedback:
      'Correct - open networks are easier for attackers to abuse or imitate.',
    wrongFeedback:
      'Wrong - the most dangerous option is an open network with no password.',
  },
  {
    question: 'A login page appears immediately after connecting to public Wi-Fi. What should you do?',
    options: ['Enter credentials', 'Disconnect immediately', 'Refresh page'],
    answer: 1,
    feedback:
      'Correct - disconnect before entering credentials into an unexpected portal.',
    wrongFeedback:
      'Wrong - an unexpected login portal can be credential harvesting. Disconnect immediately.',
  },
  {
    question: 'What is safest in public?',
    options: ['Free Wi-Fi', 'Mobile hotspot', 'Any network containing "Free"'],
    answer: 1,
    feedback:
      'Correct - your own mobile hotspot is safer than an unknown public network.',
    wrongFeedback:
      'Wrong - in public, a mobile hotspot is safer than unknown free Wi-Fi.',
  },
]

const CASE4_VETERAN_PASS_SCORE = 5

const CASE4_VETERAN_INTRO = [
  {
    speaker: 'Agent Ricky',
    role: 'jane',
    text: 'Cadet, you handled the Tube hotspot. Now we go deeper.',
  },
  {
    speaker: 'Agent Zoey',
    role: 'zoey',
    text: 'This time, you are not choosing a network. You are analysing one.',
  },
  {
    speaker: 'Agent Ricky',
    role: 'jane',
    text: 'A shopping mall reported strange Wi-Fi behaviour. Three networks look almost identical.',
  },
  {
    speaker: 'Agent Zoey',
    role: 'zoey',
    text: 'One of them is listening.',
  },
]

const CASE4_VETERAN_NETWORKS = [
  {
    id: 'mall-guest',
    name: 'Mall_Guest',
    encryption: 'WPA2',
    mac: '7C:21:A1:44:19:02',
    signal: '72% - strongest near information desk',
    traffic: 'Normal browsing pattern with low login bursts',
    deviceNames: 'Device metadata protected by encrypted sessions',
    registry: 'Staff registry: approved guest access point record found',
    malicious: false,
  },
  {
    id: 'mall-guest-5g',
    name: 'Mall_Guest_5G',
    encryption: 'WPA3',
    mac: '7C:21:A1:44:19:05',
    signal: '81% - strongest near customer services',
    traffic: 'Steady checkout and directory traffic',
    deviceNames: 'Client names masked in monitor view',
    registry: 'Staff registry: approved 5G access point record found',
    malicious: false,
  },
  {
    id: 'mall-guest-free',
    name: 'Mall_Guest_Free',
    encryption: 'Open',
    mac: 'Changes detected across scan windows',
    signal: '96% - unusually strong near food court',
    traffic: 'Login bursts at repeated intervals',
    deviceNames: 'Some device names visible in plain text',
    registry: 'Staff registry: no matching approved access point record',
    malicious: true,
  },
]

const CASE4_VETERAN_JUDGMENTS = [
  {
    id: 'malicious-network',
    question: 'Which network is malicious?',
    answer: 'mall-guest-free',
    options: [
      { value: 'mall-guest', label: 'Mall_Guest' },
      { value: 'mall-guest-5g', label: 'Mall_Guest_5G' },
      { value: 'mall-guest-free', label: 'Mall_Guest_Free' },
      { value: 'none', label: 'None of them' },
    ],
    correctFeedback:
      'Correct - Mall_Guest_Free has open encryption, rotating MAC data, login spikes, and plain-text device names.',
    wrongFeedback:
      'Wrong - the malicious network is Mall_Guest_Free because it shows multiple rogue access point indicators.',
  },
  {
    id: 'strongest-clue',
    question: 'Which clue is strongest?',
    answer: 'open-spikes',
    options: [
      { value: 'strong-signal', label: 'It has the strongest signal' },
      { value: 'open-spikes', label: 'No encryption plus traffic spikes during logins' },
      { value: 'similar-name', label: 'The name contains Mall' },
      { value: 'five-g', label: 'It is not a 5G network' },
    ],
    correctFeedback:
      'Correct - open encryption combined with login-time traffic spikes points to credential interception.',
    wrongFeedback:
      'Wrong - signal strength alone is not enough. The strongest clue is no encryption plus login traffic spikes.',
  },
  {
    id: 'mac-spoofing',
    question: 'What does a changing MAC address suggest?',
    answer: 'spoofing',
    options: [
      { value: 'maintenance', label: 'Routine maintenance' },
      { value: 'spoofing', label: 'MAC spoofing or an attacker hiding identity' },
      { value: 'bandwidth', label: 'Better bandwidth' },
      { value: 'battery', label: 'A low-battery access point' },
    ],
    correctFeedback:
      'Correct - rotating hardware identifiers can indicate spoofing or evasion.',
    wrongFeedback:
      'Wrong - a changing MAC address suggests spoofing or an attacker trying to avoid identification.',
  },
  {
    id: 'connect-testing',
    question: 'Why is connecting "for testing" dangerous?',
    answer: 'exposure',
    options: [
      { value: 'faster', label: 'It makes the scan too fast' },
      { value: 'exposure', label: 'It exposes the device to interception and malware delivery' },
      { value: 'battery', label: 'It drains battery' },
      { value: 'legal', label: 'It always breaks the law' },
    ],
    correctFeedback:
      'Correct - connecting can expose the device before you know what the network is doing.',
    wrongFeedback:
      'Wrong - connecting to a suspected rogue network risks interception and fake update malware.',
  },
  {
    id: 'plain-text',
    question: 'What does seeing device names in plain text suggest?',
    answer: 'sniffing',
    options: [
      { value: 'sniffing', label: 'Traffic is not properly protected and may be sniffed' },
      { value: 'official', label: 'The network is definitely official' },
      { value: 'crowded', label: 'The mall is crowded' },
      { value: 'safe', label: 'The network has strong encryption' },
    ],
    correctFeedback:
      'Correct - exposed device names are a warning that traffic or metadata is leaking.',
    wrongFeedback:
      'Wrong - plain-text device names suggest weak protection and possible packet sniffing.',
  },
  {
    id: 'safest-response',
    question: 'What is the safest response?',
    answer: 'flag-report',
    options: [
      { value: 'ignore', label: 'Ignore it until someone complains' },
      { value: 'connect', label: 'Connect to gather proof' },
      { value: 'flag-report', label: 'Flag/report the rogue network and verify with mall or network staff' },
      { value: 'post', label: 'Post the password online' },
    ],
    correctFeedback:
      'Correct - report the rogue network and verify through trusted staff instead of joining it.',
    wrongFeedback:
      'Wrong - the safest response is to flag/report the network and verify with trusted mall or network staff.',
  },
]

const CASE4_VETERAN_TEACHING_POINTS = [
  {
    title: 'Rogue hotspots mimic real networks',
    text: 'Attackers choose names that look official so users trust the wrong access point.',
  },
  {
    title: 'Encryption matters',
    text: 'WPA2 or WPA3 protects traffic better than open networks with no password.',
  },
  {
    title: 'MAC spoofing hides identity',
    text: 'Changing hardware identifiers can help a rogue device avoid simple blocking or tracing.',
  },
  {
    title: 'Packet sniffing watches traffic',
    text: 'Open networks can expose device names, sessions, and login timing to anyone listening.',
  },
  {
    title: 'Fake updates deliver malware',
    text: 'A captive portal or popup can pretend to be a browser update while installing malware.',
  },
  {
    title: 'Do not connect for testing',
    text: 'Use monitoring tools and trusted staff verification instead of placing a protected device on a suspect network.',
  },
]

const CASE4_VETERAN_QUIZ = [
  {
    question: 'Why do rogue hotspots use names similar to real networks?',
    options: [
      'To make users trust and join them',
      'To improve battery life',
      'To encrypt traffic automatically',
      'To reduce signal strength',
    ],
    answer: 0,
  },
  {
    question: 'Which option is usually safer than an open public network?',
    options: ['Any network with Free in the name', 'WPA2 or WPA3 protected Wi-Fi', 'A fake update portal', 'A rotating MAC address'],
    answer: 1,
  },
  {
    question: 'What is MAC spoofing?',
    options: [
      'Changing or faking a device hardware address',
      'Installing a browser update',
      'Making a password longer',
      'Using a phone hotspot',
    ],
    answer: 0,
  },
  {
    question: 'What is packet sniffing?',
    options: [
      'Listening to network traffic as it passes',
      'Turning Wi-Fi off',
      'Buying more bandwidth',
      'Locking a laptop screen',
    ],
    answer: 0,
  },
  {
    question: 'Why is a fake browser update popup dangerous?',
    options: [
      'It may deliver malware',
      'It always improves security',
      'It proves the network is official',
      'It blocks all attackers',
    ],
    answer: 0,
  },
  {
    question: 'Why should you avoid connecting to a suspect network for testing?',
    options: [
      'It can expose your device to interception or malware',
      'It makes the network disappear',
      'It prevents logs from being collected',
      'It makes encryption stronger',
    ],
    answer: 0,
  },
  {
    question: 'How should you verify an official mall network name?',
    options: [
      'Ask trusted mall or network staff',
      'Pick the strongest signal',
      'Choose the network with Free in the name',
      'Install whatever popup appears',
    ],
    answer: 0,
  },
  {
    question: 'Why are login-time traffic spikes suspicious on an open network?',
    options: [
      'They can indicate credential harvesting or interception',
      'They prove the network is safe',
      'They mean the mall is closing',
      'They disable Wi-Fi',
    ],
    answer: 0,
  },
  {
    question: 'What does plain-text device name exposure suggest?',
    options: [
      'The network may be leaking metadata',
      'The network uses perfect encryption',
      'The user has no device',
      'The access point is offline',
    ],
    answer: 0,
  },
  {
    question: 'What should happen when a rogue access point is identified?',
    options: [
      'Flag it, report it, and verify with trusted staff',
      'Ignore it',
      'Connect to see what happens',
      'Share login credentials',
    ],
    answer: 0,
  },
]

function PixelPerson({ role, label, position = '' }) {
  return (
    <div className={`pixel-person pixel-${role} ${position}`}>
      <div className="pixel-hair" />
      <div className="pixel-head">
        <span className="pixel-eye pixel-eye-left" />
        <span className="pixel-eye pixel-eye-right" />
        <span className="pixel-mouth" />
      </div>
      <div className="pixel-torso">
        <span className="pixel-arm pixel-arm-left" />
        <span className="pixel-badge" />
        <span className="pixel-arm pixel-arm-right" />
      </div>
      <div className="pixel-feet">
        <span />
        <span />
      </div>
      <div className="pixel-name">{label}</div>
    </div>
  )
}

function StoryScene({ step, onNext, internName, isLastStep, exiting }) {
  const speakerName = step.speakerKey === 'intern' ? internName : step.speaker

  return (
    <section className="case-scene scene-transition">
      <div className="case-scene-top">
        <span>{step.label}</span>
        <span>{step.time}</span>
      </div>

      <div className={`case-office ${exiting ? 'case-office-exiting' : ''}`}>
        <div className="case-window case-window-left">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="case-window case-window-right">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="unit-poster unit-poster-left">
          UNIT ZERO
          <br />
          CYBER UNIT
        </div>
        <div className="unit-poster unit-poster-right">
          UNIT ZERO
          <br />
          CYBER UNIT
        </div>

        <PixelPerson
          role="intern"
          label={`${internName} - YOU`}
          position={`pixel-intern-${step.intern}`}
        />

        <div className="pixel-desk">
          <PixelPerson role="jane" label="" />
          <div className="desk-front">RECEPTIONIST - JANE</div>
        </div>

        <div className={`case-bubble case-bubble-${step.speakerKey}`}>
          <span className="text-sw-yellow">{speakerName}</span>
          <p>{step.bubble}</p>
        </div>
      </div>

      <button
        type="button"
        className="ss-btn ss-btn-cyan self-end"
        onClick={onNext}
      >
        {isLastStep ? 'Enter Office' : 'Next'} <IconArrowRight size={16} />
      </button>
    </section>
  )
}

function InboxScene({ onNext, internName }) {
  const desktopItems = [
    { label: 'Files', icon: 'folder' },
    { label: 'Chat', icon: 'chat' },
    { label: 'Mail', icon: 'mail' },
    { label: 'Calendar', icon: 'calendar' },
    { label: 'Security', icon: 'security' },
    { label: 'Settings', icon: 'settings' },
  ]

  return (
    <section className="case-terminal ss-card scene-transition">
      <div className="case-terminal-header">
        <span>ROOM S109 - YOUR WORKSTATION</span>
        <span>DAY 1 - 08:52</span>
      </div>

      <div className="case-os-bar">
        <span>UNIT ZERO OS v4.2</span>
        <span>{internName.toLowerCase()}@unitzero.gov - DESKTOP</span>
      </div>

      <h2 className="case-os-welcome">WELCOME, {internName.toUpperCase()}</h2>
      <p className="case-os-subtitle">FIRST DAY ON THE JOB - STAY SHARP.</p>

      <div className="case-desktop-grid">
        {desktopItems.map((item) => (
            <div
              key={item.label}
              className={`case-desktop-tile ${
                item.label === 'Mail' ? 'active' : ''
              }`}
            >
              <span className={`desktop-pixel-icon icon-${item.icon}`} />
              <span>{item.label}</span>
            </div>
          ))}
      </div>

      <div className="jane-message">
        <strong>Jane (message):</strong> Welcome to Unit Zero. Stay sharp -
        nothing here is what it looks like.
      </div>

      <div className="case-inbox-label">INBOX (1 NEW)</div>
      <div className="case-inbox-row active">
        YOUR WELCOME GIFT VOUCHER - CLAIM BEFORE FRIDAY!
      </div>
      <button type="button" className="ss-btn ss-btn-cyan mt-4" onClick={onNext}>
        Open Email
      </button>
    </section>
  )
}

function EmailScene({ onClaim, onReport, internName }) {
  const [secondsLeft, setSecondsLeft] = useState(48 * 60 * 60)

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const hours = String(Math.floor(secondsLeft / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0')
  const seconds = String(secondsLeft % 60).padStart(2, '0')

  return (
    <section className="case-email ss-card scene-transition">
      <div className="voucher-header">
        YOUR WELCOME GIFT VOUCHER - CLAIM BEFORE FRIDAY!
      </div>
      <div className="email-meta">
        <span>From:</span> hr-welcomedesk@unit-zero-benefits.cm
      </div>
      <div className="email-meta">
        <span>To:</span> {internName.toLowerCase()}@unitzero.gov
      </div>
      <div className="fake-hr-stamp">UNIT ZERO HR</div>
      <p>
        Congratulations on joining Unit Zero. As a token of appreciation, we
        have prepared a GBP 50 welcome voucher for you.
      </p>
      <p>Click below to claim it within 48 hours before it expires.</p>
      <div className="voucher-countdown">
        EXPIRES IN: {hours}:{minutes}:{seconds}
      </div>
      <div className="grid grid-cols-1 gap-3">
        <button type="button" className="voucher-claim-btn" onClick={onClaim}>
          Claim Your Voucher <IconArrowRight size={18} />
        </button>
        <button type="button" className="voucher-report-btn" onClick={onReport}>
          Report to supervisor
        </button>
      </div>
      <div className="case-choice-hint">
        Choose: click the voucher or report it
      </div>
    </section>
  )
}

function FakeForm({ onSubmit }) {
  return (
    <section className="case-form ss-card">
      <h2 className="font-pixel text-sw-pink text-sm">Voucher Verification</h2>
      <p className="text-sw-text2">
        Confirm your identity to release your staff reward.
      </p>
      <label>
        Full name
        <input className="ss-input" type="text" />
      </label>
      <label>
        Employee ID
        <input className="ss-input" type="text" />
      </label>
      <label>
        Home address
        <input className="ss-input" type="text" />
      </label>
      <button type="button" className="ss-btn ss-btn-red" onClick={onSubmit}>
        Submit
      </button>
    </section>
  )
}

function GlitchScreen({ onNext }) {
  return (
    <section className="case-glitch ss-card">
      <span className="font-pixel text-sw-red text-sm">REDIRECTING...</span>
      <div className="glitch-bars">
        <span />
        <span />
        <span />
      </div>
      <p>External verification portal loading.</p>
      <button type="button" className="ss-btn ss-btn-pink" onClick={onNext}>
        Continue
      </button>
    </section>
  )
}

function ZoeyBrief({ outcome, onNext }) {
  const isBreach = outcome === 'claim'
  return (
    <section className="case-zoey ss-card scene-transition">
      <div className="agent-avatar">
        <PixelPerson role="zoey" label="AGENT ZOEY" />
      </div>
      <div>
        <h2 className="font-pixel text-sw-cyan text-sm">Agent Zoey</h2>
        <p>
          {isBreach
            ? 'That portal was a phishing trap. The attacker harvested the details you typed into the form.'
            : 'Good call. That voucher was bait. Reporting it kept your details out of the attacker inbox.'}
        </p>
        <button
          type="button"
          className="ss-btn ss-btn-cyan mt-3"
          onClick={onNext}
        >
          Debrief
        </button>
      </div>
    </section>
  )
}

function Debrief({ outcome, onReplay, onContinue, busy }) {
  const isBreach = outcome === 'claim'

  return (
    <section className="case-debrief">
      <div className={isBreach ? 'breach-banner' : 'success-banner'}>
        {isBreach
          ? 'CASE BREACH - DEBRIEF MODE'
          : 'CASE SECURED - DEBRIEF MODE'}
      </div>
      <div className="ss-card p-5 flex flex-col gap-4">
        <div>
          <h2 className="font-pixel text-sw-cyan text-sm">CASE 01: THE BAIT</h2>
          <p className="text-sw-text2">
            {isBreach
              ? 'How you got hooked - 4 red flags you missed'
              : 'Why your report worked - 4 red flags you caught'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {RED_FLAGS.map((flag) => (
            <article key={flag.title} className="red-flag-card">
              <IconFlag size={18} />
              <div>
                <h3>{flag.title}</h3>
                <p>{flag.text}</p>
              </div>
            </article>
          ))}
        </div>

        <blockquote className="zoey-quote">
          "Attackers do not need malware when urgency can make someone hand
          over the keys."
        </blockquote>

        {!isBreach && (
          <div className="badge-card">
            <span>Badge unlocked</span>
            <strong>SHARP EYES</strong>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            className="ss-btn ss-btn-pink"
            onClick={onReplay}
            disabled={busy}
          >
            Replay Scene
          </button>
          <button
            type="button"
            className="ss-btn ss-btn-cyan"
            onClick={onContinue}
            disabled={busy}
          >
            Continue
          </button>
        </div>
      </div>
    </section>
  )
}

function PixelBadgeCard({ badge, pointsAwarded }) {
  if (!badge) return null
  return (
    <div className="case-badge-unlock">
      <div className={`case-badge-icon badge-icon-${badge.icon || 'hook'}`}>
        <span />
      </div>
      <div>
        <span className="case-badge-kicker">Badge Unlocked</span>
        <strong>{badge.name}</strong>
        <p>{badge.message}</p>
        {pointsAwarded > 0 && (
          <span className="case-points-award">+{pointsAwarded} points</span>
        )}
      </div>
    </div>
  )
}

function EndScreen({ badge, pointsAwarded, onReturn, onVeteran }) {
  return (
    <section className="ss-card p-6 flex flex-col gap-4">
      <h2 className="font-pixel text-sw-cyan text-sm">
        Case 01 Rookie Complete
      </h2>
      <p className="text-sw-text2">Case file updated. Rookie reward secured.</p>
      <PixelBadgeCard badge={badge} pointsAwarded={pointsAwarded} />
      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" className="ss-btn ss-btn-cyan" onClick={onReturn}>
          Return to Case Files
        </button>
        <button type="button" className="ss-btn ss-btn-pink" onClick={onVeteran}>
          Continue to Veteran Mode
        </button>
      </div>
    </section>
  )
}

function VeteranInbox({ onNext, internName }) {
  return (
    <section className="case-terminal ss-card scene-transition">
      <div className="case-terminal-header">
        <span>ROOM S109 - YOUR WORKSTATION</span>
        <span>DAY 8 - 16:20</span>
      </div>
      <div className="case-os-bar">
        <span>UNIT ZERO OS v4.2</span>
        <span>{internName.toLowerCase()}@unitzero.gov - CASE DIGITISATION</span>
      </div>
      <h2 className="case-os-welcome">ONE WEEK LATER</h2>
      <p className="case-os-subtitle">
        OLD CASE FILES INDEXED: 73% - ENCRYPTED FOLDER ACCESS PENDING.
      </p>
      <div className="case-desktop-grid">
        {['Archive', 'Scanner', 'Mail', 'Case Logs', 'Chat', 'Security'].map(
          (item) => (
            <div
              key={item}
              className={`case-desktop-tile ${item === 'Mail' ? 'active' : ''}`}
            >
              <span
                className={`desktop-pixel-icon icon-${
                  item === 'Mail' ? 'mail' : item === 'Chat' ? 'chat' : 'folder'
                }`}
              />
              <span>{item}</span>
            </div>
          ),
        )}
      </div>
      <div className="jane-message">
        <strong>System note:</strong> Digitisation project moved to encrypted
        case storage. Supervisor approvals required for new folders.
      </div>
      <div className="case-inbox-label">INBOX (1 NEW)</div>
      <div className="case-inbox-row active">
        Re: Case File Access - Action Required
      </div>
      <button type="button" className="ss-btn ss-btn-cyan mt-4" onClick={onNext}>
        Open Email
      </button>
    </section>
  )
}

function VeteranEmail({ onClickLink, onHoverLink, onMessageZoey, internName }) {
  return (
    <section className="case-email ss-card scene-transition">
      <div className="voucher-header veteran-email-header">
        Re: Case File Access - Action Required
      </div>
      <div className="email-meta">
        <span>From:</span> agentzoey.a@unitzero.gov
      </div>
      <div className="email-meta">
        <span>To:</span> {internName.toLowerCase()}@unitzero.gov
      </div>
      <div className="email-meta">
        <span>Subject:</span> Re: Case File Access - Action Required
      </div>
      <div className="fake-hr-stamp veteran-stamp">UNIT ZERO SECURE FILES</div>
      <p>Hey, I noticed you've been working on the digitisation project.</p>
      <p>
        I'm sharing a secure link to the encrypted case folder. You'll need to
        log in to verify your access level before end of day - the system resets
        at midnight.
      </p>
      <p>Let me know once you're in.</p>
      <div className="veteran-link-preview">
        Secure case folder: secure.unitzero.gov.com/case-access
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button type="button" className="voucher-claim-btn" onClick={onClickLink}>
          Click the link
        </button>
        <button type="button" className="voucher-report-btn" onClick={onHoverLink}>
          Hover over the link
        </button>
        <button type="button" className="voucher-report-btn" onClick={onMessageZoey}>
          Message Agent Zoey
        </button>
      </div>
      <div className="case-choice-hint">
        Choose one of the options to click the link, hover over the link or contact Agent Zoey for confirmation.
      </div>
    </section>
  )
}

function VeteranPortal({ onSubmit }) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    accessCode: '',
  })
  const canSubmit =
    credentials.username.trim() &&
    credentials.password.trim() &&
    credentials.accessCode.trim()

  function updateField(field, value) {
    setCredentials((current) => ({ ...current, [field]: value }))
  }

  return (
    <section className="case-form ss-card scene-transition">
      <h2 className="font-pixel text-sw-pink text-sm">Unit Zero Secure Access</h2>
      <p className="text-sw-text2">
        Verify your clearance to open the encrypted case folder.
      </p>
      <label>
        Unit Zero username
        <input
          className="ss-input"
          type="text"
          value={credentials.username}
          onChange={(event) => updateField('username', event.target.value)}
          placeholder="username"
        />
      </label>
      <label>
        Password
        <input
          className="ss-input"
          type="password"
          value={credentials.password}
          onChange={(event) => updateField('password', event.target.value)}
          placeholder="password"
        />
      </label>
      <label>
        Access code
        <input
          className="ss-input"
          type="text"
          value={credentials.accessCode}
          onChange={(event) => updateField('accessCode', event.target.value)}
          placeholder="access code"
        />
      </label>
      <button
        type="button"
        className="ss-btn ss-btn-red"
        onClick={onSubmit}
        disabled={!canSubmit}
      >
        Verify Access
      </button>
    </section>
  )
}

function AccessConfirmed({ onNext }) {
  return (
    <section className="case-form ss-card scene-transition veteran-access-confirmed">
      <span className="font-pixel text-sw-cyan text-sm">SECURE ACCESS</span>
      <h2 className="font-pixel text-sw-pink text-sm">
        Access confirmed. Thank you.
      </h2>
      <p>
        Your clearance has been verified. The encrypted case folder will sync
        shortly.
      </p>
      <button type="button" className="ss-btn ss-btn-cyan self-start" onClick={onNext}>
        Return to workstation
      </button>
    </section>
  )
}

function OneHourLater({ onNext }) {
  useEffect(() => {
    playSfx('missionBriefing')
  }, [])

  return (
    <section className="case-glitch ss-card scene-transition veteran-time-skip">
      <div className="veteran-clock" aria-hidden="true">
        <span />
      </div>
      <h2 className="font-pixel text-sw-cyan text-sm">1 hour later...</h2>
      <p>Unit Zero internal alerts begin tracing unusual case-folder access.</p>
      <button type="button" className="ss-btn ss-btn-pink" onClick={onNext}>
        Enter Zoey's office
      </button>
    </section>
  )
}

function DomainCheck({ selectedAnswer, onAnswer, onNext, onWrongAnswer }) {
  const answered = selectedAnswer !== null
  const correct = selectedAnswer === 'no'

  function chooseAnswer(answer) {
    onAnswer(answer)
    if (answer === 'yes') onWrongAnswer()
  }

  return (
    <section className="case-email ss-card scene-transition">
      <div className="voucher-header veteran-email-header">LINK INSPECTION</div>
      <p className="text-sw-text2">Hover preview reveals:</p>
      <div className="veteran-domain-display">https://secure.unitzero.gov.co/login</div>
      <h3 className="font-pixel text-sw-cyan text-sm">
        Is this the real Unit Zero website?
      </h3>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          className="ss-btn ss-btn-pink"
          onClick={() => chooseAnswer('yes')}
          disabled={answered}
        >
          Yes
        </button>
        <button
          type="button"
          className="ss-btn ss-btn-cyan"
          onClick={() => chooseAnswer('no')}
          disabled={answered}
        >
          No
        </button>
      </div>
      {answered && (
        <div className={correct ? 'success-banner' : 'breach-banner'}>
          {correct
            ? 'Correct. unitzero.gov.co is a lookalike domain.'
            : 'Not quite. unitzero.gov.co is not the Unit Zero domain.'}
        </div>
      )}
      {answered && (
        <p className="text-sw-text2">
          unitzero.gov.co is not the same as unitzero.gov.com. Attackers register
          close-looking domains so the link feels familiar at a glance.
        </p>
      )}
      {answered && (
        <button type="button" className="ss-btn ss-btn-cyan self-start" onClick={onNext}>
          Continue trace
        </button>
      )}
    </section>
  )
}

function ZoeyOfficeReveal({ route, onNext, internName }) {
  const captured = route === 'captured'

  return (
    <section className="case-scene scene-transition">
      <div className="case-scene-top">
        <span>AGENT ZOEY'S OFFICE</span>
        <span>DAY 8 - 17:25</span>
      </div>

      <div className="case-office veteran-office">
        <div className="case-window case-window-left">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="unit-poster unit-poster-right">
          UNIT ZERO
          <br />
          INCIDENT ROOM
        </div>

        <PixelPerson
          role="intern"
          label={`${internName} - YOU`}
          position="pixel-intern-left"
        />
        <div className="veteran-zoey-real">
          <PixelPerson role="zoey" label="REAL ZOEY" />
        </div>
        {captured && (
          <div className="veteran-fake-zoey-terminal">
            <div className="veteran-fake-screen">agentzoey.a</div>
            <div className="veteran-fake-caption">EMAIL IMPOSTOR</div>
          </div>
        )}

        <div className="case-bubble case-bubble-jane veteran-zoey-bubble">
          <span className="text-sw-yellow">Agent Zoey</span>
          {captured ? (
            <p>
              I did not send that login request. The portal confirmation was the
              trap closing.
            </p>
          ) : route === 'hover' ? (
            <p>
              You paused before clicking and found the lookalike domain. That
              gave us a clean lead.
            </p>
          ) : (
            <p>
              I did not send that email. Verifying directly kept the attacker
              out of your account.
            </p>
          )}
        </div>
      </div>

      <blockquote className="zoey-quote">
        "This one was designed by professionals, Cadet. You weren't careless -
        you were targeted. That's the difference between a rookie mistake and a
        real threat. Now we have a problem to fix."
      </blockquote>

      <button
        type="button"
        className="ss-btn ss-btn-cyan self-end"
        onClick={onNext}
      >
        Trace the attack <IconArrowRight size={16} />
      </button>
    </section>
  )
}

function TracePuzzle({ selected, onToggle, onSubmit, submitted }) {
  const selectedSet = new Set(selected)
  const correctCount = TRACE_INDICATORS.filter(
    (item) => item.suspicious && selectedSet.has(item.id),
  ).length
  const falsePositives = TRACE_INDICATORS.filter(
    (item) => !item.suspicious && selectedSet.has(item.id),
  ).length
  const passed = correctCount === 3 && falsePositives === 0
  const ready = selected.length === 3

  return (
    <section className="case-terminal ss-card scene-transition">
      <div className="case-terminal-header">
        <span>AGENT ZOEY - TRACE DESK</span>
        <span>INDICATORS OF COMPROMISE</span>
      </div>
      <h2 className="font-pixel text-sw-cyan text-sm">
        Trace the phishing attempt
      </h2>
      <p className="text-sw-text2">
        Zoey has pulled five log fragments from the email gateway. Select the
        three technical indicators that prove this was a phishing attack, then
        submit your trace report.
      </p>
      <div className="veteran-trace-status">
        Selected {selected.length}/3 indicators
      </div>
      <div className="veteran-log-list">
        {TRACE_INDICATORS.map((item) => {
          const selectedItem = selectedSet.has(item.id)
          const rowState = submitted
            ? item.suspicious
              ? selectedItem
                ? 'veteran-log-row-correct'
                : 'veteran-log-row-missed'
              : selectedItem
                ? 'veteran-log-row-decoy'
                : 'veteran-log-row-neutral'
            : ''

          return (
            <button
              key={item.id}
              type="button"
              className={`veteran-log-row ${
                selectedItem ? 'veteran-log-row-selected' : ''
              } ${rowState}`}
              onClick={() => onToggle(item.id)}
              disabled={submitted}
            >
              <span>{item.label}</span>
              {submitted && (
                <small>
                  {item.suspicious
                    ? selectedItem
                      ? 'Confirmed IOC: '
                      : 'Missed IOC: '
                    : selectedItem
                      ? 'Decoy selected: '
                      : 'Context only: '}
                  {item.detail}
                </small>
              )}
            </button>
          )
        })}
      </div>
      {submitted && (
        <div className={passed ? 'success-banner' : 'breach-banner'}>
          {passed
            ? 'Trace complete. The reply-to, link host, and source reputation identify the attack path.'
            : 'Trace reviewed. Zoey marks the true IOCs before the final certification.'}
        </div>
      )}
      {submitted && (
        <p className="text-sw-text2">
          The useful evidence is technical: where replies go, where the link
          actually lands, and what the sending infrastructure has done before.
          Familiar names and convenient timing can mislead you, but they do not
          prove the attack on their own.
        </p>
      )}
      <button
        type="button"
        className="ss-btn ss-btn-cyan self-start"
        onClick={onSubmit}
        disabled={!submitted && !ready}
      >
        {submitted ? 'Begin final certification' : 'Submit trace report'}
      </button>
    </section>
  )
}

function VeteranQuiz({
  answers,
  currentQuestionIndex,
  onAnswer,
  onNextQuestion,
  onSubmit,
  submitted,
}) {
  const correct = answers.reduce(
    (count, answer, index) => count + (answer === VETERAN_QUIZ[index].answer ? 1 : 0),
    0,
  )
  const currentQuestion = VETERAN_QUIZ[currentQuestionIndex]
  const selectedAnswer = answers[currentQuestionIndex]
  const answered = selectedAnswer !== null
  const selectedCorrect = selectedAnswer === currentQuestion.answer
  const isLastQuestion = currentQuestionIndex === VETERAN_QUIZ.length - 1
  const passed = correct >= 5

  return (
    <section className="case-debrief scene-transition">
      <div className="success-banner">FINAL CERTIFICATION - PHISHING FIELD GUIDE</div>
      <div className="ss-card p-5 flex flex-col gap-4">
        <h2 className="font-pixel text-sw-cyan text-sm">
          Case 01 final debrief
        </h2>
        <p className="text-sw-text2">
          This wraps the Rookie bait email and the Veteran double bluff. Each
          correct answer is worth 10 coins. Passing requires 5 or more correct
          answers and closes the phishing case arc.
        </p>
        {!submitted ? (
          <>
            <div className="veteran-quiz-progress">
              Question {currentQuestionIndex + 1} / {VETERAN_QUIZ.length}
            </div>
            <article
              className={`veteran-quiz-card veteran-quiz-focus ${
                answered && !selectedCorrect ? 'veteran-quiz-shake' : ''
              }`}
            >
              <h3>{currentQuestion.question}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentQuestion.options.map((option, optionIndex) => {
                  const selected = selectedAnswer === optionIndex
                  const isCorrect = currentQuestion.answer === optionIndex
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`veteran-answer-btn ${
                        selected ? 'veteran-answer-selected' : ''
                      } ${
                        answered && isCorrect ? 'veteran-answer-correct' : ''
                      } ${
                        answered && selected && !isCorrect
                          ? 'veteran-answer-wrong'
                          : ''
                      }`}
                      onClick={() => onAnswer(currentQuestionIndex, optionIndex)}
                      disabled={answered}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </article>
            {answered && (
              <div className={selectedCorrect ? 'success-banner' : 'breach-banner'}>
                {selectedCorrect
                  ? 'Correct. +10 quiz coins secured.'
                  : `Not this time. Correct answer: ${
                      currentQuestion.options[currentQuestion.answer]
                    }`}
              </div>
            )}
            {answered && (
              <button
                type="button"
                className="ss-btn ss-btn-cyan self-start"
                onClick={isLastQuestion ? onSubmit : onNextQuestion}
              >
                {isLastQuestion ? 'View results' : 'Next Question'}
              </button>
            )}
          </>
        ) : (
          <>
            <div className={passed ? 'success-banner' : 'breach-banner'}>
              {passed ? 'Certification passed' : 'Certification failed'}
            </div>
            <div className="veteran-results-grid">
              <div>
                <span>Correct</span>
                <strong>{correct} / 10</strong>
              </div>
              <div>
                <span>Quiz coins</span>
                <strong>{correct * 10}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{passed ? 'Replay optional' : 'Replay required'}</strong>
              </div>
            </div>
            <p className="text-sw-text2">
              {passed
                ? 'You have enough field evidence and quiz score to close the Veteran phishing case.'
                : 'More than half the answers were missed. Replay the Veteran level before this case can close.'}
            </p>
            <button
              type="button"
              className="ss-btn ss-btn-cyan self-start"
              onClick={onSubmit}
            >
              Continue debrief
            </button>
          </>
        )}
      </div>
    </section>
  )
}

function VeteranDebrief({
  route,
  quizCorrect,
  quizSubmitted,
  onReplay,
  onContinue,
  busy,
}) {
  const passed = quizSubmitted && quizCorrect >= 5
  const failedRoute = route === 'captured'
  const fieldFailed = route === 'fieldFailed'
  const quizFailed = route === 'quizFailed'

  return (
    <section className="case-debrief">
      <div className={passed && !failedRoute && !fieldFailed && !quizFailed ? 'success-banner' : 'breach-banner'}>
        {passed && !failedRoute && !fieldFailed && !quizFailed
          ? 'CASE 01 VETERAN SECURED'
          : failedRoute
            ? 'CREDENTIAL CAPTURE - REPLAY REQUIRED'
            : fieldFailed
              ? 'FIELD TRACE FAILED - REPLAY REQUIRED'
              : quizFailed
                ? 'FINAL QUIZ FAILED - REPLAY REQUIRED'
                : 'FIELD CHECK FAILED - REPLAY REQUIRED'}
      </div>
      <div className="ss-card p-5 flex flex-col gap-4">
        <div>
          <h2 className="font-pixel text-sw-cyan text-sm">
            CASE 01 VETERAN: THE DOUBLE BLUFF
          </h2>
          <p className="text-sw-text2">
            {passed && !failedRoute && !fieldFailed && !quizFailed
              ? 'You verified the request, traced the infrastructure, and passed the field check.'
              : fieldFailed
                ? 'The trace report missed the attack path. Review the indicators before retrying the Veteran investigation.'
                : quizFailed
                  ? 'The final certification score was below 50%. Replay is required before the Veteran case can close.'
                  : 'Review the professional phishing indicators before retrying the Veteran case.'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {VETERAN_LESSONS.map((lesson) => (
            <article key={lesson.title} className="red-flag-card">
              <IconFlag size={18} />
              <div>
                <h3>{lesson.title}</h3>
                <p>{lesson.text}</p>
              </div>
            </article>
          ))}
        </div>
        {passed && !failedRoute && !fieldFailed && !quizFailed && (
          <>
            <div className="badge-card">
              <span>Badge unlocked</span>
              <strong>BURNED TWICE, WISER ONCE</strong>
            </div>
            <div className="badge-card">
              <span>Field guide unlocked</span>
              <strong>PHISHING FIELD GUIDE</strong>
            </div>
          </>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            className="ss-btn ss-btn-pink"
            onClick={onReplay}
            disabled={busy}
          >
            Replay Scene
          </button>
          <button
            type="button"
            className="ss-btn ss-btn-cyan"
            onClick={onContinue}
            disabled={busy}
          >
            Continue to Case Files
          </button>
        </div>
      </div>
    </section>
  )
}

function VeteranEndScreen({ badge, pointsAwarded, quizCorrect, onReturn, onReplay }) {
  return (
    <section className="ss-card p-6 flex flex-col gap-4">
      <h2 className="font-pixel text-sw-cyan text-sm">
        Case 01 Veteran Complete
      </h2>
      <p className="text-sw-text2">
        The Double Bluff closed. Quiz score: {quizCorrect}/10.
      </p>
      <PixelBadgeCard badge={badge} pointsAwarded={pointsAwarded} />
      <div className="badge-card">
        <span>Reference unlock</span>
        <strong>PHISHING FIELD GUIDE</strong>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" className="ss-btn ss-btn-cyan" onClick={onReturn}>
          Return to Case Files
        </button>
        <button type="button" className="ss-btn ss-btn-pink" onClick={onReplay}>
          Replay Veteran
        </button>
      </div>
    </section>
  )
}

function VeteranCase() {
  const navigate = useNavigate()
  const { user, token, setUser } = useAuth()
  const [phase, setPhase] = useState('inbox')
  const [route, setRoute] = useState(null)
  const [domainAnswer, setDomainAnswer] = useState(null)
  const [traceSelected, setTraceSelected] = useState([])
  const [traceSubmitted, setTraceSubmitted] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState(
    () => VETERAN_QUIZ.map(() => null),
  )
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [badge, setBadge] = useState(null)
  const [pointsAwarded, setPointsAwarded] = useState(0)
  const [progressError, setProgressError] = useState('')
  const [resolvingDebrief, setResolvingDebrief] = useState(false)
  const resolvingRef = useRef(false)
  const internName = user?.username || 'Nova'
  const quizCorrect = quizAnswers.reduce(
    (count, answer, index) => count + (answer === VETERAN_QUIZ[index].answer ? 1 : 0),
    0,
  )
  const failedOutcome =
    route === 'captured' || route === 'fieldFailed' || route === 'quizFailed'
  const passedVeteran = !failedOutcome && quizSubmitted && quizCorrect >= 5

  function restart() {
    setPhase('inbox')
    setRoute(null)
    setDomainAnswer(null)
    setTraceSelected([])
    setTraceSubmitted(false)
    setQuizAnswers(VETERAN_QUIZ.map(() => null))
    setCurrentQuizQuestion(0)
    setQuizSubmitted(false)
    setBadge(null)
    setPointsAwarded(0)
    setProgressError('')
    setResolvingDebrief(false)
    resolvingRef.current = false
  }

  async function spendFailureLife(nextAction) {
    if (resolvingRef.current) return
    resolvingRef.current = true
    setResolvingDebrief(true)
    setProgressError('')
    try {
      const data = await api.failAttempt(token, {
        caseId: 1,
        difficulty: 'veteran',
      })
      setUser(data.user)
      playSfx('lifeLost')
      playSfx('caseFailed')
      if (nextAction === 'replay') {
        restart()
        return
      }
      navigate('/play')
    } catch (error) {
      console.error('[progress] Veteran failed attempt update failed', {
        endpoint: '/progress/fail-attempt',
        caseId: 1,
        difficulty: 'veteran',
        message: error.message,
      })
      setProgressError(error.message || 'Could not update lives.')
      resolvingRef.current = false
      setResolvingDebrief(false)
    }
  }

  async function finishVeteran(nextAction = 'end') {
    if (!passedVeteran) {
      if (failedOutcome) spendFailureLife('replay')
      else restart()
      return
    }
    if (resolvingRef.current) return
    resolvingRef.current = true
    setResolvingDebrief(true)
    setProgressError('')
    try {
      const unlockedBadge = BADGES.burnedTwice
      const data = await api.completeCase(token, {
        caseId: 1,
        difficulty: 'veteran',
        result: 'success',
        badge: unlockedBadge,
        bonusPoints: quizCorrect * 10,
      })
      setUser(data.user)
      setBadge(unlockedBadge)
      setPointsAwarded(data.pointsAwarded)
      if (data.pointsAwarded > 0) {
        playSfx('coins')
        playSfx('badge')
      }
      playSfx('caseComplete')
      if (nextAction === 'caseFiles') {
        navigate('/play')
        return
      }
      setPhase('end')
    } catch (error) {
      console.error('[progress] Veteran completion update failed', {
        endpoint: '/progress/complete-case',
        caseId: 1,
        difficulty: 'veteran',
        message: error.message,
      })
      setProgressError(error.message || 'Could not update case progress.')
    } finally {
      resolvingRef.current = false
      setResolvingDebrief(false)
    }
  }

  function toggleTrace(id) {
    setTraceSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  function submitTrace() {
    if (!traceSubmitted) {
      setTraceSubmitted(true)
      return
    }
    setPhase('quiz')
  }

  function answerQuiz(questionIndex, optionIndex) {
    if (quizAnswers[questionIndex] !== null) return
    setQuizAnswers((current) =>
      current.map((answer, index) =>
        index === questionIndex ? optionIndex : answer,
      ),
    )
    playSfx(
      optionIndex === VETERAN_QUIZ[questionIndex].answer ? 'correct' : 'wrong',
    )
  }

  function nextQuizQuestion() {
    setCurrentQuizQuestion((value) =>
      Math.min(value + 1, VETERAN_QUIZ.length - 1),
    )
  }

  function submitQuiz() {
    if (!quizSubmitted) {
      setQuizSubmitted(true)
      return
    }
    if (quizCorrect < 5) setRoute('quizFailed')
    setPhase('debrief')
  }

  return (
    <div className="case-shell max-w-5xl mx-auto">
      <div className="case-title-row">
        <div>
          <span className="font-pixel text-sw-pink text-xs">CASE 01 VETERAN</span>
          <h2 className="font-pixel text-sw-cyan text-sm md:text-base">
            The Double Bluff
          </h2>
        </div>
      </div>
      {progressError && (
        <div className="ss-card p-3 text-sw-red text-sm">{progressError}</div>
      )}

      {phase === 'inbox' && (
        <VeteranInbox
          internName={internName}
          onNext={() => setPhase('email')}
        />
      )}
      {phase === 'email' && (
        <VeteranEmail
          internName={internName}
          onClickLink={() => setPhase('portal')}
          onHoverLink={() => {
            setRoute('hover')
            setPhase('domain')
          }}
          onMessageZoey={() => {
            setRoute('message')
            setPhase('timeSkip')
          }}
        />
      )}
      {phase === 'portal' && (
        <VeteranPortal
          onSubmit={() => {
            setRoute('captured')
            setPhase('accessConfirmed')
          }}
        />
      )}
      {phase === 'accessConfirmed' && (
        <AccessConfirmed onNext={() => setPhase('timeSkip')} />
      )}
      {phase === 'timeSkip' && (
        <OneHourLater onNext={() => setPhase('zoey')} />
      )}
      {phase === 'domain' && (
        <DomainCheck
          selectedAnswer={domainAnswer}
          onAnswer={setDomainAnswer}
          onWrongAnswer={() => {
            setRoute('captured')
            setPhase('portal')
          }}
          onNext={() => setPhase('timeSkip')}
        />
      )}
      {phase === 'zoey' && (
        <ZoeyOfficeReveal
          route={route}
          internName={internName}
          onNext={() => setPhase('trace')}
        />
      )}
      {phase === 'trace' && (
        <TracePuzzle
          selected={traceSelected}
          onToggle={toggleTrace}
          onSubmit={submitTrace}
          submitted={traceSubmitted}
        />
      )}
      {phase === 'quiz' && (
        <VeteranQuiz
          answers={quizAnswers}
          currentQuestionIndex={currentQuizQuestion}
          onAnswer={answerQuiz}
          onNextQuestion={nextQuizQuestion}
          onSubmit={submitQuiz}
          submitted={quizSubmitted}
        />
      )}
      {phase === 'debrief' && (
        <VeteranDebrief
          route={route}
          quizCorrect={quizCorrect}
          quizSubmitted={quizSubmitted}
          onReplay={
            passedVeteran || !failedOutcome
              ? restart
              : () => spendFailureLife('replay')
          }
          onContinue={
            passedVeteran
              ? () => finishVeteran('caseFiles')
              : failedOutcome
                ? () => spendFailureLife('continue')
                : () => navigate('/play')
          }
          busy={resolvingDebrief}
        />
      )}
      {phase === 'end' && (
        <VeteranEndScreen
          badge={badge}
          pointsAwarded={pointsAwarded}
          quizCorrect={quizCorrect}
          onReturn={() => navigate('/play')}
          onReplay={restart}
        />
      )}
    </div>
  )
}

function Case2Intro({ internName, onNext }) {
  const briefingText =
    'Emma sent over a quiet note after a week on GlowLoop. It does not look dramatic: comments, group chats, a few deleted replies.'
  const [typedBriefing, setTypedBriefing] = useState('')
  const briefingComplete = typedBriefing.length === briefingText.length

  useEffect(() => {
    setTypedBriefing('')
    let index = 0
    const typingTimer = window.setInterval(() => {
      index += 1
      setTypedBriefing(briefingText.slice(0, index))
      if (index >= briefingText.length) {
        window.clearInterval(typingTimer)
      }
    }, 24)

    return () => window.clearInterval(typingTimer)
  }, [briefingText])

  return (
    <section className="case-terminal ss-card scene-transition">
      <div className="case-terminal-header">
        <span>UNIT ZERO</span>
        <span>DAY 14 - 09:18</span>
      </div>
      <div className="case-os-bar">
        <span>ROOKIE CASE - SOCIAL THREADS</span>
        <span>{internName.toLowerCase()}@unitzero.gov - ACTIVE</span>
      </div>
      <div className="case2-intro-grid">
        <div className="case2-social-stack" aria-hidden="true">
          <div className="case2-ambient-comment ambient-one">@nina: oh nvm</div>
          <div className="case2-ambient-comment ambient-two">seen by 5</div>
          <div className="case2-ambient-comment ambient-three">@mika: inside joke</div>
          <div className="case2-network-lines">
            <span className="node node-a" />
            <span className="node node-b" />
            <span className="node node-c" />
            <span className="line line-a" />
            <span className="line line-b" />
          </div>
          <div className="case2-profile-mini">
            <span className="case2-avatar-dot">EM</span>
            <div>
              <strong>@emma.draws</strong>
              <span>quiet report</span>
            </div>
          </div>
          <div className="case2-notification-bubble bubble-one">new reply</div>
          <div className="case2-notification-bubble bubble-two">mentioned</div>
          <div className="case2-phone-frame">
            <span className="case2-phone-notch" />
            <div className="case2-phone-header">
              <span className="case2-avatar-dot">EM</span>
              <div>
                <strong>@emma.draws</strong>
                <span>profile</span>
              </div>
            </div>
            <div className="case2-post-card case2-floating-comment">
              <strong>@emma.draws</strong>
              <p>did everyone leave the old chat?</p>
              <span className="case2-post-meta">sent 18:42</span>
              <div className="case2-reaction-row">
                <span>0 likes</span>
                <span>5 seen</span>
              </div>
            </div>
            <div className="case2-post-card muted case2-floating-comment">
              <strong>@johnhaha67</strong>
              <p>lol</p>
              <span className="case2-post-meta">1 reply</span>
              <div className="case2-reaction-row">
                <span>3 likes</span>
                <span>reply</span>
              </div>
            </div>
            <div className="case2-typing-row">
              <span />
              <span />
              <span />
            </div>
            <div className="case2-feed-fragment fragment-one">seen by 5</div>
            <div className="case2-feed-fragment fragment-two">reply deleted</div>
            <div className="case2-glitch-strip strip-one" />
            <div className="case2-glitch-strip strip-two" />
          </div>
        </div>
        <div className="case2-ricky-panel">
          <span className="font-pixel text-sw-yellow text-xs">AGENT RICKY</span>
          <h2 className="font-pixel text-sw-cyan text-sm">The Network: Just Jokes</h2>
          <p className="case2-briefing-type" aria-live="polite">
            {typedBriefing}
            <span className="case2-briefing-cursor" aria-hidden="true" />
          </p>
          <p className="text-sw-text3">
            Read each thread, then decide. Some are normal awkward moments.
            Some are not.
          </p>
          <button
            type="button"
            className={`ss-btn ss-btn-cyan self-start case2-start-btn ${
              briefingComplete ? 'ready' : ''
            }`}
            onClick={onNext}
          >
            Start Reading <IconArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}

function Case2QueueList({ activeIndex, decisions, onOpen }) {
  return (
    <aside className="case2-queue-panel">
      <div className="case2-queue-title">
        <span>THREADS</span>
        <strong>{CASE2_THREADS.length}</strong>
      </div>
      {CASE2_THREADS.map((thread, index) => (
        <button
          key={thread.id}
          type="button"
          className={`case2-queue-item ${index === activeIndex ? 'active' : ''} ${
            decisions[thread.id] ? 'resolved' : ''
          }`}
          onClick={() => onOpen(index)}
        >
          <span>{thread.moment}</span>
          <strong>{thread.place}</strong>
          <em>{decisions[thread.id] ? decisions[thread.id] : 'unread'}</em>
        </button>
      ))}
    </aside>
  )
}

function Case2ThreadPreview({ thread }) {
  const previewCopy = {
    'direct-insults': {
      label: 'Profile post',
      title: '@emma.draws',
      caption: 'new sketch later if i finish homework',
      meta: '5 seen - 0 likes',
    },
    'appearance-mockery': {
      label: 'Photo post',
      title: '@emma.draws',
      caption: 'trying something different today',
      meta: 'photo replies open',
    },
    'repeated-targeting': {
      label: 'Class feed',
      title: 'Year 9 chat',
      caption: 'planning table groups for tomorrow',
      meta: '12 replies',
    },
    'group-exclusion': {
      label: 'Group chat',
      title: 'ArtTable',
      caption: 'movie later? new table today',
      meta: 'seen by 5',
    },
    'plausible-deniability': {
      label: 'Recent posts',
      title: '@johnhaha67 replies',
      caption: 'lol / imagine / sure Emma',
      meta: 'repeated across posts',
    },
    'one-off-disagreement': {
      label: 'Project post',
      title: 'Group project',
      caption: 'poster draft: sources and layout',
      meta: '3 comments',
    },
    'consensual-banter': {
      label: 'Game clip',
      title: 'Friday lobby',
      caption: 'missed shot, won the round',
      meta: 'friends replying',
    },
    'constructive-comment': {
      label: 'Art club',
      title: '@emma.draws',
      caption: 'poster concept feedback',
      meta: 'art club thread',
    },
  }
  const copy = previewCopy[thread.id] || previewCopy['direct-insults']
  const threadImage = CASE2_THREAD_IMAGES[thread.id]
  const previewInitials = copy.title
    .replace('@', '')
    .split(/\s|-/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className={`case2-thread-preview preview-${thread.id}`} aria-hidden="true">
      <div className="case2-preview-topline">
        <span>{copy.label}</span>
        <span>{thread.moment}</span>
      </div>
      <div className="case2-preview-body">
        <div className="case2-preview-avatar">{previewInitials}</div>
        <div className="case2-preview-main">
          <div className="case2-preview-post-header">
            <strong>{copy.title}</strong>
            <span>{copy.label}</span>
          </div>
          <div className="case2-preview-art">
            {threadImage && (
              <img className="case2-preview-image" src={threadImage} alt="" />
            )}
          </div>
          <p className="case2-preview-caption">{copy.caption}</p>
          <div className="case2-preview-reactions">
            <span className="reaction-icon">like</span>
            <span className="reaction-icon">reply</span>
            <span>{copy.meta}</span>
          </div>
        </div>
      </div>
      <div className="case2-preview-glitch">
        <span />
        <span />
      </div>
    </div>
  )
}

function Case2ThreadFile({
  thread,
  index,
  total,
  decision,
  processing,
  onDecision,
  onNext,
}) {
  const canAdvance = Boolean(decision) && !processing

  return (
    <article className="case2-file scene-transition">
      <div className="case2-file-top">
        <div>
          <span className="font-pixel text-sw-pink text-xs">
            THREAD {index + 1} OF {total}
          </span>
          <h3>{thread.title}</h3>
          <p>{thread.moment} - {thread.source}</p>
        </div>
      </div>

      <div className="case2-file-grid">
        <section className="case2-social-window">
          <div className="case2-social-window-bar">
            <span>GlowLoop</span>
            <span>{thread.place}</span>
          </div>
          <Case2ThreadPreview thread={thread} />
          <div className="case2-comments-label">comments</div>
          <div className="case2-message-list case2-message-focus">
            {thread.messages.map((message, messageIndex) => (
              <div
                key={`${thread.id}-${messageIndex}`}
                className="case2-message case2-post-message"
              >
                <div className="case2-avatar" aria-hidden="true">
                  {message.author.slice(1, 3).toUpperCase()}
                </div>
                <div>
                  <strong>{message.author}</strong>
                  <p>{message.text}</p>
                  {message.time && <em>{message.time}</em>}
                  <div className="case2-message-social">
                    <span>{message.likes ?? messageIndex + 1} likes</span>
                    <span>{message.replies ?? 0} replies</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="case2-action-console">
        <div className="case2-decision-row" role="group" aria-label={`${thread.title} decision`}>
          <button
            type="button"
            className={`case2-decision-btn case2-flag-btn ${
              decision === 'flag' ? 'selected' : ''
            }`}
            onClick={() => onDecision(thread.id, 'flag')}
            disabled={processing || Boolean(decision)}
          >
            FLAG
          </button>
          <button
            type="button"
            className={`case2-decision-btn case2-dismiss-btn ${
              decision === 'dismiss' ? 'selected' : ''
            }`}
            onClick={() => onDecision(thread.id, 'dismiss')}
            disabled={processing || Boolean(decision)}
          >
            DISMISS
          </button>
        </div>
        <button
          type="button"
          className="ss-btn ss-btn-cyan"
          onClick={onNext}
          disabled={!canAdvance}
        >
          {index === total - 1 ? 'Submit' : 'Next Thread'} <IconArrowRight size={16} />
        </button>
      </div>
    </article>
  )
}

function Case2ReviewBoard({
  decisions,
  activeIndex,
  processing,
  onOpen,
  onDecision,
  onNext,
}) {
  const answeredCount = CASE2_THREADS.filter((thread) => decisions[thread.id]).length
  const activeThread = CASE2_THREADS[activeIndex]

  return (
    <section className="case2-board scene-transition">
      <div className="case2-board-header">
        <div>
          <span className="font-pixel text-sw-pink text-xs">GLOWLOOP THREADS</span>
          <h2 className="font-pixel text-sw-cyan text-sm">Read and Decide</h2>
        </div>
        <div className="case2-progress-chip">
          {answeredCount} / {CASE2_THREADS.length}
        </div>
      </div>

      <div className="case2-briefing-strip">
        <strong>Agent Ricky:</strong> Read the thread, then choose flag or
        dismiss. Do not overthink the interface. Pay attention to the people.
      </div>

      <div className="case2-thread-layout">
        <Case2QueueList
          activeIndex={activeIndex}
          decisions={decisions}
          onOpen={onOpen}
        />
        <Case2ThreadFile
          thread={activeThread}
          index={activeIndex}
          total={CASE2_THREADS.length}
          decision={decisions[activeThread.id]}
          processing={processing}
          onDecision={onDecision}
          onNext={onNext}
        />
      </div>
    </section>
  )
}

function Case2Debrief({
  correctCount,
  missedGroupExclusion,
  missedPlausibleDeniability,
  flaggedEverything,
  passed,
  decisions,
  onReplay,
  onContinue,
  busy,
}) {
  const wrongThreads = CASE2_THREADS.filter(
    (thread) => decisions[thread.id] !== thread.correctAction,
  )

  return (
    <section className="case-debrief scene-transition">
      <div className={passed ? 'success-banner' : 'breach-banner'}>
        {passed ? 'PATTERN FOUND - AFTERWARD' : 'PATTERN UNCLEAR - AFTERWARD'}
      </div>
      <div className="ss-card p-5 flex flex-col gap-4">
        <div className="case2-ricky-panel">
          <span className="font-pixel text-sw-yellow text-xs">AGENT RICKY</span>
          <h2 className="font-pixel text-sw-cyan text-sm">What changed after you read it all</h2>
          <p>
            You read {correctCount} / {CASE2_THREADS.length} moments the way
            Emma experienced them.{' '}
            {passed
              ? 'The harm was not in one dramatic post. It was in the pattern that kept returning to her.'
              : 'The week needs another read before the pattern is clear.'}
          </p>
          {missedGroupExclusion && (
            <blockquote className="zoey-quote">
              "You caught the easy ones. You missed the one that broke her.
              Look at the timeline, Cadet. Emma did not lose friends in one big
              fight. They just quietly stopped including her. Every single day.
              That is not banter - that is a campaign."
            </blockquote>
          )}
          {missedPlausibleDeniability && (
            <blockquote className="zoey-quote">
              "Sometimes harassment hides behind tiny comments. 'lol' once
              might mean nothing. 'lol' under every post, always from the same
              person, always aimed at Emma, becomes a pattern."
            </blockquote>
          )}
          {flaggedEverything && (
            <blockquote className="zoey-quote">
              "Flagging everything feels safe, but it blurs the difference
              between harm and ordinary conflict. Cyberbullying depends on
              repetition, targeting, power imbalance, and harm. Normal
              disagreement still needs room to exist."
            </blockquote>
          )}
        </div>

        <div className="case2-score-grid">
          {CASE2_THREADS.map((thread) => {
            const correct = decisions[thread.id] === thread.correctAction
            return (
              <article
                key={thread.id}
                className={`red-flag-card ${correct ? 'case2-correct' : 'case2-wrong'}`}
              >
                <IconFlag size={18} />
                <div>
                  <h3>
                    {correct
                      ? thread.correctAction === 'flag'
                        ? 'Correct flag'
                        : 'Correct dismiss'
                      : thread.correctAction === 'flag'
                        ? 'Easy to dismiss at first'
                        : 'Not bullying'}
                  </h3>
                  <p>{thread.explanation}</p>
                </div>
              </article>
            )
          })}
        </div>

        {wrongThreads.length > 0 && (
          <p className="text-sw-text3 text-sm">
            Re-read: {wrongThreads.map((thread) => thread.title).join(', ')}.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CASE2_TEACHING_POINTS.map((point) => (
            <article key={point.title} className="red-flag-card">
              <IconFlag size={18} />
              <div>
                <h3>{point.title}</h3>
                <p>{point.text}</p>
              </div>
            </article>
          ))}
        </div>

        {passed && (
          <div className="badge-card">
            <span>Badge unlocked</span>
            <strong>PATTERN RECOGNITION — BEGINNER</strong>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            className="ss-btn ss-btn-pink"
            onClick={onReplay}
            disabled={busy}
          >
            Replay Scene
          </button>
          <button
            type="button"
            className="ss-btn ss-btn-cyan"
            onClick={onContinue}
            disabled={busy}
          >
            {passed ? 'Continue' : 'Return to Case Files'}
          </button>
        </div>
      </div>
    </section>
  )
}

function Case2EndScreen({ badge, pointsAwarded, correctCount, onReturn, onVeteran }) {
  const quizCoins = correctCount * CASE2_DECISION_REWARD
  return (
    <section className="ss-card p-6 flex flex-col gap-4">
      <h2 className="font-pixel text-sw-cyan text-sm">Case 02 Rookie Complete</h2>
      <p className="text-sw-text2">
        Case notes filed. Rookie reward secured with {quizCoins} points.
      </p>
      <PixelBadgeCard badge={badge} pointsAwarded={pointsAwarded} />
      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" className="ss-btn ss-btn-cyan" onClick={onReturn}>
          Return to Case Files
        </button>
        <button type="button" className="ss-btn ss-btn-pink" onClick={onVeteran}>
          Continue to Veteran Mode
        </button>
      </div>
    </section>
  )
}

function Case2VeteranIntro({ internName, onNext }) {
  return (
    <section className="case-terminal ss-card scene-transition">
      <div className="case-terminal-header">
        <span>UNIT ZERO</span>
        <span>DAY 16 - 08:44</span>
      </div>
      <div className="case-os-bar">
        <span>VETERAN CASE - VIRAL PILE-ON</span>
        <span>{internName.toLowerCase()}@unitzero.gov - ACTIVE</span>
      </div>
      <div className="case2-intro-grid">
        <div className="case2-veteran-hero-post">
          <div className="case2-social-window-bar">
            <span>GlowLoop Video</span>
            <span>@aaron.codes</span>
          </div>
          <img src={fillerImage} alt="" />
          <div className="case2-veteran-post-copy">
            <strong>I think the phone policy should give students a say.</strong>
            <span>32 views - normal school policy opinion</span>
          </div>
        </div>
        <div className="case2-ricky-panel">
          <span className="font-pixel text-sw-yellow text-xs">AGENT RICKY</span>
          <h2 className="font-pixel text-sw-cyan text-sm">The Pile-On</h2>
          <p>
            Aaron is sixteen. He posted a harmless video about a school policy.
            Within forty-eight hours, strangers had turned him into a meme.
          </p>
          <p className="text-sw-text3">
            Review the evidence, then decide who escalated the harm. Watch for
            the moment most people walk past.
          </p>
          <button type="button" className="ss-btn ss-btn-cyan self-start" onClick={onNext}>
            Open Evidence <IconArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}

function Case2VeteranEvidence({ activeIndex, onSelect, onNext }) {
  const activeEvidence = CASE2_VETERAN_EVIDENCE[activeIndex]

  return (
    <section className="case2-board scene-transition">
      <div className="case2-board-header">
        <div>
          <span className="font-pixel text-sw-pink text-xs">GLOWLOOP INCIDENT FILE</span>
          <h2 className="font-pixel text-sw-cyan text-sm">Evidence Review</h2>
        </div>
        <div className="case2-progress-chip">
          {activeIndex + 1} / {CASE2_VETERAN_EVIDENCE.length}
        </div>
      </div>
      <div className="case2-briefing-strip">
        <strong>Agent Ricky:</strong> The question is not just who started it.
        It is who kept it moving.
      </div>

      <div className="case2-thread-layout">
        <aside className="case2-queue-panel">
          <div className="case2-queue-title">
            <span>EVIDENCE</span>
            <strong>{CASE2_VETERAN_EVIDENCE.length}</strong>
          </div>
          {CASE2_VETERAN_EVIDENCE.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`case2-queue-item ${index === activeIndex ? 'active' : ''} ${
                item.critical ? 'case2-veteran-critical-link' : ''
              }`}
              onClick={() => onSelect(index)}
            >
              <span>{item.label}</span>
              <strong>{item.title}</strong>
              <em>{item.severity}</em>
            </button>
          ))}
        </aside>

        <article
          className={`case2-file case2-veteran-evidence-card ${
            activeEvidence.critical ? 'case2-veteran-critical' : ''
          }`}
        >
          <div className="case2-file-top">
            <div>
              <span className="font-pixel text-sw-pink text-xs">
                {activeEvidence.source}
              </span>
              <h3>{activeEvidence.title}</h3>
              <p>{activeEvidence.time} - {activeEvidence.severity}</p>
            </div>
          </div>
          <section className="case2-social-window">
            <div className="case2-social-window-bar">
              <span>GlowLoop</span>
              <span>{activeEvidence.handle}</span>
            </div>
            <div className="case2-veteran-post-frame">
              <img src={fillerImage} alt="" />
              <div className="case2-veteran-post-copy">
                <strong>{activeEvidence.caption}</strong>
                <span>{activeEvidence.stat}</span>
              </div>
            </div>
          </section>
          <p className="case2-thread-hint">{activeEvidence.body}</p>
          {activeEvidence.critical && (
            <blockquote className="zoey-quote case2-veteran-dm-callout">
              This is the key evidence. Aaron reached out privately, and that
              vulnerable moment was posted for laughs.
            </blockquote>
          )}
          <button type="button" className="ss-btn ss-btn-cyan self-start" onClick={onNext}>
            {activeIndex === CASE2_VETERAN_EVIDENCE.length - 1
              ? 'Begin Judgment Calls'
              : 'Next Evidence'}{' '}
            <IconArrowRight size={16} />
          </button>
        </article>
      </div>
    </section>
  )
}

function Case2VeteranJudgment({
  answers,
  currentIndex,
  onAnswer,
  onNext,
  onSubmit,
}) {
  const judgment = CASE2_VETERAN_JUDGMENTS[currentIndex]
  const selectedAnswer = answers[judgment.id] || null
  const answered = Boolean(selectedAnswer)
  const selectedCorrect = selectedAnswer === judgment.answer
  const isLast = currentIndex === CASE2_VETERAN_JUDGMENTS.length - 1

  return (
    <section className="case2-board scene-transition">
      <div className="case2-board-header">
        <div>
          <span className="font-pixel text-sw-pink text-xs">RESPONSIBILITY MATRIX</span>
          <h2 className="font-pixel text-sw-cyan text-sm">Judgment Calls</h2>
        </div>
        <div className="case2-progress-chip">
          {currentIndex + 1} / {CASE2_VETERAN_JUDGMENTS.length}
        </div>
      </div>
      <article
        className={`veteran-quiz-card veteran-quiz-focus ${
          judgment.critical ? 'case2-veteran-critical' : ''
        } ${answered && !selectedCorrect ? 'veteran-quiz-shake' : ''}`}
      >
        <h3>{judgment.question}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {judgment.options.map((option) => {
            const selected = selectedAnswer === option.value
            const isCorrect = judgment.answer === option.value
            return (
              <button
                key={option.value}
                type="button"
                className={`veteran-answer-btn ${
                  selected ? 'veteran-answer-selected' : ''
                } ${answered && isCorrect ? 'veteran-answer-correct' : ''} ${
                  answered && selected && !isCorrect ? 'veteran-answer-wrong' : ''
                }`}
                onClick={() => onAnswer(judgment.id, option.value)}
                disabled={answered}
              >
                {option.label}
              </button>
            )
          })}
        </div>
        {answered && (
          <div className={selectedCorrect ? 'success-banner' : 'breach-banner'}>
            {selectedCorrect ? judgment.correctFeedback : judgment.wrongFeedback}
          </div>
        )}
        {answered && (
          <button
            type="button"
            className="ss-btn ss-btn-cyan self-start"
            onClick={isLast ? onSubmit : onNext}
          >
            {isLast ? 'Submit Case Judgment' : 'Next Judgment'}{' '}
            <IconArrowRight size={16} />
          </button>
        )}
      </article>
    </section>
  )
}

function Case2VeteranQuiz({
  answers,
  currentQuestionIndex,
  onAnswer,
  onNextQuestion,
  onSubmit,
  submitted,
}) {
  const correct = answers.reduce(
    (count, answer, index) =>
      count + (answer === CASE2_VETERAN_QUIZ[index].answer ? 1 : 0),
    0,
  )
  const currentQuestion = CASE2_VETERAN_QUIZ[currentQuestionIndex]
  const selectedAnswer = answers[currentQuestionIndex]
  const answered = selectedAnswer !== null
  const selectedCorrect = selectedAnswer === currentQuestion.answer
  const isLastQuestion = currentQuestionIndex === CASE2_VETERAN_QUIZ.length - 1
  const passed = correct > CASE2_VETERAN_PASS_THRESHOLD

  return (
    <section className="case-debrief scene-transition">
      <div className="success-banner">FINAL CERTIFICATION - DIGITAL DEFENDER</div>
      <div className="ss-card p-5 flex flex-col gap-4">
        <h2 className="font-pixel text-sw-cyan text-sm">
          Case 02 final certification
        </h2>
        <p className="text-sw-text2">
          Each correct answer is worth 10 coins. Passing requires more than 50%
          correct, so 6 or more answers closes the Veteran file.
        </p>
        {!submitted ? (
          <>
            <div className="veteran-quiz-progress">
              Question {currentQuestionIndex + 1} / {CASE2_VETERAN_QUIZ.length}
            </div>
            <article
              className={`veteran-quiz-card veteran-quiz-focus ${
                answered && !selectedCorrect ? 'veteran-quiz-shake' : ''
              }`}
            >
              <h3>{currentQuestion.question}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentQuestion.options.map((option, optionIndex) => {
                  const selected = selectedAnswer === optionIndex
                  const isCorrect = currentQuestion.answer === optionIndex
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`veteran-answer-btn ${
                        selected ? 'veteran-answer-selected' : ''
                      } ${
                        answered && isCorrect ? 'veteran-answer-correct' : ''
                      } ${
                        answered && selected && !isCorrect
                          ? 'veteran-answer-wrong'
                          : ''
                      }`}
                      onClick={() => onAnswer(currentQuestionIndex, optionIndex)}
                      disabled={answered}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </article>
            {answered && (
              <div className={selectedCorrect ? 'success-banner' : 'breach-banner'}>
                {selectedCorrect
                  ? 'Correct. +10 quiz coins secured.'
                  : `Correct answer: ${
                      currentQuestion.options[currentQuestion.answer]
                    }`}
              </div>
            )}
            {answered && (
              <button
                type="button"
                className="ss-btn ss-btn-cyan self-start"
                onClick={isLastQuestion ? onSubmit : onNextQuestion}
              >
                {isLastQuestion ? 'View results' : 'Next Question'}
              </button>
            )}
          </>
        ) : (
          <>
            <div className={passed ? 'success-banner' : 'breach-banner'}>
              {passed ? 'Certification passed' : 'Certification failed'}
            </div>
            <div className="veteran-results-grid">
              <div>
                <span>Correct</span>
                <strong>{correct} / 10</strong>
              </div>
              <div>
                <span>Quiz coins</span>
                <strong>{correct * 10}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{passed ? 'Case can close' : 'Replay required'}</strong>
              </div>
            </div>
            <button
              type="button"
              className="ss-btn ss-btn-cyan self-start"
              onClick={onSubmit}
            >
              Continue debrief
            </button>
          </>
        )}
      </div>
    </section>
  )
}

function Case2VeteranDebrief({
  judgmentCorrect,
  privatePleaCorrect,
  fieldPassed,
  quizCorrect,
  quizSubmitted,
  route,
  onReplay,
  onContinue,
  busy,
}) {
  const quizPassed = quizSubmitted && quizCorrect > CASE2_VETERAN_PASS_THRESHOLD
  const passed = fieldPassed && quizPassed && route !== 'quizFailed'

  return (
    <section className="case-debrief scene-transition">
      <div className={passed ? 'success-banner' : 'breach-banner'}>
        {passed ? 'CASE 02 VETERAN SECURED' : 'PILE-ON REVIEW FAILED'}
      </div>
      <div className="ss-card p-5 flex flex-col gap-4">
        <div className="case2-ricky-panel">
          <span className="font-pixel text-sw-yellow text-xs">AGENT RICKY</span>
          <h2 className="font-pixel text-sw-cyan text-sm">The part people miss</h2>
          <p>
            Intent does not erase impact. A thousand small actions can crush
            someone just as much as one big one.
          </p>
          <blockquote className="zoey-quote case2-veteran-dm-callout">
            "That screenshot of him asking for help? That is not collateral
            damage. That is the cruellest thing in this whole file. Remember it.
            Because in every bullying case you will ever work, there is a moment
            like that - and it is usually the one people walk past."
          </blockquote>
          <blockquote className="zoey-quote">
            "That moment - when he reached out - that is when he needed someone
            to step in. Instead, they turned his fear into entertainment. That is
            the cruelty people overlook."
          </blockquote>
        </div>
        <div className="veteran-results-grid">
          <div>
            <span>Judgments</span>
            <strong>{judgmentCorrect} / {CASE2_VETERAN_JUDGMENTS.length}</strong>
          </div>
          <div>
            <span>Private plea</span>
            <strong>{privatePleaCorrect ? 'Identified' : 'Missed'}</strong>
          </div>
          <div>
            <span>Quiz</span>
            <strong>{quizCorrect} / 10</strong>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CASE2_VETERAN_TEACHING_POINTS.map((point) => (
            <article key={point.title} className="red-flag-card">
              <IconFlag size={18} />
              <div>
                <h3>{point.title}</h3>
                <p>{point.text}</p>
              </div>
            </article>
          ))}
        </div>
        {passed && (
          <div className="badge-card">
            <span>Badge unlocked</span>
            <strong>DIGITAL DEFENDER - LEVEL 2</strong>
          </div>
        )}
        {!fieldPassed && (
          <p className="text-sw-text3 text-sm">
            Replay the full Veteran file. Every judgment call must be correct
            before the final certification unlocks, including the private DM
            screenshot as the most serious act in the case.
          </p>
        )}
        {route === 'quizFailed' && (
          <p className="text-sw-text3 text-sm">
            The final certification score was below the required 6 / 10.
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            className="ss-btn ss-btn-pink"
            onClick={onReplay}
            disabled={busy}
          >
            Replay Veteran
          </button>
          <button
            type="button"
            className="ss-btn ss-btn-cyan"
            onClick={onContinue}
            disabled={busy}
          >
            Continue to Case Files
          </button>
        </div>
      </div>
    </section>
  )
}

function Case2VeteranEndScreen({ badge, pointsAwarded, quizCorrect, onReturn, onReplay }) {
  return (
    <section className="ss-card p-6 flex flex-col gap-4">
      <h2 className="font-pixel text-sw-cyan text-sm">Case 02 Veteran Complete</h2>
      <p className="text-sw-text2">
        The Pile-On closed. Quiz score: {quizCorrect}/10.
      </p>
      <PixelBadgeCard badge={badge} pointsAwarded={pointsAwarded} />
      <div className="badge-card">
        <span>Field guide unlocked</span>
        <strong>DIGITAL DEFENDER - LEVEL 2</strong>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" className="ss-btn ss-btn-cyan" onClick={onReturn}>
          Return to Case Files
        </button>
        <button type="button" className="ss-btn ss-btn-pink" onClick={onReplay}>
          Replay Veteran
        </button>
      </div>
    </section>
  )
}

function Case2Veteran() {
  const navigate = useNavigate()
  const { user, token, setUser } = useAuth()
  const [phase, setPhase] = useState('intro')
  const [activeEvidenceIndex, setActiveEvidenceIndex] = useState(0)
  const [judgmentAnswers, setJudgmentAnswers] = useState({})
  const [currentJudgmentIndex, setCurrentJudgmentIndex] = useState(0)
  const [route, setRoute] = useState(null)
  const [quizAnswers, setQuizAnswers] = useState(
    () => CASE2_VETERAN_QUIZ.map(() => null),
  )
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [badge, setBadge] = useState(null)
  const [pointsAwarded, setPointsAwarded] = useState(0)
  const [failureLifeSpent, setFailureLifeSpent] = useState(false)
  const [progressError, setProgressError] = useState('')
  const [resolvingDebrief, setResolvingDebrief] = useState(false)
  const resolvingRef = useRef(false)
  const failureLifeSpentRef = useRef(false)
  const internName = user?.username || 'Nova'
  const judgmentCorrect = CASE2_VETERAN_JUDGMENTS.reduce(
    (count, judgment) =>
      count + (judgmentAnswers[judgment.id] === judgment.answer ? 1 : 0),
    0,
  )
  const privatePleaCorrect =
    judgmentAnswers['private-plea'] ===
    CASE2_VETERAN_JUDGMENTS.find((item) => item.id === 'private-plea')?.answer
  const fieldPassed = judgmentCorrect === CASE2_VETERAN_JUDGMENTS.length
  const quizCorrect = quizAnswers.reduce(
    (count, answer, index) =>
      count + (answer === CASE2_VETERAN_QUIZ[index].answer ? 1 : 0),
    0,
  )
  const quizPassed = quizSubmitted && quizCorrect > CASE2_VETERAN_PASS_THRESHOLD
  const passedVeteran = fieldPassed && quizPassed && route !== 'quizFailed'

  function restart() {
    setPhase('intro')
    setActiveEvidenceIndex(0)
    setJudgmentAnswers({})
    setCurrentJudgmentIndex(0)
    setRoute(null)
    setQuizAnswers(CASE2_VETERAN_QUIZ.map(() => null))
    setCurrentQuizQuestion(0)
    setQuizSubmitted(false)
    setBadge(null)
    setPointsAwarded(0)
    setFailureLifeSpent(false)
    setProgressError('')
    setResolvingDebrief(false)
    resolvingRef.current = false
    failureLifeSpentRef.current = false
  }

  async function spendFailureLife(nextAction) {
    if (failureLifeSpentRef.current || failureLifeSpent) {
      if (nextAction === 'replay') {
        restart()
        return
      }
      if (nextAction === 'continue') {
        navigate('/play')
      }
      return
    }
    if (resolvingRef.current) return
    resolvingRef.current = true
    failureLifeSpentRef.current = true
    setResolvingDebrief(true)
    setProgressError('')
    try {
      const data = await api.failAttempt(token, {
        caseId: 2,
        difficulty: 'veteran',
      })
      setUser(data.user)
      setFailureLifeSpent(true)
      playSfx('lifeLost')
      playSfx('caseFailed')
      if (nextAction === 'replay') {
        restart()
        return
      }
      if (nextAction === 'debrief') {
        resolvingRef.current = false
        setResolvingDebrief(false)
        return
      }
      navigate('/play')
    } catch (error) {
      failureLifeSpentRef.current = false
      setFailureLifeSpent(false)
      console.error('[progress] Case 2 Veteran failed attempt update failed', {
        endpoint: '/progress/fail-attempt',
        caseId: 2,
        difficulty: 'veteran',
        message: error.message,
      })
      setProgressError(error.message || 'Could not update lives.')
      resolvingRef.current = false
      setResolvingDebrief(false)
    }
  }

  async function finishVeteran(nextAction = 'end') {
    if (!passedVeteran) {
      spendFailureLife(nextAction === 'replay' ? 'replay' : 'continue')
      return
    }
    if (resolvingRef.current) return
    resolvingRef.current = true
    setResolvingDebrief(true)
    setProgressError('')
    try {
      const unlockedBadge = BADGES.digitalDefenderLevel2
      const data = await api.completeCase(token, {
        caseId: 2,
        difficulty: 'veteran',
        result: 'success',
        badge: unlockedBadge,
        bonusPoints: quizCorrect * 10,
      })
      setUser(data.user)
      setBadge(unlockedBadge)
      setPointsAwarded(data.pointsAwarded)
      if (data.pointsAwarded > 0) {
        playSfx('coins')
        playSfx('badge')
      }
      playSfx('caseComplete')
      if (nextAction === 'caseFiles') {
        navigate('/play')
        return
      }
      setPhase('end')
    } catch (error) {
      console.error('[progress] Case 2 Veteran completion update failed', {
        endpoint: '/progress/complete-case',
        caseId: 2,
        difficulty: 'veteran',
        message: error.message,
      })
      setProgressError(error.message || 'Could not update case progress.')
    } finally {
      resolvingRef.current = false
      setResolvingDebrief(false)
    }
  }

  function nextEvidence() {
    if (activeEvidenceIndex < CASE2_VETERAN_EVIDENCE.length - 1) {
      setActiveEvidenceIndex((value) => value + 1)
      playSfx('click')
      return
    }
    setPhase('judgment')
  }

  function answerJudgment(judgmentId, value) {
    if (judgmentAnswers[judgmentId]) return
    setJudgmentAnswers((current) => ({ ...current, [judgmentId]: value }))
    playSfx('click')
  }

  function nextJudgment() {
    setCurrentJudgmentIndex((value) =>
      Math.min(value + 1, CASE2_VETERAN_JUDGMENTS.length - 1),
    )
  }

  async function submitJudgments() {
    playSfx(fieldPassed ? 'correct' : 'wrong')
    if (!fieldPassed) {
      setRoute('fieldFailed')
      setPhase('debrief')
      await spendFailureLife('debrief')
      return
    }
    setPhase('quiz')
  }

  function answerQuiz(questionIndex, optionIndex) {
    if (quizAnswers[questionIndex] !== null) return
    setQuizAnswers((current) =>
      current.map((answer, index) =>
        index === questionIndex ? optionIndex : answer,
      ),
    )
    playSfx(
      optionIndex === CASE2_VETERAN_QUIZ[questionIndex].answer ? 'correct' : 'wrong',
    )
  }

  function nextQuizQuestion() {
    setCurrentQuizQuestion((value) =>
      Math.min(value + 1, CASE2_VETERAN_QUIZ.length - 1),
    )
  }

  async function submitQuiz() {
    if (!quizSubmitted) {
      setQuizSubmitted(true)
      return
    }
    if (quizCorrect <= CASE2_VETERAN_PASS_THRESHOLD) {
      setRoute('quizFailed')
      setPhase('debrief')
      await spendFailureLife('debrief')
      return
    }
    setPhase('debrief')
  }

  return (
    <div className="case-shell max-w-5xl mx-auto">
      <div className="case-title-row">
        <div>
          <span className="font-pixel text-sw-pink text-xs">CASE 02 VETERAN</span>
          <h2 className="font-pixel text-sw-cyan text-sm md:text-base">
            The Pile-On
          </h2>
        </div>
      </div>
      {progressError && (
        <div className="ss-card p-3 text-sw-red text-sm">{progressError}</div>
      )}

      {phase === 'intro' && (
        <Case2VeteranIntro
          internName={internName}
          onNext={() => setPhase('evidence')}
        />
      )}
      {phase === 'evidence' && (
        <Case2VeteranEvidence
          activeIndex={activeEvidenceIndex}
          onSelect={setActiveEvidenceIndex}
          onNext={nextEvidence}
        />
      )}
      {phase === 'judgment' && (
        <Case2VeteranJudgment
          answers={judgmentAnswers}
          currentIndex={currentJudgmentIndex}
          onAnswer={answerJudgment}
          onNext={nextJudgment}
          onSubmit={submitJudgments}
        />
      )}
      {phase === 'quiz' && (
        <Case2VeteranQuiz
          answers={quizAnswers}
          currentQuestionIndex={currentQuizQuestion}
          onAnswer={answerQuiz}
          onNextQuestion={nextQuizQuestion}
          onSubmit={submitQuiz}
          submitted={quizSubmitted}
        />
      )}
      {phase === 'debrief' && (
        <Case2VeteranDebrief
          judgmentCorrect={judgmentCorrect}
          privatePleaCorrect={privatePleaCorrect}
          fieldPassed={fieldPassed}
          quizCorrect={quizCorrect}
          quizSubmitted={quizSubmitted}
          route={route}
          onReplay={
            passedVeteran
              ? restart
              : failureLifeSpent
                ? restart
                : () => spendFailureLife('replay')
          }
          onContinue={
            passedVeteran
              ? () => finishVeteran('caseFiles')
              : failureLifeSpent
                ? () => navigate('/play')
                : () => spendFailureLife('continue')
          }
          busy={resolvingDebrief}
        />
      )}
      {phase === 'end' && (
        <Case2VeteranEndScreen
          badge={badge}
          pointsAwarded={pointsAwarded}
          quizCorrect={quizCorrect}
          onReturn={() => navigate('/play')}
          onReplay={restart}
        />
      )}
    </div>
  )
}

function Case2Rookie() {
  const navigate = useNavigate()
  const { user, token, setUser } = useAuth()
  const [phase, setPhase] = useState('intro')
  const [decisions, setDecisions] = useState({})
  const [activeThreadIndex, setActiveThreadIndex] = useState(0)
  const [processingDecision, setProcessingDecision] = useState(false)
  const [badge, setBadge] = useState(null)
  const [pointsAwarded, setPointsAwarded] = useState(0)
  const [progressError, setProgressError] = useState('')
  const [resolvingDebrief, setResolvingDebrief] = useState(false)
  const resolvingRef = useRef(false)
  const internName = user?.username || 'Nova'
  const correctCount = CASE2_THREADS.reduce(
    (count, thread) =>
      count + (decisions[thread.id] === thread.correctAction ? 1 : 0),
    0,
  )
  const subtleCorrectCount = ['group-exclusion', 'plausible-deniability'].reduce(
    (count, id) => count + (decisions[id] === 'flag' ? 1 : 0),
    0,
  )
  const passed = correctCount >= CASE2_PASS_THRESHOLD && subtleCorrectCount >= 1
  const missedGroupExclusion =
    decisions['group-exclusion'] && decisions['group-exclusion'] !== 'flag'
  const missedPlausibleDeniability =
    decisions['plausible-deniability'] &&
    decisions['plausible-deniability'] !== 'flag'
  const flaggedEverything =
    CASE2_THREADS.length > 0 &&
    CASE2_THREADS.every((thread) => decisions[thread.id] === 'flag')

  function restart() {
    setPhase('intro')
    setDecisions({})
    setActiveThreadIndex(0)
    setProcessingDecision(false)
    setBadge(null)
    setPointsAwarded(0)
    setProgressError('')
    setResolvingDebrief(false)
    resolvingRef.current = false
  }

  function setDecision(threadId, action) {
    if (processingDecision || decisions[threadId]) return
    playSfx('click')
    setProcessingDecision(true)
    window.setTimeout(() => {
      setDecisions((current) => ({ ...current, [threadId]: action }))
      playSfx('click')
      setProcessingDecision(false)
    }, 720)
  }

  function openThread(index) {
    if (processingDecision) return
    setActiveThreadIndex(index)
  }

  function nextThreadOrSubmit() {
    if (processingDecision) return
    const activeThread = CASE2_THREADS[activeThreadIndex]
    if (!decisions[activeThread.id]) return
    if (activeThreadIndex < CASE2_THREADS.length - 1) {
      setActiveThreadIndex((value) => value + 1)
      playSfx('click')
      return
    }
    if (Object.keys(decisions).length !== CASE2_THREADS.length) {
      const firstUnresolved = CASE2_THREADS.findIndex((thread) => !decisions[thread.id])
      if (firstUnresolved >= 0) {
        setActiveThreadIndex(firstUnresolved)
      }
      return
    }
    playSfx(passed ? 'correct' : 'wrong')
    setPhase('debrief')
  }

  async function spendFailureLife(nextAction) {
    if (resolvingRef.current) return
    resolvingRef.current = true
    setResolvingDebrief(true)
    setProgressError('')
    try {
      const data = await api.failAttempt(token, {
        caseId: 2,
        difficulty: 'rookie',
      })
      setUser(data.user)
      playSfx('lifeLost')
      playSfx('caseFailed')
      if (nextAction === 'replay') {
        restart()
        return
      }
      navigate('/play')
    } catch (error) {
      console.error('[progress] Case 2 failed attempt update failed', {
        endpoint: '/progress/fail-attempt',
        caseId: 2,
        difficulty: 'rookie',
        message: error.message,
      })
      setProgressError(error.message || 'Could not update lives.')
      resolvingRef.current = false
      setResolvingDebrief(false)
    }
  }

  async function finishRookie(nextAction = 'end') {
    if (!passed) {
      spendFailureLife(nextAction === 'replay' ? 'replay' : 'continue')
      return
    }
    if (resolvingRef.current) return
    resolvingRef.current = true
    setResolvingDebrief(true)
    setProgressError('')
    try {
      const unlockedBadge = BADGES.patternBeginner
      const data = await api.completeCase(token, {
        caseId: 2,
        difficulty: 'rookie',
        result: 'success',
        badge: unlockedBadge,
        bonusPoints: correctCount * CASE2_DECISION_REWARD,
      })
      setUser(data.user)
      setBadge(unlockedBadge)
      setPointsAwarded(data.pointsAwarded)
      if (data.pointsAwarded > 0) {
        playSfx('coins')
        playSfx('badge')
      }
      playSfx('caseComplete')
      if (nextAction === 'replay') {
        restart()
        return
      }
      if (nextAction === 'caseFiles') {
        navigate('/play')
        return
      }
      setPhase('end')
    } catch (error) {
      console.error('[progress] Case 2 completion update failed', {
        endpoint: '/progress/complete-case',
        caseId: 2,
        difficulty: 'rookie',
        message: error.message,
      })
      setProgressError(error.message || 'Could not update case progress.')
    } finally {
      resolvingRef.current = false
      setResolvingDebrief(false)
    }
  }

  return (
    <div className="case-shell max-w-5xl mx-auto">
      <div className="case-title-row">
        <div>
          <span className="font-pixel text-sw-pink text-xs">CASE 02 ROOKIE</span>
          <h2 className="font-pixel text-sw-cyan text-sm md:text-base">
            The Network: Just Jokes
          </h2>
        </div>
      </div>
      {progressError && (
        <div className="ss-card p-3 text-sw-red text-sm">{progressError}</div>
      )}

      {phase === 'intro' && (
        <Case2Intro
          internName={internName}
          onNext={() => setPhase('review')}
        />
      )}
      {phase === 'review' && (
        <Case2ReviewBoard
          decisions={decisions}
          activeIndex={activeThreadIndex}
          processing={processingDecision}
          onOpen={openThread}
          onDecision={setDecision}
          onNext={nextThreadOrSubmit}
        />
      )}
      {phase === 'debrief' && (
        <Case2Debrief
          correctCount={correctCount}
          missedGroupExclusion={missedGroupExclusion}
          missedPlausibleDeniability={missedPlausibleDeniability}
          flaggedEverything={flaggedEverything}
          passed={passed}
          decisions={decisions}
          onReplay={passed ? () => finishRookie('replay') : () => spendFailureLife('replay')}
          onContinue={passed ? () => finishRookie('end') : () => spendFailureLife('continue')}
          busy={resolvingDebrief}
        />
      )}
      {phase === 'end' && (
        <Case2EndScreen
          badge={badge}
          pointsAwarded={pointsAwarded}
          correctCount={correctCount}
          onReturn={() => navigate('/play')}
          onVeteran={() => navigate('/case/2/veteran')}
        />
      )}
    </div>
  )
}

function Case3Rookie() {
  const navigate = useNavigate()
  const { user, token, setUser } = useAuth()
  const [phase, setPhase] = useState('intro')
  const [introStep, setIntroStep] = useState(0)
  const [markStep, setMarkStep] = useState(0)
  const [scenarioChoice, setScenarioChoice] = useState(null)
  const [checkAnswers, setCheckAnswers] = useState(
    () => CASE3_KNOWLEDGE_CHECK.map(() => null),
  )
  const [currentQuestion, setCurrentQuestion] = useState(0)
  // Per-question wrong option revealed by a spent Hint Token (50/50 help).
  const [hintEliminated, setHintEliminated] = useState(
    () => CASE3_KNOWLEDGE_CHECK.map(() => null),
  )
  const [powerNotice, setPowerNotice] = useState(null) // { ok, text }
  const [usingHint, setUsingHint] = useState(false)
  const [lifeSpentInCheck, setLifeSpentInCheck] = useState(false)
  const [outOfLives, setOutOfLives] = useState(false)
  const [badge, setBadge] = useState(null)
  const [pointsAwarded, setPointsAwarded] = useState(0)
  const [progressError, setProgressError] = useState('')
  const [resolvingDebrief, setResolvingDebrief] = useState(false)
  const resolvingRef = useRef(false)
  const internName = user?.username || 'Nova'
  const hintsLeft = user?.inventory?.hint ?? 0
  const scenarioPassed = scenarioChoice === 'verify'
  const checkCorrect = checkAnswers.reduce(
    (count, answer, index) =>
      count + (answer === CASE3_KNOWLEDGE_CHECK[index].answer ? 1 : 0),
    0,
  )
  const checkComplete = checkAnswers.every((answer) => answer !== null)
  const checkPassed =
    checkComplete && checkCorrect === CASE3_KNOWLEDGE_CHECK.length
  const passed = scenarioPassed && checkPassed

  function restart() {
    setPhase('intro')
    setIntroStep(0)
    setMarkStep(0)
    setScenarioChoice(null)
    setCheckAnswers(CASE3_KNOWLEDGE_CHECK.map(() => null))
    setCurrentQuestion(0)
    setHintEliminated(CASE3_KNOWLEDGE_CHECK.map(() => null))
    setPowerNotice(null)
    setUsingHint(false)
    setLifeSpentInCheck(false)
    setOutOfLives(false)
    setBadge(null)
    setPointsAwarded(0)
    setProgressError('')
    setResolvingDebrief(false)
    resolvingRef.current = false
  }

  // Spend a Hint Token to grey out one wrong option on the current
  // question (50/50). The token is consumed server-side first so a player
  // can never reveal help they have not paid for; the inventory count then
  // syncs back into auth context so the Shop and TopNav stay accurate.
  async function useHint() {
    if (usingHint) return
    const question = CASE3_KNOWLEDGE_CHECK[currentQuestion]
    if (checkAnswers[currentQuestion] !== null) return
    if (hintEliminated[currentQuestion] !== null) {
      setPowerNotice({ ok: false, text: 'Hint already used on this question.' })
      return
    }
    if (hintsLeft < 1) {
      setPowerNotice({
        ok: false,
        text: 'You ran out of Hint Tokens. Visit the shop to restock.',
      })
      return
    }
    setUsingHint(true)
    setPowerNotice(null)
    try {
      const res = await api.useItem(token, 'hint')
      setUser((current) => ({ ...current, inventory: res.inventory }))
      // Pick one wrong option to eliminate (never the correct answer).
      const wrongOptions = question.options
        .map((_, index) => index)
        .filter((index) => index !== question.answer)
      const eliminate =
        wrongOptions[Math.floor(Math.random() * wrongOptions.length)]
      setHintEliminated((current) =>
        current.map((value, index) =>
          index === currentQuestion ? eliminate : value,
        ),
      )
      playSfx('click')
      setPowerNotice({ ok: true, text: 'Hint used - one wrong answer removed.' })
    } catch (error) {
      setPowerNotice({
        ok: false,
        text: error.message || 'Could not use the Hint Token.',
      })
    } finally {
      setUsingHint(false)
    }
  }

  // A wrong knowledge-check answer costs one life immediately. We spend it
  // through the existing lives endpoint so the server stays the source of
  // truth, then mirror the new count into auth context. Running the count
  // to zero ends the attempt straight away (handled in answerCheck).
  async function spendLifeForWrongAnswer() {
    try {
      const data = await api.useLife(token)
      setLifeSpentInCheck(true)
      setUser((current) => ({
        ...current,
        livesRemaining: data.livesRemaining,
      }))
      playSfx('lifeLost')
      if (data.livesRemaining <= 0) setOutOfLives(true)
    } catch (error) {
      // 409 = already out of lives. Either way, the attempt is over.
      setOutOfLives(true)
    }
  }

  function chooseScenario(choice) {
    if (scenarioChoice) return
    setScenarioChoice(choice)
    playSfx(choice === 'verify' ? 'correct' : 'wrong')
  }

  function answerCheck(questionIndex, optionIndex) {
    if (checkAnswers[questionIndex] !== null) return
    setCheckAnswers((current) =>
      current.map((answer, index) =>
        index === questionIndex ? optionIndex : answer,
      ),
    )
    const isWrong = optionIndex !== CASE3_KNOWLEDGE_CHECK[questionIndex].answer
    playSfx(isWrong ? 'wrong' : 'correct')
    // A wrong pick burns a life on the spot - this is what the Hint Token
    // guards against. Lives are spent through the server (source of truth).
    if (isWrong) spendLifeForWrongAnswer()
  }

  async function spendFailureLife(nextAction) {
    if (resolvingRef.current) return
    resolvingRef.current = true
    setResolvingDebrief(true)
    setProgressError('')
    // A wrong knowledge-check answer already burned a life inline, so the
    // debrief must not charge a second one - that would double-penalise the
    // same mistake. The scenario-only failure path (perfect check, wrong
    // corridor) still spends its life here as before.
    if (lifeSpentInCheck) {
      playSfx('caseFailed')
      resolvingRef.current = false
      setResolvingDebrief(false)
      if (nextAction === 'replay') {
        restart()
      } else {
        navigate('/play')
      }
      return
    }
    try {
      const data = await api.failAttempt(token, {
        caseId: 3,
        difficulty: 'rookie',
      })
      setUser(data.user)
      playSfx('lifeLost')
      playSfx('caseFailed')
      if (nextAction === 'replay') {
        restart()
        return
      }
      navigate('/play')
    } catch (error) {
      console.error('[progress] Case 3 failed attempt update failed', {
        endpoint: '/progress/fail-attempt',
        caseId: 3,
        difficulty: 'rookie',
        message: error.message,
      })
      setProgressError(error.message || 'Could not update lives.')
      resolvingRef.current = false
      setResolvingDebrief(false)
    }
  }

  async function finishRookie(nextAction = 'end') {
    if (!passed) {
      spendFailureLife(nextAction === 'replay' ? 'replay' : 'continue')
      return
    }
    if (resolvingRef.current) return
    resolvingRef.current = true
    setResolvingDebrief(true)
    setProgressError('')
    try {
      const unlockedBadge = BADGES.humanFirewallBeginner
      const data = await api.completeCase(token, {
        caseId: 3,
        difficulty: 'rookie',
        result: 'success',
        badge: unlockedBadge,
      })
      setUser(data.user)
      setBadge(unlockedBadge)
      setPointsAwarded(data.pointsAwarded)
      if (data.pointsAwarded > 0) {
        playSfx('coins')
        playSfx('badge')
      }
      playSfx('caseComplete')
      if (nextAction === 'replay') {
        restart()
        return
      }
      setPhase('end')
    } catch (error) {
      console.error('[progress] Case 3 completion update failed', {
        endpoint: '/progress/complete-case',
        caseId: 3,
        difficulty: 'rookie',
        message: error.message,
      })
      setProgressError(error.message || 'Could not update case progress.')
    } finally {
      resolvingRef.current = false
      setResolvingDebrief(false)
    }
  }

  const activeQuestion = CASE3_KNOWLEDGE_CHECK[currentQuestion]
  const selectedCheckAnswer = checkAnswers[currentQuestion]
  const checkAnswered = selectedCheckAnswer !== null
  const hintUsedHere = hintEliminated[currentQuestion] !== null

  // A wrong answer can drain the last life mid-check. When that happens the
  // attempt is over - route the player out instead of letting them finish a
  // run they can no longer pass.
  if (outOfLives) {
    return (
      <div className="case-shell max-w-5xl mx-auto">
        <section className="ss-card p-6 flex flex-col gap-4 max-w-3xl mx-auto opacity-90">
          <IconLock size={28} className="text-sw-red" />
          <h2 className="font-pixel text-sw-cyan text-sm">No lives remaining</h2>
          <p className="text-sw-text2">
            A wrong answer cost your last life. Lives regenerate over time, or
            you can earn points in the quiz to buy Hint Tokens before your next
            attempt.
          </p>
          <button
            type="button"
            className="ss-btn ss-btn-cyan self-start"
            onClick={() => navigate('/play')}
          >
            Return to Case Files
          </button>
        </section>
      </div>
    )
  }

  return (
    <div className="case-shell max-w-5xl mx-auto">
      <div className="case-title-row">
        <div>
          <span className="font-pixel text-sw-pink text-xs">CASE 03 ROOKIE</span>
          <h2 className="font-pixel text-sw-cyan text-sm md:text-base">
            Friendly Faces
          </h2>
        </div>
      </div>
      {progressError && (
        <div className="ss-card p-3 text-sw-red text-sm">{progressError}</div>
      )}

      {phase === 'intro' && (
        <section className="case-scene scene-transition">
          <div className="case-scene-top">
            <span>UNIT ZERO</span>
            <span>WEEK 4 - 07:36</span>
          </div>
          <div className="case-office case3-briefing-office">
            <div className="case-window case-window-left">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="case-window case-window-right">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="unit-poster unit-poster-left">
              CASE 03
              <br />
              THE INSIDER
            </div>
            <div className="unit-poster unit-poster-right">
              SOCIAL
              <br />
              ENGINEERING
            </div>
            <div className="case3-zoey-station">
              <PixelPerson role="zoey" label="AGENT ZOEY" />
            </div>
            <PixelPerson
              role="intern"
              label={`${internName} - YOU`}
              position="pixel-intern-left"
            />
            <div className="case3-monitor-wall" aria-hidden="true">
              <span>ARCHIVE A-13</span>
              <strong>VISITOR WAITING</strong>
            </div>
            <div className="case-bubble case-bubble-jane case3-dialogue-bubble">
              <span className="text-sw-yellow">Agent Zoey</span>
              <p>{CASE3_INTRO_DIALOGUE[introStep]}</p>
            </div>
          </div>
          <button
            type="button"
            className="ss-btn ss-btn-cyan self-end"
            onClick={() => {
              if (introStep < CASE3_INTRO_DIALOGUE.length - 1) {
                setIntroStep((value) => value + 1)
                playSfx('click')
                return
              }
              setPhase('scenario')
            }}
          >
            {introStep === CASE3_INTRO_DIALOGUE.length - 1
              ? 'Enter Corridor'
              : 'Continue'}{' '}
            <IconArrowRight size={16} />
          </button>
        </section>
      )}

      {phase === 'scenario' && (
        <section className="case-scene scene-transition">
          <div className="case-scene-top">
            <span>SECURE ARCHIVE CORRIDOR</span>
            <span>07:39</span>
          </div>
          <div className="case-office case3-corridor-office">
            <div className="case-window case-window-left case3-door-panel">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="unit-poster unit-poster-right">
              ARCHIVE
              <br />
              A-13
            </div>
            <div className="case3-filler-frame" aria-hidden="true">
              <img src={fillerImage} alt="" />
              <span>secure archive preview</span>
            </div>
            <PixelPerson
              role="intern"
              label={`${internName} - YOU`}
              position="pixel-intern-left"
            />
            <PixelPerson
              role="jane"
              label="MARK - VISITOR BADGE"
              position="case3-mark-person"
            />
            {!scenarioChoice && (
              <div className="case-bubble case-bubble-jane case3-mark-bubble">
                <span className="text-sw-yellow">Mark</span>
                <p>{CASE3_MARK_DIALOGUE[markStep]}</p>
              </div>
            )}
            {scenarioChoice && (
              <div
                className={
                  scenarioPassed
                    ? 'success-banner case3-choice-banner'
                    : 'breach-banner case3-choice-banner'
                }
              >
                {scenarioPassed
                  ? 'Access refused - supervisor contacted'
                  : 'Door access granted'}
              </div>
            )}
          </div>
          {!scenarioChoice && markStep < CASE3_MARK_DIALOGUE.length - 1 && (
            <button
              type="button"
              className="ss-btn ss-btn-cyan self-end"
              onClick={() => {
                setMarkStep((value) => value + 1)
                playSfx('click')
              }}
            >
              Continue <IconArrowRight size={16} />
            </button>
          )}
          {!scenarioChoice && markStep === CASE3_MARK_DIALOGUE.length - 1 && (
            <div className="case2-decision-row">
              <button
                type="button"
                className="case2-decision-btn case2-flag-btn"
                onClick={() => chooseScenario('let-in')}
              >
                Let Mark In
              </button>
              <button
                type="button"
                className="case2-decision-btn case2-dismiss-btn"
                onClick={() => chooseScenario('verify')}
              >
                Refuse Entry And Call Supervisor
              </button>
            </div>
          )}
          {scenarioChoice && (
            <button
              type="button"
              className="ss-btn ss-btn-cyan self-end"
              onClick={() => setPhase('consequence')}
            >
              See Consequence <IconArrowRight size={16} />
            </button>
          )}
        </section>
      )}

      {phase === 'consequence' && (
        <section className="case-debrief scene-transition">
          <div className={scenarioPassed ? 'success-banner' : 'breach-banner'}>
            {scenarioPassed ? 'VERIFICATION WORKED' : 'ARCHIVE BREACH'}
          </div>
          <div className="ss-card p-5 flex flex-col gap-4">
            <div className="case2-ricky-panel">
              <span className="font-pixel text-sw-yellow text-xs">AGENT ZOEY</span>
              <h2 className="font-pixel text-sw-cyan text-sm">
                {scenarioPassed ? 'That was not IT' : 'You let an attacker in'}
              </h2>
              {scenarioPassed ? (
                <p>
                  The intern refuses. Agent Zoey arrives, asks for ID, and the
                  man becomes nervous. Security intercepts him before he reaches
                  the archive.
                </p>
              ) : (
                <p>
                  The archive door opens. Mark enters immediately, plugs a USB
                  device into a workstation, and files begin copying.
                </p>
              )}
              <blockquote className="zoey-quote">
                {scenarioPassed
                  ? '"That was not IT. That was a social engineer testing our doors - and our people."'
                  : '"Cadet. You did not let IT in. You let an attacker in."'}
              </blockquote>
              <blockquote className="zoey-quote">
                "Social engineers do not force doors open. They get people to
                open them for them."
              </blockquote>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CASE3_SOCIAL_ENGINEERING_SIGNS.slice(0, 5).map((point) => (
                <article key={point.title} className="red-flag-card">
                  <IconFlag size={18} />
                  <div>
                    <h3>{point.title}</h3>
                    <p>{point.text}</p>
                  </div>
                </article>
              ))}
            </div>
            <button
              type="button"
              className="ss-btn ss-btn-cyan self-start"
              onClick={() => setPhase('training')}
            >
              Open Training <IconArrowRight size={16} />
            </button>
          </div>
        </section>
      )}

      {phase === 'training' && (
        <section className="case2-board scene-transition">
          <div className="case2-board-header">
            <div>
              <span className="font-pixel text-sw-pink text-xs">UNIT ZERO TRAINING</span>
              <h2 className="font-pixel text-sw-cyan text-sm">
                What Is Social Engineering?
              </h2>
            </div>
            <div className="case2-progress-chip">TRAINING</div>
          </div>
          <article className="case2-file">
            <section className="case2-social-window">
              <div className="case2-social-window-bar">
                <span>Training visual</span>
                <span>Human firewall</span>
              </div>
              <div className="case2-veteran-post-frame">
                <img src={fillerImage} alt="" />
                <div className="case2-veteran-post-copy">
                  <strong>Attackers can hack people instead of systems.</strong>
                  <span>Trust must be verified, not assumed.</span>
                </div>
              </div>
            </section>
            <div className="case2-ricky-panel mt-3">
              <span className="font-pixel text-sw-yellow text-xs">AGENT ZOEY</span>
              <p>Social engineering is when attackers hack people instead of systems.</p>
              <p className="text-sw-text2">
                Social engineering is the use of manipulation, lies, pressure,
                trust, authority, urgency, or psychological tricks to gain
                access, information, or control.
              </p>
              <blockquote className="zoey-quote">
                "They do not need to break the lock if they can convince someone
                to open the door."
              </blockquote>
            </div>
            <div className="case2-score-grid mt-3">
              {CASE3_TRAINING_EXAMPLES.map((example) => (
                <article key={example} className="red-flag-card">
                  <IconFlag size={18} />
                  <div>
                    <h3>{example}</h3>
                    <p>
                      A small pressure point can make a helpful person skip a
                      normal security check.
                    </p>
                  </div>
                </article>
              ))}
            </div>
            <button
              type="button"
              className="ss-btn ss-btn-cyan self-start mt-3"
              onClick={() => setPhase('check')}
            >
              Start Knowledge Check <IconArrowRight size={16} />
            </button>
          </article>
        </section>
      )}

      {phase === 'check' && (
        <section className="case-debrief scene-transition">
          <div className="success-banner">SOCIAL ENGINEERING CHECK</div>
          <div className="ss-card p-5 flex flex-col gap-4">
            <div className="veteran-quiz-progress">
              Question {currentQuestion + 1} / {CASE3_KNOWLEDGE_CHECK.length}
            </div>
            <div className="case-powerup-bar">
              <span className="case-powerup-lives">
                Lives: {user?.livesRemaining ?? 0} - a wrong answer costs one
              </span>
              <button
                type="button"
                className="ss-btn ss-btn-pink text-xs"
                onClick={useHint}
                disabled={usingHint || checkAnswered || hintUsedHere}
              >
                {hintUsedHere
                  ? 'Hint used'
                  : usingHint
                    ? '…'
                    : `Use Hint (x${hintsLeft})`}
              </button>
            </div>
            {powerNotice && (
              <p className={powerNotice.ok ? 'text-sw-green' : 'text-sw-yellow'}>
                {powerNotice.text}
              </p>
            )}
            <article
              className={`veteran-quiz-card ${
                checkAnswered && selectedCheckAnswer !== activeQuestion.answer
                  ? 'veteran-quiz-shake'
                  : ''
              }`}
            >
              <h3>{activeQuestion.question}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {activeQuestion.options.map((option, optionIndex) => {
                  const selected = selectedCheckAnswer === optionIndex
                  const isCorrect = activeQuestion.answer === optionIndex
                  const eliminated =
                    hintEliminated[currentQuestion] === optionIndex
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`veteran-answer-btn ${
                        selected ? 'veteran-answer-selected' : ''
                      } ${checkAnswered && isCorrect ? 'veteran-answer-correct' : ''} ${
                        checkAnswered && selected && !isCorrect
                          ? 'veteran-answer-wrong'
                          : ''
                      } ${eliminated ? 'veteran-answer-eliminated' : ''}`}
                      onClick={() => answerCheck(currentQuestion, optionIndex)}
                      disabled={checkAnswered || eliminated}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </article>
            {checkAnswered && (
              <div
                className={
                  selectedCheckAnswer === activeQuestion.answer
                    ? 'success-banner'
                    : 'breach-banner'
                }
              >
                {selectedCheckAnswer === activeQuestion.answer
                  ? activeQuestion.feedback
                  : activeQuestion.wrongFeedback}
              </div>
            )}
            {checkAnswered && (
              <button
                type="button"
                className="ss-btn ss-btn-cyan self-start"
                onClick={
                  currentQuestion === CASE3_KNOWLEDGE_CHECK.length - 1
                    ? () => setPhase('debrief')
                    : () => setCurrentQuestion((value) => value + 1)
                }
              >
                {currentQuestion === CASE3_KNOWLEDGE_CHECK.length - 1
                  ? 'Finish Case Notes'
                  : 'Next Question'}
              </button>
            )}
          </div>
        </section>
      )}

      {phase === 'debrief' && (
        <section className="case-debrief scene-transition">
          <div className={passed ? 'success-banner' : 'breach-banner'}>
            {passed ? 'SOCIAL ENGINEERING BLOCKED' : 'ROOKIE ATTEMPT FAILED'}
          </div>
          <div className="ss-card p-5 flex flex-col gap-4">
            <div className="case2-ricky-panel">
              <span className="font-pixel text-sw-yellow text-xs">AGENT ZOEY</span>
              <h2 className="font-pixel text-sw-cyan text-sm">
                Friendly Faces Debrief
              </h2>
              <p>
                Being helpful is part of the job. Being helpful without
                verification is how an attacker turns your kindness into access.
              </p>
              <p className="text-sw-text2">
                Knowledge check score: {checkCorrect} / {CASE3_KNOWLEDGE_CHECK.length}.
                Rookie completion requires the correct corridor decision and a
                perfect knowledge check.
              </p>
              {!scenarioPassed && (
                <p className="text-sw-red">
                  Scenario failed: access was granted without verification.
                </p>
              )}
              {scenarioPassed && !checkPassed && (
                <p className="text-sw-red">
                  Knowledge check failed: Unit Zero requires 3 / 3 correct for
                  this Rookie certification.
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CASE3_SOCIAL_ENGINEERING_SIGNS.map((point) => (
                <article key={point.title} className="red-flag-card">
                  <IconFlag size={18} />
                  <div>
                    <h3>{point.title}</h3>
                    <p>{point.text}</p>
                  </div>
                </article>
              ))}
            </div>
            {passed && (
              <div className="badge-card">
                <span>Badge unlocked</span>
                <strong>HUMAN FIREWALL - BEGINNER</strong>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                className="ss-btn ss-btn-pink"
                onClick={passed ? () => finishRookie('replay') : () => spendFailureLife('replay')}
                disabled={resolvingDebrief}
              >
                Replay Scene
              </button>
              <button
                type="button"
                className="ss-btn ss-btn-cyan"
                onClick={passed ? () => finishRookie('end') : () => spendFailureLife('continue')}
                disabled={resolvingDebrief}
              >
                {passed ? 'Complete Rookie' : 'Return to Case Files'}
              </button>
            </div>
          </div>
        </section>
      )}

      {phase === 'end' && (
        <section className="ss-card p-6 flex flex-col gap-4">
          <h2 className="font-pixel text-sw-cyan text-sm">Case 03 Rookie Complete</h2>
          <p className="text-sw-text2">
            Friendly Faces closed. Rookie reward secured.
          </p>
          <PixelBadgeCard badge={badge} pointsAwarded={pointsAwarded} />
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" className="ss-btn ss-btn-cyan" onClick={() => navigate('/play')}>
              Return to Case Files
            </button>
            <button
              type="button"
              className="ss-btn ss-btn-pink"
              onClick={() => navigate('/case/3/veteran')}
            >
              Continue to Veteran Mode
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

function Case3Veteran() {
  const navigate = useNavigate()
  const { user, token, setUser } = useAuth()
  const [phase, setPhase] = useState('intro')
  const [introStep, setIntroStep] = useState(0)
  const [verificationStep, setVerificationStep] = useState(0)
  const [breachStep, setBreachStep] = useState(0)
  const [incidentChoice, setIncidentChoice] = useState(null)
  const [viewedProfile, setViewedProfile] = useState(false)
  const [judgmentAnswers, setJudgmentAnswers] = useState({})
  const [currentJudgmentIndex, setCurrentJudgmentIndex] = useState(0)
  const [route, setRoute] = useState(null)
  const [quizAnswers, setQuizAnswers] = useState(
    () => CASE3_VETERAN_QUIZ.map(() => null),
  )
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [badge, setBadge] = useState(null)
  const [pointsAwarded, setPointsAwarded] = useState(0)
  const [failureLifeSpent, setFailureLifeSpent] = useState(false)
  const [progressError, setProgressError] = useState('')
  const [resolvingDebrief, setResolvingDebrief] = useState(false)
  const resolvingRef = useRef(false)
  const failureLifeSpentRef = useRef(false)
  const internName = user?.username || 'Nova'
  const incidentPassed = incidentChoice === 'verified'
  const judgmentCorrect = CASE3_VETERAN_JUDGMENTS.reduce(
    (count, judgment) =>
      count + (judgmentAnswers[judgment.id] === judgment.answer ? 1 : 0),
    0,
  )
  const fieldPassed =
    incidentPassed && judgmentCorrect === CASE3_VETERAN_JUDGMENTS.length
  const quizCorrect = quizAnswers.reduce(
    (count, answer, index) =>
      count + (answer === CASE3_VETERAN_QUIZ[index].answer ? 1 : 0),
    0,
  )
  const quizPassed = quizSubmitted && quizCorrect >= CASE3_VETERAN_PASS_SCORE
  const passedVeteran = fieldPassed && quizPassed && route !== 'quizFailed'

  function restart() {
    setPhase('intro')
    setIntroStep(0)
    setVerificationStep(0)
    setBreachStep(0)
    setIncidentChoice(null)
    setViewedProfile(false)
    setJudgmentAnswers({})
    setCurrentJudgmentIndex(0)
    setRoute(null)
    setQuizAnswers(CASE3_VETERAN_QUIZ.map(() => null))
    setCurrentQuizQuestion(0)
    setQuizSubmitted(false)
    setBadge(null)
    setPointsAwarded(0)
    setFailureLifeSpent(false)
    setProgressError('')
    setResolvingDebrief(false)
    resolvingRef.current = false
    failureLifeSpentRef.current = false
  }

  async function spendFailureLife(nextAction) {
    if (failureLifeSpentRef.current || failureLifeSpent) {
      if (nextAction === 'replay') {
        restart()
        return
      }
      if (nextAction === 'continue') navigate('/play')
      return
    }
    if (resolvingRef.current) return
    resolvingRef.current = true
    failureLifeSpentRef.current = true
    setResolvingDebrief(true)
    setProgressError('')
    try {
      const data = await api.failAttempt(token, {
        caseId: 3,
        difficulty: 'veteran',
      })
      setUser(data.user)
      setFailureLifeSpent(true)
      playSfx('lifeLost')
      playSfx('caseFailed')
      if (nextAction === 'replay') {
        restart()
        return
      }
      if (nextAction === 'debrief') {
        resolvingRef.current = false
        setResolvingDebrief(false)
        return
      }
      navigate('/play')
    } catch (error) {
      failureLifeSpentRef.current = false
      setFailureLifeSpent(false)
      console.error('[progress] Case 3 Veteran failed attempt update failed', {
        endpoint: '/progress/fail-attempt',
        caseId: 3,
        difficulty: 'veteran',
        message: error.message,
      })
      setProgressError(error.message || 'Could not update lives.')
      resolvingRef.current = false
      setResolvingDebrief(false)
    }
  }

  async function finishVeteran(nextAction = 'end') {
    if (!passedVeteran) {
      spendFailureLife(nextAction === 'replay' ? 'replay' : 'continue')
      return
    }
    if (resolvingRef.current) return
    resolvingRef.current = true
    setResolvingDebrief(true)
    setProgressError('')
    try {
      const unlockedBadge = BADGES.humanFirewall
      const data = await api.completeCase(token, {
        caseId: 3,
        difficulty: 'veteran',
        result: 'success',
        badge: unlockedBadge,
        bonusPoints: quizCorrect * 10,
      })
      setUser(data.user)
      setBadge(unlockedBadge)
      setPointsAwarded(data.pointsAwarded)
      if (data.pointsAwarded > 0) {
        playSfx('coins')
        playSfx('badge')
      }
      playSfx('caseComplete')
      if (nextAction === 'caseFiles') {
        navigate('/play')
        return
      }
      setPhase('end')
    } catch (error) {
      console.error('[progress] Case 3 Veteran completion update failed', {
        endpoint: '/progress/complete-case',
        caseId: 3,
        difficulty: 'veteran',
        message: error.message,
      })
      setProgressError(error.message || 'Could not update case progress.')
    } finally {
      resolvingRef.current = false
      setResolvingDebrief(false)
    }
  }

  function selectIncident(action) {
    if (action === 'send-code') {
      setIncidentChoice('sent-code')
      setPhase('breach')
      playSfx('wrong')
      return
    }
    setPhase('investigate')
    playSfx('click')
  }

  function verifyWithZoey() {
    setIncidentChoice('verified')
    setVerificationStep(0)
    setPhase('verification')
    playSfx('correct')
  }

  function answerJudgment(judgmentId, value) {
    if (judgmentAnswers[judgmentId]) return
    setJudgmentAnswers((current) => ({ ...current, [judgmentId]: value }))
    playSfx('click')
  }

  function nextJudgment() {
    setCurrentJudgmentIndex((value) =>
      Math.min(value + 1, CASE3_VETERAN_JUDGMENTS.length - 1),
    )
  }

  async function submitJudgments() {
    playSfx(fieldPassed ? 'correct' : 'wrong')
    if (!fieldPassed) {
      setRoute(incidentPassed ? 'fieldFailed' : 'incidentFailed')
      setPhase('debrief')
      await spendFailureLife('debrief')
      return
    }
    setPhase('quiz')
  }

  function answerQuiz(questionIndex, optionIndex) {
    if (quizAnswers[questionIndex] !== null) return
    setQuizAnswers((current) =>
      current.map((answer, index) =>
        index === questionIndex ? optionIndex : answer,
      ),
    )
    playSfx(
      optionIndex === CASE3_VETERAN_QUIZ[questionIndex].answer
        ? 'correct'
        : 'wrong',
    )
  }

  function nextQuizQuestion() {
    setCurrentQuizQuestion((value) =>
      Math.min(value + 1, CASE3_VETERAN_QUIZ.length - 1),
    )
  }

  async function submitQuiz() {
    if (!quizSubmitted) {
      setQuizSubmitted(true)
      return
    }
    if (quizCorrect < CASE3_VETERAN_PASS_SCORE) {
      setRoute('quizFailed')
      setPhase('debrief')
      await spendFailureLife('debrief')
      return
    }
    setPhase('debrief')
  }

  const activeJudgment = CASE3_VETERAN_JUDGMENTS[currentJudgmentIndex]
  const selectedJudgment = judgmentAnswers[activeJudgment.id] || null
  const judgmentAnswered = Boolean(selectedJudgment)
  const judgmentSelectedCorrect = selectedJudgment === activeJudgment.answer
  const lastJudgment =
    currentJudgmentIndex === CASE3_VETERAN_JUDGMENTS.length - 1
  const activeQuizQuestion = CASE3_VETERAN_QUIZ[currentQuizQuestion]
  const selectedQuizAnswer = quizAnswers[currentQuizQuestion]
  const quizAnswered = selectedQuizAnswer !== null
  const quizSelectedCorrect = selectedQuizAnswer === activeQuizQuestion.answer
  const lastQuizQuestion =
    currentQuizQuestion === CASE3_VETERAN_QUIZ.length - 1

  return (
    <div className="case-shell max-w-5xl mx-auto">
      <div className="case-title-row">
        <div>
          <span className="font-pixel text-sw-pink text-xs">CASE 03 VETERAN</span>
          <h2 className="font-pixel text-sw-cyan text-sm md:text-base">
            The Insider
          </h2>
        </div>
      </div>
      {progressError && (
        <div className="ss-card p-3 text-sw-red text-sm">{progressError}</div>
      )}

      {phase === 'intro' && (
        <section className="case-scene scene-transition">
          <div className="case-scene-top">
            <span>UNIT ZERO</span>
            <span>VETERAN BRIEFING</span>
          </div>
          <div className="case-office case3-briefing-office">
            <div className="case-window case-window-left">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="case-window case-window-right">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="unit-poster unit-poster-left">
              CASE 03
              <br />
              VETERAN
            </div>
            <div className="case3-zoey-station">
              <PixelPerson role="zoey" label="AGENT ZOEY" />
            </div>
            <PixelPerson
              role="intern"
              label={`${internName} - YOU`}
              position="pixel-intern-left"
            />
            <div className="case3-monitor-wall" aria-hidden="true">
              <span>ARCHIVE DIGITISATION</span>
              <strong>INTERNAL CHAT ACTIVE</strong>
            </div>
            <div className="case-bubble case-bubble-jane case3-dialogue-bubble">
              <span className="text-sw-yellow">Agent Zoey</span>
              <p>{CASE3_VETERAN_INTRO[introStep]}</p>
            </div>
          </div>
          <button
            type="button"
            className="ss-btn ss-btn-cyan self-end"
            onClick={() => {
              if (introStep < CASE3_VETERAN_INTRO.length - 1) {
                setIntroStep((value) => value + 1)
                playSfx('click')
                return
              }
              setPhase('incident')
            }}
          >
            {introStep === CASE3_VETERAN_INTRO.length - 1
              ? 'Open Workstation'
              : 'Continue'}{' '}
            <IconArrowRight size={16} />
          </button>
        </section>
      )}

      {phase === 'incident' && (
        <section className="case2-board scene-transition">
          <div className="case2-board-header">
            <div>
              <span className="font-pixel text-sw-pink text-xs">ARCHIVE WORKSTATION</span>
              <h2 className="font-pixel text-sw-cyan text-sm">
                Internal Chat Request
              </h2>
            </div>
            <div className="case2-progress-chip">SECURE FOLDER</div>
          </div>
          <article className="case2-file">
            <section className="case2-social-window">
              <div className="case2-social-window-bar">
                <span>Unit Zero Chat</span>
                <span>Agent Harper</span>
              </div>
              <div className="case2-message-list mt-3">
                <div className="case2-message case2-post-message">
                  <div className="case2-avatar" aria-hidden="true">AH</div>
                  <div>
                    <strong>Agent Harper</strong>
                    <p>
                      Hey, Zoey said you're handling the archive project. I need
                      the access code for the secure folder. She's in a briefing
                      and I need it ASAP.
                    </p>
                  </div>
                </div>
              </div>
            </section>
            <p className="text-sw-text2 mt-3">
              The tone is professional. The name is familiar. The project is real.
            </p>
            <div className="case2-decision-row mt-4">
              <button
                type="button"
                className="case2-decision-btn case2-flag-btn"
                onClick={() => selectIncident('send-code')}
              >
                Send Access Code
              </button>
              <button
                type="button"
                className="case2-decision-btn case2-dismiss-btn"
                onClick={() => selectIncident('check-first')}
              >
                Verify Request First
              </button>
            </div>
          </article>
        </section>
      )}

      {phase === 'investigate' && (
        <section className="case2-board scene-transition">
          <div className="case2-board-header">
            <div>
              <span className="font-pixel text-sw-pink text-xs">VERIFICATION DESK</span>
              <h2 className="font-pixel text-sw-cyan text-sm">
                Choose a trusted check
              </h2>
            </div>
            <div className="case2-progress-chip">
              {viewedProfile ? 'PROFILE REVIEWED' : 'OPEN'}
            </div>
          </div>
          <article className="case2-file">
            <div className="case2-decision-row">
              <button
                type="button"
                className="case2-decision-btn"
                onClick={() => {
                  setViewedProfile(true)
                  playSfx('click')
                }}
              >
                View Harper Profile
              </button>
              <button
                type="button"
                className="case2-decision-btn case2-dismiss-btn"
                onClick={verifyWithZoey}
              >
                Call Zoey
              </button>
              <button
                type="button"
                className="case2-decision-btn case2-dismiss-btn"
                onClick={verifyWithZoey}
              >
                Message Zoey
              </button>
            </div>
            {viewedProfile && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                {CASE3_VETERAN_PROFILE_FINDINGS.map((finding) => (
                  <article key={finding.title} className="red-flag-card">
                    <IconFlag size={18} />
                    <div>
                      <h3>{finding.title}</h3>
                      <p>{finding.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </article>
        </section>
      )}

      {phase === 'verification' && (
        <section className="case-scene scene-transition">
          <div className="case-scene-top">
            <span>TRUSTED CHANNEL</span>
            <span>ZO.EY/DIRECT</span>
          </div>
          <div className="case-office case3-briefing-office">
            <div className="case3-zoey-station">
              <PixelPerson role="zoey" label="AGENT ZOEY" />
            </div>
            <PixelPerson
              role="intern"
              label={`${internName} - YOU`}
              position="pixel-intern-left"
            />
            <div className="case-bubble case-bubble-jane case3-dialogue-bubble">
              <span className="text-sw-yellow">Agent Zoey</span>
              <p>{CASE3_VETERAN_VERIFICATION[verificationStep]}</p>
            </div>
          </div>
          <button
            type="button"
            className="ss-btn ss-btn-cyan self-end"
            onClick={() => {
              if (verificationStep < CASE3_VETERAN_VERIFICATION.length - 1) {
                setVerificationStep((value) => value + 1)
                playSfx('click')
                return
              }
              setPhase('judgment')
            }}
          >
            {verificationStep === CASE3_VETERAN_VERIFICATION.length - 1
              ? 'Open Investigation Notes'
              : 'Continue'}{' '}
            <IconArrowRight size={16} />
          </button>
        </section>
      )}

      {phase === 'breach' && (
        <section className="case-glitch ss-card scene-transition">
          <div className="breach-banner">UNAUTHORISED ACCESS - ARCHIVE BREACH</div>
          <div className="case2-veteran-post-frame">
            <img src={fillerImage} alt="" />
            <div className="case2-veteran-post-copy">
              <strong>Secure folder opened from unknown session</strong>
              <span>Access code accepted. Archive copy operation started.</span>
            </div>
          </div>
          <div className="case2-ricky-panel">
            <span className="font-pixel text-sw-yellow text-xs">AGENT ZOEY</span>
            <p>{CASE3_VETERAN_BREACH[breachStep]}</p>
          </div>
          <button
            type="button"
            className="ss-btn ss-btn-cyan self-start"
            onClick={() => {
              if (breachStep < CASE3_VETERAN_BREACH.length - 1) {
                setBreachStep((value) => value + 1)
                playSfx('click')
                return
              }
              setPhase('judgment')
            }}
          >
            {breachStep === CASE3_VETERAN_BREACH.length - 1
              ? 'Open Investigation Notes'
              : 'Continue'}{' '}
            <IconArrowRight size={16} />
          </button>
        </section>
      )}

      {phase === 'judgment' && (
        <section className="case2-board scene-transition">
          <div className="case2-board-header">
            <div>
              <span className="font-pixel text-sw-pink text-xs">INSIDER REVIEW</span>
              <h2 className="font-pixel text-sw-cyan text-sm">
                Veteran Judgment Calls
              </h2>
            </div>
            <div className="case2-progress-chip">
              {currentJudgmentIndex + 1} / {CASE3_VETERAN_JUDGMENTS.length}
            </div>
          </div>
          <article
            className={`veteran-quiz-card veteran-quiz-focus ${
              judgmentAnswered && !judgmentSelectedCorrect
                ? 'veteran-quiz-shake'
                : ''
            }`}
          >
            <h3>{activeJudgment.question}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {activeJudgment.options.map((option) => {
                const selected = selectedJudgment === option.value
                const isCorrect = activeJudgment.answer === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`veteran-answer-btn ${
                      selected ? 'veteran-answer-selected' : ''
                    } ${
                      judgmentAnswered && isCorrect
                        ? 'veteran-answer-correct'
                        : ''
                    } ${
                      judgmentAnswered && selected && !isCorrect
                        ? 'veteran-answer-wrong'
                        : ''
                    }`}
                    onClick={() => answerJudgment(activeJudgment.id, option.value)}
                    disabled={judgmentAnswered}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
            {judgmentAnswered && (
              <div
                className={
                  judgmentSelectedCorrect ? 'success-banner' : 'breach-banner'
                }
              >
                {judgmentSelectedCorrect
                  ? activeJudgment.correctFeedback
                  : activeJudgment.wrongFeedback}
              </div>
            )}
            {judgmentAnswered && (
              <button
                type="button"
                className="ss-btn ss-btn-cyan self-start"
                onClick={lastJudgment ? submitJudgments : nextJudgment}
              >
                {lastJudgment ? 'Submit Investigation' : 'Next Judgment'}{' '}
                <IconArrowRight size={16} />
              </button>
            )}
          </article>
        </section>
      )}

      {phase === 'quiz' && (
        <section className="case-debrief scene-transition">
          <div className="success-banner">FINAL CERTIFICATION - HUMAN FIREWALL</div>
          <div className="ss-card p-5 flex flex-col gap-4">
            <h2 className="font-pixel text-sw-cyan text-sm">
              Case 03 final certification
            </h2>
            <p className="text-sw-text2">
              Each correct answer is worth 10 coins. Passing requires at least
              50%, so 5 or more answers closes the Veteran file.
            </p>
            {!quizSubmitted ? (
              <>
                <div className="veteran-quiz-progress">
                  Question {currentQuizQuestion + 1} / {CASE3_VETERAN_QUIZ.length}
                </div>
                <article
                  className={`veteran-quiz-card veteran-quiz-focus ${
                    quizAnswered && !quizSelectedCorrect
                      ? 'veteran-quiz-shake'
                      : ''
                  }`}
                >
                  <h3>{activeQuizQuestion.question}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {activeQuizQuestion.options.map((option, optionIndex) => {
                      const selected = selectedQuizAnswer === optionIndex
                      const isCorrect = activeQuizQuestion.answer === optionIndex
                      return (
                        <button
                          key={option}
                          type="button"
                          className={`veteran-answer-btn ${
                            selected ? 'veteran-answer-selected' : ''
                          } ${
                            quizAnswered && isCorrect
                              ? 'veteran-answer-correct'
                              : ''
                          } ${
                            quizAnswered && selected && !isCorrect
                              ? 'veteran-answer-wrong'
                              : ''
                          }`}
                          onClick={() => answerQuiz(currentQuizQuestion, optionIndex)}
                          disabled={quizAnswered}
                        >
                          {option}
                        </button>
                      )
                    })}
                  </div>
                </article>
                {quizAnswered && (
                  <div
                    className={
                      quizSelectedCorrect ? 'success-banner' : 'breach-banner'
                    }
                  >
                    {quizSelectedCorrect
                      ? 'Correct. +10 quiz coins secured.'
                      : `Correct answer: ${
                          activeQuizQuestion.options[activeQuizQuestion.answer]
                        }`}
                  </div>
                )}
                {quizAnswered && (
                  <button
                    type="button"
                    className="ss-btn ss-btn-cyan self-start"
                    onClick={lastQuizQuestion ? submitQuiz : nextQuizQuestion}
                  >
                    {lastQuizQuestion ? 'View results' : 'Next Question'}
                  </button>
                )}
              </>
            ) : (
              <>
                <div className={quizPassed ? 'success-banner' : 'breach-banner'}>
                  {quizPassed ? 'Certification passed' : 'Certification failed'}
                </div>
                <div className="veteran-results-grid">
                  <div>
                    <span>Correct</span>
                    <strong>{quizCorrect} / 10</strong>
                  </div>
                  <div>
                    <span>Quiz coins</span>
                    <strong>{quizCorrect * 10}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>{quizPassed ? 'Case can close' : 'Replay required'}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  className="ss-btn ss-btn-cyan self-start"
                  onClick={submitQuiz}
                >
                  Continue debrief
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {phase === 'debrief' && (
        <section className="case-debrief scene-transition">
          <div className={passedVeteran ? 'success-banner' : 'breach-banner'}>
            {passedVeteran ? 'CASE 03 VETERAN SECURED' : 'INSIDER REVIEW FAILED'}
          </div>
          <div className="ss-card p-5 flex flex-col gap-4">
            <div className="case2-ricky-panel">
              <span className="font-pixel text-sw-yellow text-xs">AGENT ZOEY</span>
              <h2 className="font-pixel text-sw-cyan text-sm">
                Trust is a control point
              </h2>
              <p>
                The attacker did not need to break the archive system. They used
                a believable internal story, a trusted name, and urgency to make
                you lower the control yourself.
              </p>
              <blockquote className="zoey-quote">
                "Verification is not suspicion. It is how we protect the people
                we trust from being impersonated."
              </blockquote>
            </div>
            <div className="veteran-results-grid">
              <div>
                <span>Incident</span>
                <strong>{incidentPassed ? 'Verified' : 'Code sent'}</strong>
              </div>
              <div>
                <span>Judgments</span>
                <strong>
                  {judgmentCorrect} / {CASE3_VETERAN_JUDGMENTS.length}
                </strong>
              </div>
              <div>
                <span>Quiz</span>
                <strong>{quizCorrect} / 10</strong>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CASE3_VETERAN_TEACHING_POINTS.map((point) => (
                <article key={point.title} className="red-flag-card">
                  <IconFlag size={18} />
                  <div>
                    <h3>{point.title}</h3>
                    <p>{point.text}</p>
                  </div>
                </article>
              ))}
            </div>
            {passedVeteran && (
              <div className="badge-card">
                <span>Badge unlocked</span>
                <strong>HUMAN FIREWALL</strong>
              </div>
            )}
            {route === 'incidentFailed' && (
              <p className="text-sw-text3 text-sm">
                Replay required. Sending the access code caused an archive
                breach, so the final certification stays locked.
              </p>
            )}
            {route === 'fieldFailed' && (
              <p className="text-sw-text3 text-sm">
                Replay required. Every Veteran judgment call must be correct
                before the final certification unlocks.
              </p>
            )}
            {route === 'quizFailed' && (
              <p className="text-sw-text3 text-sm">
                The final certification score was below the required 5 / 10.
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                className="ss-btn ss-btn-pink"
                onClick={
                  passedVeteran
                    ? restart
                    : failureLifeSpent
                      ? restart
                      : () => spendFailureLife('replay')
                }
                disabled={resolvingDebrief}
              >
                Replay Veteran
              </button>
              <button
                type="button"
                className="ss-btn ss-btn-cyan"
                onClick={
                  passedVeteran
                    ? () => finishVeteran('caseFiles')
                    : failureLifeSpent
                      ? () => navigate('/play')
                      : () => spendFailureLife('continue')
                }
                disabled={resolvingDebrief}
              >
                Continue to Case Files
              </button>
            </div>
          </div>
        </section>
      )}

      {phase === 'end' && (
        <section className="ss-card p-6 flex flex-col gap-4">
          <h2 className="font-pixel text-sw-cyan text-sm">
            Case 03 Veteran Complete
          </h2>
          <p className="text-sw-text2">
            The Insider closed. Quiz score: {quizCorrect}/10.
          </p>
          <PixelBadgeCard badge={badge} pointsAwarded={pointsAwarded} />
          <div className="badge-card">
            <span>Field guide unlocked</span>
            <strong>HUMAN FIREWALL</strong>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              className="ss-btn ss-btn-cyan"
              onClick={() => navigate('/play')}
            >
              Return to Case Files
            </button>
            <button type="button" className="ss-btn ss-btn-pink" onClick={restart}>
              Replay Veteran
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

function Case4Rookie() {
  const navigate = useNavigate()
  const { user, token, setUser } = useAuth()
  const [phase, setPhase] = useState('intro')
  const [introStep, setIntroStep] = useState(0)
  const [scenarioChoice, setScenarioChoice] = useState(null)
  const [outcomeStep, setOutcomeStep] = useState(0)
  const [fakePortalEmail, setFakePortalEmail] = useState('')
  const [fakePortalPassword, setFakePortalPassword] = useState('')
  const [fakePortalSubmitted, setFakePortalSubmitted] = useState(false)
  const [checkAnswers, setCheckAnswers] = useState(
    () => CASE4_KNOWLEDGE_CHECK.map(() => null),
  )
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [badge, setBadge] = useState(null)
  const [pointsAwarded, setPointsAwarded] = useState(0)
  const [failureLifeSpent, setFailureLifeSpent] = useState(false)
  const [progressError, setProgressError] = useState('')
  const [resolvingDebrief, setResolvingDebrief] = useState(false)
  const resolvingRef = useRef(false)
  const failureLifeSpentRef = useRef(false)
  const internName = user?.username || 'Nova'
  const scenarioPassed = scenarioChoice === 'mobile-hotspot'
  const checkCorrect = checkAnswers.reduce(
    (count, answer, index) =>
      count + (answer === CASE4_KNOWLEDGE_CHECK[index].answer ? 1 : 0),
    0,
  )
  const checkComplete = checkAnswers.every((answer) => answer !== null)
  const checkPassed =
    checkComplete && checkCorrect === CASE4_KNOWLEDGE_CHECK.length
  const passed = scenarioPassed && checkPassed
  const activeQuestion = CASE4_KNOWLEDGE_CHECK[currentQuestion]
  const selectedCheckAnswer = checkAnswers[currentQuestion]
  const checkAnswered = selectedCheckAnswer !== null
  const activeOutcomeDialogue = scenarioPassed
    ? CASE4_SUCCESS_DIALOGUE
    : CASE4_FAILURE_DIALOGUE

  function restart() {
    setPhase('intro')
    setIntroStep(0)
    setScenarioChoice(null)
    setOutcomeStep(0)
    setFakePortalEmail('')
    setFakePortalPassword('')
    setFakePortalSubmitted(false)
    setCheckAnswers(CASE4_KNOWLEDGE_CHECK.map(() => null))
    setCurrentQuestion(0)
    setBadge(null)
    setPointsAwarded(0)
    setFailureLifeSpent(false)
    setProgressError('')
    setResolvingDebrief(false)
    resolvingRef.current = false
    failureLifeSpentRef.current = false
  }

  function chooseScenario(choice) {
    if (scenarioChoice) return
    setScenarioChoice(choice)
    setOutcomeStep(0)
    setPhase(choice === 'rogue-wifi' ? 'fakePortal' : 'secureTransmission')
    playSfx('click')
  }

  function answerCheck(questionIndex, optionIndex) {
    if (checkAnswers[questionIndex] !== null) return
    setCheckAnswers((current) =>
      current.map((answer, index) =>
        index === questionIndex ? optionIndex : answer,
      ),
    )
    playSfx(
      optionIndex === CASE4_KNOWLEDGE_CHECK[questionIndex].answer
        ? 'correct'
        : 'wrong',
    )
  }

  async function spendFailureLife(nextAction) {
    if (failureLifeSpentRef.current || failureLifeSpent) {
      if (nextAction === 'replay') {
        restart()
        return
      }
      if (nextAction === 'continue') navigate('/play')
      return
    }
    if (resolvingRef.current) return
    resolvingRef.current = true
    failureLifeSpentRef.current = true
    setResolvingDebrief(true)
    setProgressError('')
    try {
      const data = await api.failAttempt(token, {
        caseId: 4,
        difficulty: 'rookie',
      })
      setUser(data.user)
      setFailureLifeSpent(true)
      playSfx('lifeLost')
      playSfx('caseFailed')
      if (nextAction === 'replay') {
        restart()
        return
      }
      if (nextAction === 'debrief') {
        resolvingRef.current = false
        setResolvingDebrief(false)
        return
      }
      navigate('/play')
    } catch (error) {
      failureLifeSpentRef.current = false
      setFailureLifeSpent(false)
      console.error('[progress] Case 4 failed attempt update failed', {
        endpoint: '/progress/fail-attempt',
        caseId: 4,
        difficulty: 'rookie',
        message: error.message,
      })
      setProgressError(error.message || 'Could not update lives.')
      resolvingRef.current = false
      setResolvingDebrief(false)
    }
  }

  async function finishRookie(nextAction = 'end') {
    if (!passed) {
      spendFailureLife(nextAction === 'replay' ? 'replay' : 'continue')
      return
    }
    if (resolvingRef.current) return
    resolvingRef.current = true
    setResolvingDebrief(true)
    setProgressError('')
    try {
      const unlockedBadge = BADGES.networkNavigator
      const data = await api.completeCase(token, {
        caseId: 4,
        difficulty: 'rookie',
        result: 'success',
        badge: unlockedBadge,
      })
      setUser(data.user)
      setBadge(unlockedBadge)
      setPointsAwarded(data.pointsAwarded)
      if (data.pointsAwarded > 0) {
        playSfx('coins')
        playSfx('badge')
      }
      playSfx('caseComplete')
      if (nextAction === 'caseFiles') {
        navigate('/play')
        return
      }
      setPhase('end')
    } catch (error) {
      console.error('[progress] Case 4 completion update failed', {
        endpoint: '/progress/complete-case',
        caseId: 4,
        difficulty: 'rookie',
        message: error.message,
      })
      setProgressError(error.message || 'Could not update case progress.')
    } finally {
      resolvingRef.current = false
      setResolvingDebrief(false)
    }
  }

  async function finishCheck() {
    setPhase('debrief')
    if (!passed) await spendFailureLife('debrief')
  }

  return (
    <div className="case-shell max-w-5xl mx-auto">
      <div className="case-title-row">
        <div>
          <span className="font-pixel text-sw-pink text-xs">CASE 04 ROOKIE</span>
          <h2 className="font-pixel text-sw-cyan text-sm md:text-base">
            The Hotspot
          </h2>
        </div>
      </div>
      {progressError && (
        <div className="ss-card p-3 text-sw-red text-sm">{progressError}</div>
      )}

      {phase === 'intro' && (
        <section className="case-scene scene-transition">
          <div className="case-scene-top">
            <span>UNIT ZERO</span>
            <span>FIELD BRIEFING</span>
          </div>
          <div className="case-office case3-briefing-office">
            <div className="case-window case-window-left">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="case-window case-window-right">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="unit-poster unit-poster-left">
              CASE 04
              <br />
              THE HOTSPOT
            </div>
            <div className="case3-zoey-station">
              <PixelPerson role="jane" label="AGENT RICKY" />
            </div>
            <PixelPerson
              role="intern"
              label={`${internName} - YOU`}
              position="pixel-intern-left"
            />
            <div className="case3-monitor-wall" aria-hidden="true">
              <span>OXFORD CIRCUS</span>
              <strong>ROGUE WI-FI REPORT</strong>
            </div>
            <div className="case-bubble case-bubble-jane case3-dialogue-bubble">
              <span className="text-sw-yellow">Agent Ricky</span>
              <p>{CASE4_ROOKIE_INTRO[introStep]}</p>
            </div>
          </div>
          <button
            type="button"
            className="ss-btn ss-btn-cyan self-end"
            onClick={() => {
              if (introStep < CASE4_ROOKIE_INTRO.length - 1) {
                setIntroStep((value) => value + 1)
                playSfx('click')
                return
              }
              setPhase('station')
            }}
          >
            {introStep === CASE4_ROOKIE_INTRO.length - 1
              ? 'Enter Station'
              : 'Continue'}{' '}
            <IconArrowRight size={16} />
          </button>
        </section>
      )}

      {phase === 'station' && (
        <section className="case2-board scene-transition">
          <div className="case2-board-header">
            <div>
              <span className="font-pixel text-sw-pink text-xs">
                OXFORD CIRCUS TUBE STATION
              </span>
              <h2 className="font-pixel text-sw-cyan text-sm">
                The Open Gate
              </h2>
            </div>
            <div className="case2-progress-chip">FIELD UPLOAD</div>
          </div>
          <article className="case2-file">
            <section className="case2-social-window">
              <div className="case2-social-window-bar">
                <span>Station camera</span>
                <span>Central Line crowding</span>
              </div>
              <div className="case2-veteran-post-frame">
                <img src={oxfordCircusStationImage} alt="" />
                <div className="case2-veteran-post-copy">
                  <strong>Commuters move past announcements and arriving trains.</strong>
                  <span>Your laptop needs a network to upload the field report.</span>
                </div>
              </div>
            </section>
            <div className="case2-ricky-panel mt-3">
              <span className="font-pixel text-sw-yellow text-xs">AVAILABLE WI-FI</span>
              <div className="case2-score-grid mt-2">
                {CASE4_WIFI_NETWORKS.map((network) => (
                  <article
                    key={network.name}
                    className={`red-flag-card case4-wifi-card ${
                      network.secure ? 'case4-wifi-secure' : 'case4-wifi-open'
                    }`}
                  >
                    <span className="case4-wifi-lock" aria-hidden="true">
                      {network.secure ? 'LOCK' : 'OPEN'}
                    </span>
                    <div>
                      <h3>{network.name}</h3>
                      <p>{network.status}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="case2-decision-row mt-4">
              <button
                type="button"
                className="case2-decision-btn case2-flag-btn"
                onClick={() => chooseScenario('rogue-wifi')}
              >
                Connect to FREE_TUBE_WIFI_123
              </button>
              <button
                type="button"
                className="case2-decision-btn case2-dismiss-btn"
                onClick={() => chooseScenario('mobile-hotspot')}
              >
                Use Mobile Hotspot
              </button>
            </div>
          </article>
        </section>
      )}

      {phase === 'fakePortal' && (
        <section className="case-debrief scene-transition">
          <div className="breach-banner">TUBE WI-FI REQUIRES VERIFICATION</div>
          <div className="ss-card p-5 flex flex-col gap-4">
            <div className="case4-fake-portal">
              <span className="font-pixel text-sw-yellow text-xs">LOGIN PORTAL</span>
              <h2 className="font-pixel text-sw-cyan text-sm">
                Public Access Verification
              </h2>
              <p className="text-sw-text2">
                Tube Wi-Fi requires verification. Please log in to continue.
              </p>
              <div className="case4-portal-visual" aria-hidden="true">
                <div className="case4-portal-router">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="case4-portal-waves">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              {!fakePortalSubmitted ? (
                <>
                  <label className="case4-portal-field">
                    <span>Unit Zero email</span>
                    <input
                      type="text"
                      value={fakePortalEmail}
                      placeholder="Unit Zero email"
                      autoComplete="off"
                      onChange={(event) => setFakePortalEmail(event.target.value)}
                    />
                  </label>
                  <label className="case4-portal-field">
                    <span>Password</span>
                    <input
                      type="password"
                      value={fakePortalPassword}
                      placeholder="Password"
                      autoComplete="off"
                      onChange={(event) => setFakePortalPassword(event.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    className="ss-btn ss-btn-pink self-start"
                    disabled={!fakePortalEmail.trim() || !fakePortalPassword.trim()}
                    onClick={() => {
                      setFakePortalSubmitted(true)
                      playSfx('click')
                    }}
                  >
                    Submit Verification
                  </button>
                </>
              ) : (
                <>
                  <div className="success-banner mt-3">Verification Complete</div>
                  <div className="case4-upload-glitch" aria-live="polite">
                    <div className="case4-upload-label">
                      <span>FIELD REPORT UPLOAD</span>
                      <strong>0%</strong>
                    </div>
                    <div className="case4-upload-track">
                      <span />
                    </div>
                    <div className="case4-warning-scan">
                      UNKNOWN RELAY DETECTED
                    </div>
                    <p>Credentials transmitted... Upload stalled.</p>
                  </div>
                </>
              )}
            </div>
            {fakePortalSubmitted && (
              <button
                type="button"
                className="ss-btn ss-btn-cyan self-start"
                onClick={() => {
                  playSfx('wrong')
                  setPhase('outcome')
                }}
              >
                A few moments later <IconArrowRight size={16} />
              </button>
            )}
          </div>
        </section>
      )}

      {phase === 'secureTransmission' && (
        <section className="case-debrief scene-transition">
          <div className="success-banner">SECURE UPLOAD CHANNEL</div>
          <div className="ss-card p-5 flex flex-col gap-4">
            <div className="case4-transmission-panel" aria-live="polite">
              <div className="case4-transmission-header">
                <span>UNIT ZERO FIELD UPLINK</span>
                <strong>SECURE</strong>
              </div>
              <div className="case4-transmission-grid" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="case4-transmission-status">
                <span>SECURE CHANNEL ESTABLISHED</span>
                <span>ENCRYPTION ACTIVE</span>
                <span>FIELD REPORT TRANSMITTING...</span>
                <span>TRANSMISSION COMPLETE</span>
              </div>
              <div className="case4-transmission-track">
                <span />
              </div>
              <div className="case4-packet-stream" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>
            <button
              type="button"
              className="ss-btn ss-btn-cyan self-start"
              onClick={() => {
                playSfx('pickup')
                setPhase('outcome')
              }}
            >
              Confirm Transmission <IconArrowRight size={16} />
            </button>
          </div>
        </section>
      )}

      {phase === 'outcome' && (
        <section className="case-scene scene-transition">
          <div className="case-scene-top">
            <span>{scenarioPassed ? 'UPLOAD COMPLETE' : 'INCOMING CALL'}</span>
            <span>AGENT RICKY</span>
          </div>
          <div className="case-office case3-corridor-office">
            <div className="case4-outcome-visual" aria-hidden="true">
              <div className="case4-outcome-laptop">
                <span />
              </div>
              <div
                className={
                  scenarioPassed
                    ? 'case4-outcome-signal case4-outcome-signal-safe'
                    : 'case4-outcome-signal case4-outcome-signal-danger'
                }
              >
                <span />
                <span />
                <span />
              </div>
              {!scenarioPassed && <div className="case4-attacker-device" />}
              <span>{scenarioPassed ? 'field report uploaded' : 'rogue hotspot alert'}</span>
            </div>
            <PixelPerson
              role="intern"
              label={`${internName} - YOU`}
              position="pixel-intern-left"
            />
            <div className="case4-ricky-station">
              <PixelPerson role="jane" label="AGENT RICKY" />
            </div>
            <div className="case-bubble case-bubble-jane case4-ricky-bubble">
              <span className="text-sw-yellow">Agent Ricky</span>
              <p>{activeOutcomeDialogue[outcomeStep]}</p>
            </div>
            {scenarioPassed && (
              <div className="success-banner case3-choice-banner">
                Nearby attacker frustrated - upload secured
              </div>
            )}
            {!scenarioPassed && (
              <div className="breach-banner case3-choice-banner">
                Rogue hotspot confirmed - credentials exposed
              </div>
            )}
          </div>
          <button
            type="button"
            className="ss-btn ss-btn-cyan self-end"
            onClick={() => {
              if (outcomeStep < activeOutcomeDialogue.length - 1) {
                setOutcomeStep((value) => value + 1)
                playSfx('click')
                return
              }
              setPhase('training')
            }}
          >
            {outcomeStep === activeOutcomeDialogue.length - 1
              ? 'Open Training'
              : 'Continue'}{' '}
            <IconArrowRight size={16} />
          </button>
        </section>
      )}

      {phase === 'training' && (
        <section className="case2-board scene-transition">
          <div className="case2-board-header">
            <div>
              <span className="font-pixel text-sw-pink text-xs">UNIT ZERO TRAINING</span>
              <h2 className="font-pixel text-sw-cyan text-sm">
                What Are Public Wi-Fi Threats?
              </h2>
            </div>
            <div className="case2-progress-chip">TRAINING</div>
          </div>
          <article className="case2-file">
            <section className="case2-social-window">
              <div className="case2-social-window-bar">
                <span>Training visual</span>
                <span>Rogue hotspot</span>
              </div>
              <div className="case2-veteran-post-frame">
                <img src={publicWifiThreatsImage} alt="" />
                <div className="case2-veteran-post-copy">
                  <strong>Fake networks can look useful, local, and free.</strong>
                  <span>Unknown public Wi-Fi should be treated as untrusted.</span>
                </div>
              </div>
            </section>
            <div className="case2-ricky-panel mt-3">
              <span className="font-pixel text-sw-yellow text-xs">AGENT RICKY</span>
              <p>"Let's break down what you just avoided."</p>
              <p className="text-sw-text2">
                Public Wi-Fi threats happen when attackers create fake networks
                or intercept traffic on open networks to steal information.
              </p>
              <blockquote className="zoey-quote">
                "Free Wi-Fi is never really free. Someone usually pays for it."
              </blockquote>
            </div>
            <div className="case2-score-grid mt-3">
              {CASE4_PUBLIC_WIFI_TOPICS.map((topic) => (
                <article key={topic.title} className="red-flag-card">
                  <IconFlag size={18} />
                  <div>
                    <h3>{topic.title}</h3>
                    <p>{topic.text}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="case2-score-grid mt-3">
              {CASE4_WIFI_TEACHING_POINTS.map((point) => (
                <article key={point.title} className="red-flag-card">
                  <IconFlag size={18} />
                  <div>
                    <h3>{point.title}</h3>
                    <p>{point.text}</p>
                  </div>
                </article>
              ))}
            </div>
            <button
              type="button"
              className="ss-btn ss-btn-cyan self-start mt-3"
              onClick={() => setPhase('check')}
            >
              Start Knowledge Check <IconArrowRight size={16} />
            </button>
          </article>
        </section>
      )}

      {phase === 'check' && (
        <section className="case-debrief scene-transition">
          <div className="success-banner">PUBLIC WI-FI CHECK</div>
          <div className="ss-card p-5 flex flex-col gap-4">
            <div className="veteran-quiz-progress">
              Question {currentQuestion + 1} / {CASE4_KNOWLEDGE_CHECK.length}
            </div>
            <article
              className={`veteran-quiz-card ${
                checkAnswered && selectedCheckAnswer !== activeQuestion.answer
                  ? 'veteran-quiz-shake'
                  : ''
              }`}
            >
              <h3>{activeQuestion.question}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {activeQuestion.options.map((option, optionIndex) => {
                  const selected = selectedCheckAnswer === optionIndex
                  const isCorrect = activeQuestion.answer === optionIndex
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`veteran-answer-btn ${
                        selected ? 'veteran-answer-selected' : ''
                      } ${checkAnswered && isCorrect ? 'veteran-answer-correct' : ''} ${
                        checkAnswered && selected && !isCorrect
                          ? 'veteran-answer-wrong'
                          : ''
                      }`}
                      onClick={() => answerCheck(currentQuestion, optionIndex)}
                      disabled={checkAnswered}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </article>
            {checkAnswered && (
              <div
                className={
                  selectedCheckAnswer === activeQuestion.answer
                    ? 'success-banner'
                    : 'breach-banner'
                }
              >
                {selectedCheckAnswer === activeQuestion.answer
                  ? activeQuestion.feedback
                  : activeQuestion.wrongFeedback}
              </div>
            )}
            {checkAnswered && (
              <button
                type="button"
                className="ss-btn ss-btn-cyan self-start"
                onClick={
                  currentQuestion === CASE4_KNOWLEDGE_CHECK.length - 1
                    ? finishCheck
                    : () => setCurrentQuestion((value) => value + 1)
                }
                disabled={resolvingDebrief}
              >
                {currentQuestion === CASE4_KNOWLEDGE_CHECK.length - 1
                  ? 'Finish Field Notes'
                  : 'Next Question'}
              </button>
            )}
          </div>
        </section>
      )}

      {phase === 'debrief' && (
        <section className="case-debrief scene-transition">
          <div className={passed ? 'success-banner' : 'breach-banner'}>
            {passed ? 'PUBLIC WI-FI TRAP AVOIDED' : 'ROOKIE ATTEMPT FAILED'}
          </div>
          <div className="ss-card p-5 flex flex-col gap-4">
            <div className="case2-ricky-panel">
              <span className="font-pixel text-sw-yellow text-xs">AGENT RICKY</span>
              <h2 className="font-pixel text-sw-cyan text-sm">
                The Hotspot Debrief
              </h2>
              <p>
                Rogue hotspots win by looking convenient. A familiar name, a
                free connection, and a fake login page can turn a commute into a
                credential theft incident.
              </p>
              <p className="text-sw-text2">
                Knowledge check score: {checkCorrect} / {CASE4_KNOWLEDGE_CHECK.length}.
                Rookie completion requires using the mobile hotspot and scoring
                3 / 3 on the knowledge check.
              </p>
              {!scenarioPassed && (
                <p className="text-sw-red">
                  Scenario failed: FREE_TUBE_WIFI_123 was a rogue hotspot.
                </p>
              )}
              {scenarioPassed && !checkPassed && (
                <p className="text-sw-red">
                  Knowledge check failed: public Wi-Fi safety requires every
                  answer correct for this Rookie certification.
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[...CASE4_PUBLIC_WIFI_TOPICS, ...CASE4_WIFI_TEACHING_POINTS].map(
                (point) => (
                  <article key={point.title} className="red-flag-card">
                    <IconFlag size={18} />
                    <div>
                      <h3>{point.title}</h3>
                      <p>{point.text}</p>
                    </div>
                  </article>
                ),
              )}
            </div>
            {passed && (
              <div className="badge-card">
                <span>Badge unlocked</span>
                <strong>NETWORK NAVIGATOR</strong>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                className="ss-btn ss-btn-pink"
                onClick={
                  passed
                    ? () => finishRookie('replay')
                    : failureLifeSpent
                      ? restart
                      : () => spendFailureLife('replay')
                }
                disabled={resolvingDebrief}
              >
                Replay Scene
              </button>
              <button
                type="button"
                className="ss-btn ss-btn-cyan"
                onClick={
                  passed
                    ? () => finishRookie('end')
                    : failureLifeSpent
                      ? () => navigate('/play')
                      : () => spendFailureLife('continue')
                }
                disabled={resolvingDebrief}
              >
                {passed ? 'Complete Rookie' : 'Return to Case Files'}
              </button>
            </div>
          </div>
        </section>
      )}

      {phase === 'end' && (
        <section className="ss-card p-6 flex flex-col gap-4">
          <h2 className="font-pixel text-sw-cyan text-sm">Case 04 Rookie Complete</h2>
          <p className="text-sw-text2">
            The Hotspot closed. Rookie reward secured.
          </p>
          <PixelBadgeCard badge={badge} pointsAwarded={pointsAwarded} />
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" className="ss-btn ss-btn-cyan" onClick={() => navigate('/play')}>
              Return to Case Files
            </button>
            <button
              type="button"
              className="ss-btn ss-btn-pink"
              onClick={() => navigate('/case/4/veteran')}
            >
              Continue to Veteran Mode
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

function Case4Veteran() {
  const navigate = useNavigate()
  const { user, token, setUser } = useAuth()
  const [phase, setPhase] = useState('intro')
  const [introStep, setIntroStep] = useState(0)
  const [inspected, setInspected] = useState({})
  const [selectedNetwork, setSelectedNetwork] = useState(null)
  const [incidentAction, setIncidentAction] = useState(null)
  const [actionFeedback, setActionFeedback] = useState(null)
  const [malwareInstalled, setMalwareInstalled] = useState(false)
  const [judgmentAnswers, setJudgmentAnswers] = useState({})
  const [currentJudgmentIndex, setCurrentJudgmentIndex] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState(
    () => CASE4_VETERAN_QUIZ.map(() => null),
  )
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [route, setRoute] = useState(null)
  const [badge, setBadge] = useState(null)
  const [pointsAwarded, setPointsAwarded] = useState(0)
  const [failureLifeSpent, setFailureLifeSpent] = useState(false)
  const [progressError, setProgressError] = useState('')
  const [resolvingDebrief, setResolvingDebrief] = useState(false)
  const resolvingRef = useRef(false)
  const failureLifeSpentRef = useRef(false)
  const internName = user?.username || 'Nova'
  const activeIntro = CASE4_VETERAN_INTRO[introStep]
  const activeNetwork =
    CASE4_VETERAN_NETWORKS.find((network) => network.id === selectedNetwork) ||
    CASE4_VETERAN_NETWORKS[0]
  const incidentPassed =
    incidentAction === 'flag' && selectedNetwork === 'mall-guest-free'
  const judgmentCorrect = CASE4_VETERAN_JUDGMENTS.reduce(
    (count, item) => count + (judgmentAnswers[item.id] === item.answer ? 1 : 0),
    0,
  )
  const judgmentComplete = CASE4_VETERAN_JUDGMENTS.every(
    (item) => judgmentAnswers[item.id],
  )
  const fieldPassed =
    judgmentComplete && judgmentCorrect === CASE4_VETERAN_JUDGMENTS.length
  const quizCorrect = quizAnswers.reduce(
    (count, answer, index) =>
      count + (answer === CASE4_VETERAN_QUIZ[index].answer ? 1 : 0),
    0,
  )
  const quizPassed = quizSubmitted && quizCorrect >= CASE4_VETERAN_PASS_SCORE
  const passedVeteran = incidentPassed && fieldPassed && quizPassed
  const activeJudgment = CASE4_VETERAN_JUDGMENTS[currentJudgmentIndex]
  const selectedJudgment = judgmentAnswers[activeJudgment.id] || null
  const judgmentAnswered = Boolean(selectedJudgment)
  const judgmentSelectedCorrect = selectedJudgment === activeJudgment.answer
  const lastJudgment =
    currentJudgmentIndex === CASE4_VETERAN_JUDGMENTS.length - 1
  const activeQuizQuestion = CASE4_VETERAN_QUIZ[currentQuizQuestion]
  const selectedQuizAnswer = quizAnswers[currentQuizQuestion]
  const quizAnswered = selectedQuizAnswer !== null
  const quizSelectedCorrect = selectedQuizAnswer === activeQuizQuestion.answer
  const lastQuizQuestion =
    currentQuizQuestion === CASE4_VETERAN_QUIZ.length - 1

  function restart() {
    setPhase('intro')
    setIntroStep(0)
    setInspected({})
    setSelectedNetwork(null)
    setIncidentAction(null)
    setActionFeedback(null)
    setMalwareInstalled(false)
    setJudgmentAnswers({})
    setCurrentJudgmentIndex(0)
    setQuizAnswers(CASE4_VETERAN_QUIZ.map(() => null))
    setCurrentQuizQuestion(0)
    setQuizSubmitted(false)
    setRoute(null)
    setBadge(null)
    setPointsAwarded(0)
    setFailureLifeSpent(false)
    setProgressError('')
    setResolvingDebrief(false)
    resolvingRef.current = false
    failureLifeSpentRef.current = false
  }

  async function spendFailureLife(nextAction) {
    if (failureLifeSpentRef.current || failureLifeSpent) {
      if (nextAction === 'replay') {
        restart()
        return
      }
      if (nextAction === 'continue') navigate('/play')
      return
    }
    if (resolvingRef.current) return
    resolvingRef.current = true
    failureLifeSpentRef.current = true
    setResolvingDebrief(true)
    setProgressError('')
    try {
      const data = await api.failAttempt(token, {
        caseId: 4,
        difficulty: 'veteran',
      })
      setUser(data.user)
      setFailureLifeSpent(true)
      playSfx('lifeLost')
      playSfx('caseFailed')
      if (nextAction === 'replay') {
        restart()
        return
      }
      if (nextAction === 'debrief') {
        resolvingRef.current = false
        setResolvingDebrief(false)
        return
      }
      navigate('/play')
    } catch (error) {
      failureLifeSpentRef.current = false
      setFailureLifeSpent(false)
      console.error('[progress] Case 4 Veteran failed attempt update failed', {
        endpoint: '/progress/fail-attempt',
        caseId: 4,
        difficulty: 'veteran',
        message: error.message,
      })
      setProgressError(error.message || 'Could not update lives.')
      resolvingRef.current = false
      setResolvingDebrief(false)
    }
  }

  async function finishVeteran(nextAction = 'end') {
    if (!passedVeteran) {
      spendFailureLife(nextAction === 'replay' ? 'replay' : 'continue')
      return
    }
    if (resolvingRef.current) return
    resolvingRef.current = true
    setResolvingDebrief(true)
    setProgressError('')
    try {
      const unlockedBadge = BADGES.networkNavigator
      const data = await api.completeCase(token, {
        caseId: 4,
        difficulty: 'veteran',
        result: 'success',
        badge: unlockedBadge,
        bonusPoints: quizCorrect * 10,
      })
      setUser(data.user)
      setBadge(unlockedBadge)
      setPointsAwarded(data.pointsAwarded)
      if (data.pointsAwarded > 0) {
        playSfx('coins')
        playSfx('badge')
      }
      playSfx('caseComplete')
      if (nextAction === 'caseFiles') {
        navigate('/play')
        return
      }
      setPhase('end')
    } catch (error) {
      console.error('[progress] Case 4 Veteran completion update failed', {
        endpoint: '/progress/complete-case',
        caseId: 4,
        difficulty: 'veteran',
        message: error.message,
      })
      setProgressError(error.message || 'Could not update case progress.')
    } finally {
      resolvingRef.current = false
      setResolvingDebrief(false)
    }
  }

  function inspectTool(tool) {
    setInspected((current) => ({ ...current, [tool]: true }))
    playSfx('click')
  }

  function chooseAction(action) {
    if (!selectedNetwork) return
    const network = CASE4_VETERAN_NETWORKS.find(
      (item) => item.id === selectedNetwork,
    )
    if (!network?.malicious) {
      if (action === 'ignore') {
        setActionFeedback({
          tone: 'neutral',
          title: 'NO ACTIVE THREAT FOUND',
          message:
            'No active threat found on this network. Continue investigation and compare the remaining access points.',
        })
        setPhase('networkFeedback')
        playSfx('click')
        return
      }
      if (action === 'connect') {
        setActionFeedback({
          tone: 'caution',
          title: 'CONNECTION TEST COMPLETED',
          message:
            'Connection test completed, but Unit Zero policy discourages connecting unnecessarily. Continue analysis.',
        })
        setPhase('networkFeedback')
        playSfx('click')
        return
      }
      setIncidentAction('flag-safe')
      setPhase('flagged')
      playSfx('wrong')
      return
    }
    setIncidentAction(action)
    if (action === 'connect') {
      setPhase('malware')
      playSfx('wrong')
      return
    }
    if (action === 'ignore') {
      setPhase('ignored')
      playSfx('wrong')
      return
    }
    setPhase('flagged')
    playSfx(selectedNetwork === 'mall-guest-free' ? 'correct' : 'wrong')
  }

  function answerJudgment(judgmentId, value) {
    if (judgmentAnswers[judgmentId]) return
    setJudgmentAnswers((current) => ({ ...current, [judgmentId]: value }))
    const judgment = CASE4_VETERAN_JUDGMENTS.find((item) => item.id === judgmentId)
    playSfx(value === judgment.answer ? 'correct' : 'wrong')
  }

  function nextJudgment() {
    setCurrentJudgmentIndex((value) =>
      Math.min(value + 1, CASE4_VETERAN_JUDGMENTS.length - 1),
    )
  }

  async function submitJudgments() {
    playSfx(incidentPassed && fieldPassed ? 'correct' : 'wrong')
    if (!incidentPassed || !fieldPassed) {
      const investigationRoute =
        incidentAction === 'flag-safe'
          ? 'wrongFlag'
          : incidentAction === 'ignore'
            ? 'ignoredThreat'
            : incidentAction === 'connect'
              ? 'connectedThreat'
              : 'incidentFailed'
      setRoute(!incidentPassed ? investigationRoute : 'fieldFailed')
      setPhase('failureSequence')
      await spendFailureLife('debrief')
      return
    }
    setPhase('quiz')
  }

  function answerQuiz(questionIndex, optionIndex) {
    if (quizAnswers[questionIndex] !== null) return
    setQuizAnswers((current) =>
      current.map((answer, index) =>
        index === questionIndex ? optionIndex : answer,
      ),
    )
    playSfx(
      optionIndex === CASE4_VETERAN_QUIZ[questionIndex].answer
        ? 'correct'
        : 'wrong',
    )
  }

  function nextQuizQuestion() {
    setCurrentQuizQuestion((value) =>
      Math.min(value + 1, CASE4_VETERAN_QUIZ.length - 1),
    )
  }

  async function submitQuiz() {
    if (!quizSubmitted) {
      setQuizSubmitted(true)
      return
    }
    if (quizCorrect < CASE4_VETERAN_PASS_SCORE) {
      setRoute('quizFailed')
      setPhase('debrief')
      await spendFailureLife('debrief')
      return
    }
    setPhase('debrief')
  }

  return (
    <div className="case-shell max-w-5xl mx-auto">
      <div className="case-title-row">
        <div>
          <span className="font-pixel text-sw-pink text-xs">CASE 04 VETERAN</span>
          <h2 className="font-pixel text-sw-cyan text-sm md:text-base">
            The Silent Listener
          </h2>
        </div>
      </div>
      {progressError && (
        <div className="ss-card p-3 text-sw-red text-sm">{progressError}</div>
      )}

      {phase === 'intro' && (
        <section className="case-scene scene-transition">
          <div className="case-scene-top">
            <span>UNIT ZERO NETWORK OPS</span>
            <span>VETERAN BRIEFING</span>
          </div>
          <div className="case-office case3-briefing-office">
            <div className="case-window case-window-left">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="case-window case-window-right">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="unit-poster unit-poster-left">
              CASE 04
              <br />
              VETERAN
            </div>
            <div
              className={`case4-veteran-ricky-station ${
                activeIntro.speaker === 'Agent Ricky' ? 'active-speaker' : ''
              }`}
            >
              <PixelPerson role="jane" label="AGENT RICKY" />
            </div>
            <div
              className={`case4-veteran-zoey-station ${
                activeIntro.speaker === 'Agent Zoey' ? 'active-speaker' : ''
              }`}
            >
              <PixelPerson role="zoey" label="AGENT ZOEY" />
            </div>
            <PixelPerson
              role="intern"
              label={`${internName} - YOU`}
              position="pixel-intern-left"
            />
            <div className="case3-monitor-wall" aria-hidden="true">
              <span>SHOPPING MALL AP GRID</span>
              <strong>LIVE NETWORK DATA</strong>
            </div>
            <div className="case-bubble case-bubble-jane case3-dialogue-bubble">
              <span className="text-sw-yellow">{activeIntro.speaker}</span>
              <p>{activeIntro.text}</p>
            </div>
          </div>
          <button
            type="button"
            className="ss-btn ss-btn-cyan self-end"
            onClick={() => {
              if (introStep < CASE4_VETERAN_INTRO.length - 1) {
                setIntroStep((value) => value + 1)
                playSfx('click')
                return
              }
              setPhase('scan')
            }}
          >
            {introStep === CASE4_VETERAN_INTRO.length - 1
              ? 'Open Network Scanner'
              : 'Continue'}{' '}
            <IconArrowRight size={16} />
          </button>
        </section>
      )}

      {phase === 'scan' && (
        <section className="case2-board scene-transition">
          <div className="case2-board-header">
            <div>
              <span className="font-pixel text-sw-pink text-xs">MALL ACCESS POINT MAP</span>
              <h2 className="font-pixel text-sw-cyan text-sm">Live Network Analysis</h2>
            </div>
            <div className="case2-progress-chip">PACKET TRACE RUNNING</div>
          </div>
          <article className="case2-file">
            <p className="text-sw-text2 mb-3">
              Select a network first, then run the analysis tools. Decision
              controls unlock after a network is selected.
            </p>
            <div className="case4-veteran-scanner">
              {CASE4_VETERAN_NETWORKS.map((network) => {
                const selected = selectedNetwork === network.id
                return (
                  <button
                    key={network.id}
                    type="button"
                    className={`case4-veteran-network ${selected ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedNetwork(network.id)
                      setInspected({})
                      setActionFeedback(null)
                      playSfx('click')
                    }}
                  >
                    <span className={network.encryption === 'Open' ? 'open' : 'locked'}>
                      {network.encryption === 'Open' ? 'OPEN' : 'LOCK'}
                    </span>
                    <strong>{network.name}</strong>
                    <em>Signal detected</em>
                    <div className="case4-wifi-rings" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="case4-tool-grid mt-4">
              {[
                ['encryption', 'Encryption Type'],
                ['mac', 'MAC Address Trace'],
                ['signal', 'Signal Strength'],
                ['traffic', 'Traffic Logs'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`case4-tool-btn ${inspected[id] ? 'active' : ''}`}
                  onClick={() => inspectTool(id)}
                  disabled={!selectedNetwork}
                >
                  {inspected[id] ? 'ANALYSED' : 'ANALYSE'} - {label}
                </button>
              ))}
            </div>

            {!selectedNetwork && (
              <div className="case2-progress-chip mt-3">
                SELECT A NETWORK TO ENABLE ANALYSIS TOOLS
              </div>
            )}

            {selectedNetwork && (
              <div className="case4-analysis-console mt-4">
                <div className="case4-analysis-header">
                  <span>{activeNetwork.name}</span>
                  <strong>SCAN WINDOW ACTIVE</strong>
                </div>
                <div className="case4-analysis-grid">
                  <article className={inspected.encryption ? 'visible' : ''}>
                    <span>Encryption</span>
                    <strong>
                      {inspected.encryption ? activeNetwork.encryption : 'Awaiting analysis'}
                    </strong>
                  </article>
                  <article className={inspected.mac ? 'visible' : ''}>
                    <span>MAC trace</span>
                    <strong
                      className={
                        inspected.mac && activeNetwork.malicious
                          ? 'case4-mac-flicker'
                          : ''
                      }
                    >
                      {inspected.mac ? activeNetwork.mac : 'Awaiting analysis'}
                    </strong>
                  </article>
                  <article className={inspected.signal ? 'visible' : ''}>
                    <span>Signal</span>
                    <strong>
                      {inspected.signal ? activeNetwork.signal : 'Awaiting analysis'}
                    </strong>
                  </article>
                  <article className={inspected.traffic ? 'visible' : ''}>
                    <span>Traffic</span>
                    <strong>
                      {inspected.traffic ? activeNetwork.traffic : 'Awaiting analysis'}
                    </strong>
                  </article>
                </div>
                <div className="case4-traffic-chart" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <p className="text-sw-text2">
                  {inspected.traffic
                    ? activeNetwork.deviceNames
                    : 'Run traffic logs to reveal device metadata.'}
                </p>
                {Object.keys(inspected).length >= 4 && (
                  <div className="case4-registry-note">
                    {activeNetwork.registry}
                  </div>
                )}
              </div>
            )}

            <div className="case2-decision-row mt-4">
              <button
                type="button"
                className="case2-decision-btn case2-dismiss-btn"
                onClick={() => chooseAction('flag')}
                disabled={!selectedNetwork}
              >
                Flag Network As Malicious
              </button>
              <button
                type="button"
                className="case2-decision-btn"
                onClick={() => chooseAction('ignore')}
                disabled={!selectedNetwork}
              >
                Ignore It
              </button>
              <button
                type="button"
                className="case2-decision-btn case2-flag-btn"
                onClick={() => chooseAction('connect')}
                disabled={!selectedNetwork}
              >
                Attempt To Connect For Testing
              </button>
            </div>
          </article>
        </section>
      )}

      {phase === 'networkFeedback' && actionFeedback && (
        <section className="case-debrief scene-transition">
          <div
            className={
              actionFeedback.tone === 'neutral'
                ? 'success-banner'
                : 'case4-caution-banner'
            }
          >
            {actionFeedback.title}
          </div>
          <div className="ss-card p-5 flex flex-col gap-4">
            <div className="case4-transmission-panel">
              <div className="case4-transmission-header">
                <span>NETWORK REVIEW NOTE</span>
                <strong>CONTINUE SCAN</strong>
              </div>
              <div className="case4-transmission-status">
                <span>{activeNetwork.name}</span>
                <span>{actionFeedback.message}</span>
                <span>Return to scanner and compare remaining access points.</span>
              </div>
            </div>
            <button
              type="button"
              className="ss-btn ss-btn-cyan self-start"
              onClick={() => {
                setPhase('scan')
                playSfx('click')
              }}
            >
              Return to Scanner <IconArrowRight size={16} />
            </button>
          </div>
        </section>
      )}

      {phase === 'malware' && (
        <section className="case-debrief scene-transition">
          <div className="breach-banner">SUSPECT NETWORK JOINED</div>
          <div className="ss-card p-5 flex flex-col gap-4">
            <div className="case4-fake-update">
              <span>Browser Security Update</span>
              <h2>Your browser needs an update. Install now.</h2>
              <div className="case4-update-bar"><span /></div>
              {!malwareInstalled ? (
                <button
                  type="button"
                  className="ss-btn ss-btn-pink self-start"
                  onClick={() => {
                    setMalwareInstalled(true)
                    playSfx('wrong')
                  }}
                >
                  Install Update
                </button>
              ) : (
                <div className="breach-banner">MALWARE PAYLOAD EXECUTED</div>
              )}
            </div>
            {malwareInstalled && (
              <>
                <div className="case2-ricky-panel">
                  <span className="font-pixel text-sw-yellow text-xs">AGENT ZOEY</span>
                  <p>Cadet. You just installed malware onto a government device.</p>
                  <p>That wasn't an update - that was an attack.</p>
                </div>
                <button
                  type="button"
                  className="ss-btn ss-btn-cyan self-start"
                  onClick={() => setPhase('judgment')}
                >
                  Open Investigation Review <IconArrowRight size={16} />
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {phase === 'ignored' && (
        <section className="case-debrief scene-transition">
          <div className="breach-banner">ATTACK LEFT RUNNING</div>
          <div className="ss-card p-5 flex flex-col gap-4">
            <div className="case4-upload-glitch">
              <div className="case4-upload-label">
                <span>CREDENTIAL EXPOSURE</span>
                <strong>RISING</strong>
              </div>
              <div className="case4-upload-track"><span /></div>
              <div className="case4-warning-scan">SUSPICIOUS TRAFFIC CONTINUES</div>
              <p>More shoppers connect. More login sessions pass through the rogue access point.</p>
            </div>
            <div className="case2-ricky-panel">
              <span className="font-pixel text-sw-yellow text-xs">AGENT RICKY</span>
              <p>Inaction is still a decision. Leaving a rogue hotspot active lets the harvest continue.</p>
            </div>
            <button
              type="button"
              className="ss-btn ss-btn-cyan self-start"
              onClick={() => setPhase('judgment')}
            >
              Open Investigation Review <IconArrowRight size={16} />
            </button>
          </div>
        </section>
      )}

      {phase === 'flagged' && (
        <section className="case-debrief scene-transition">
          <div className={incidentPassed ? 'success-banner' : 'breach-banner'}>
            {incidentPassed ? 'ROGUE ACCESS POINT FLAGGED' : 'WRONG NETWORK FLAGGED'}
          </div>
          <div className="ss-card p-5 flex flex-col gap-4">
            <div className="case4-transmission-panel">
              <div className="case4-transmission-header">
                <span>NETWORK CONTAINMENT REPORT</span>
                <strong>{incidentPassed ? 'CONFIRMED' : 'REVIEW'}</strong>
              </div>
              <div className="case4-transmission-status">
                <span>PACKET TRACE LOCKED</span>
                <span>MAC SPOOFING INDICATOR SAVED</span>
                <span>MALL NETWORK STAFF NOTIFIED</span>
                <span>{incidentPassed ? 'CREDENTIAL HARVEST PREVENTED' : 'INVESTIGATION NEEDS REVIEW'}</span>
              </div>
              <div className="case4-transmission-track"><span /></div>
            </div>
            <div className="case2-ricky-panel">
              <span className="font-pixel text-sw-yellow text-xs">AGENT RICKY</span>
              <p>
                {incidentPassed
                  ? "Nice work. That's a rogue access point using MAC spoofing and packet sniffing."
                  : 'That report is not clean yet. The selected network does not match the strongest evidence.'}
              </p>
              {incidentPassed && <p>You just prevented a mall-wide credential harvest.</p>}
            </div>
            <button
              type="button"
              className="ss-btn ss-btn-cyan self-start"
              onClick={() => setPhase('judgment')}
            >
              Open Judgment Calls <IconArrowRight size={16} />
            </button>
          </div>
        </section>
      )}

      {phase === 'judgment' && (
        <section className="case2-board scene-transition">
          <div className="case2-board-header">
            <div>
              <span className="font-pixel text-sw-pink text-xs">SILENT LISTENER REVIEW</span>
              <h2 className="font-pixel text-sw-cyan text-sm">Veteran Judgment Calls</h2>
            </div>
            <div className="case2-progress-chip">
              {currentJudgmentIndex + 1} / {CASE4_VETERAN_JUDGMENTS.length}
            </div>
          </div>
          <article
            className={`veteran-quiz-card veteran-quiz-focus ${
              judgmentAnswered && !judgmentSelectedCorrect
                ? 'veteran-quiz-shake'
                : ''
            }`}
          >
            <h3>{activeJudgment.question}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {activeJudgment.options.map((option) => {
                const selected = selectedJudgment === option.value
                const isCorrect = activeJudgment.answer === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`veteran-answer-btn ${
                      selected ? 'veteran-answer-selected' : ''
                    } ${judgmentAnswered && isCorrect ? 'veteran-answer-correct' : ''} ${
                      judgmentAnswered && selected && !isCorrect
                        ? 'veteran-answer-wrong'
                        : ''
                    }`}
                    onClick={() => answerJudgment(activeJudgment.id, option.value)}
                    disabled={judgmentAnswered}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
            {judgmentAnswered && (
              <div className={judgmentSelectedCorrect ? 'success-banner' : 'breach-banner'}>
                {judgmentSelectedCorrect
                  ? activeJudgment.correctFeedback
                  : activeJudgment.wrongFeedback}
              </div>
            )}
            {judgmentAnswered && (
              <button
                type="button"
                className="ss-btn ss-btn-cyan self-start"
                onClick={lastJudgment ? submitJudgments : nextJudgment}
                disabled={resolvingDebrief}
              >
                {lastJudgment ? 'Submit Investigation' : 'Next Judgment'}{' '}
                <IconArrowRight size={16} />
              </button>
            )}
          </article>
        </section>
      )}

      {phase === 'failureSequence' && (
        <section className="case-debrief scene-transition">
          <div className="breach-banner">NETWORK INVESTIGATION FAILED</div>
          <div className="ss-card p-5 flex flex-col gap-4">
            <div className="case4-upload-glitch" aria-live="polite">
              <div className="case4-upload-label">
                <span>RED PACKET TRACE</span>
                <strong>ACTIVE</strong>
              </div>
              <div className="case4-upload-track">
                <span />
              </div>
              <div className="case4-warning-scan">
                CREDENTIAL LEAK CONTINUES
              </div>
              <p>The rogue access point remained active.</p>
              <p>Credentials continued leaking across the mall.</p>
            </div>
            <div className="case2-ricky-panel">
              <span className="font-pixel text-sw-yellow text-xs">
                {route === 'connectedThreat' ? 'AGENT ZOEY' : 'AGENT RICKY'}
              </span>
              {route === 'wrongFlag' && (
                <p>
                  You isolated the wrong access point. The malicious network
                  kept listening.
                </p>
              )}
              {route === 'ignoredThreat' && (
                <p>Inaction let the credential harvest continue.</p>
              )}
              {route === 'connectedThreat' && (
                <p>Testing by connecting exposed the government device.</p>
              )}
              {route === 'fieldFailed' && (
                <p>
                  You found the right network, but your report missed a critical
                  threat indicator.
                </p>
              )}
              {route === 'incidentFailed' && (
                <p>
                  The final network decision did not contain the rogue access
                  point before the harvest continued.
                </p>
              )}
            </div>
            <button
              type="button"
              className="ss-btn ss-btn-cyan self-start"
              onClick={() => {
                setPhase('debrief')
                playSfx('click')
              }}
              disabled={resolvingDebrief}
            >
              Open Failure Debrief <IconArrowRight size={16} />
            </button>
          </div>
        </section>
      )}

      {phase === 'quiz' && (
        <section className="case-debrief scene-transition">
          <div className="success-banner">FINAL CERTIFICATION - NETWORK NAVIGATOR</div>
          <div className="ss-card p-5 flex flex-col gap-4">
            <h2 className="font-pixel text-sw-cyan text-sm">Silent Listener certification</h2>
            <p className="text-sw-text2">
              Each correct answer is worth 10 coins. Passing requires at least
              50%, so 5 or more answers closes the Veteran file.
            </p>
            {!quizSubmitted ? (
              <>
                <div className="veteran-quiz-progress">
                  Question {currentQuizQuestion + 1} / {CASE4_VETERAN_QUIZ.length}
                </div>
                <article
                  className={`veteran-quiz-card veteran-quiz-focus ${
                    quizAnswered && !quizSelectedCorrect
                      ? 'veteran-quiz-shake'
                      : ''
                  }`}
                >
                  <h3>{activeQuizQuestion.question}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {activeQuizQuestion.options.map((option, optionIndex) => {
                      const selected = selectedQuizAnswer === optionIndex
                      const isCorrect = activeQuizQuestion.answer === optionIndex
                      return (
                        <button
                          key={option}
                          type="button"
                          className={`veteran-answer-btn ${
                            selected ? 'veteran-answer-selected' : ''
                          } ${
                            quizAnswered && isCorrect
                              ? 'veteran-answer-correct'
                              : ''
                          } ${
                            quizAnswered && selected && !isCorrect
                              ? 'veteran-answer-wrong'
                              : ''
                          }`}
                          onClick={() => answerQuiz(currentQuizQuestion, optionIndex)}
                          disabled={quizAnswered}
                        >
                          {option}
                        </button>
                      )
                    })}
                  </div>
                </article>
                {quizAnswered && (
                  <div className={quizSelectedCorrect ? 'success-banner' : 'breach-banner'}>
                    {quizSelectedCorrect
                      ? 'Correct. +10 quiz coins secured.'
                      : `Correct answer: ${
                          activeQuizQuestion.options[activeQuizQuestion.answer]
                        }`}
                  </div>
                )}
                {quizAnswered && (
                  <button
                    type="button"
                    className="ss-btn ss-btn-cyan self-start"
                    onClick={lastQuizQuestion ? submitQuiz : nextQuizQuestion}
                  >
                    {lastQuizQuestion ? 'View results' : 'Next Question'}
                  </button>
                )}
              </>
            ) : (
              <>
                <div className={quizPassed ? 'success-banner' : 'breach-banner'}>
                  {quizPassed ? 'Certification passed' : 'Certification failed'}
                </div>
                <div className="veteran-results-grid">
                  <div>
                    <span>Correct</span>
                    <strong>{quizCorrect} / 10</strong>
                  </div>
                  <div>
                    <span>Quiz coins</span>
                    <strong>{quizCorrect * 10}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>{quizPassed ? 'Case can close' : 'Replay required'}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  className="ss-btn ss-btn-cyan self-start"
                  onClick={submitQuiz}
                >
                  Continue debrief
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {phase === 'debrief' && (
        <section className="case-debrief scene-transition">
          <div className={passedVeteran ? 'success-banner' : 'breach-banner'}>
            {passedVeteran ? 'CASE 04 VETERAN SECURED' : 'SILENT LISTENER REVIEW FAILED'}
          </div>
          <div className="ss-card p-5 flex flex-col gap-4">
            <div className="case2-ricky-panel">
              <span className="font-pixel text-sw-yellow text-xs">AGENTS RICKY + ZOEY</span>
              <h2 className="font-pixel text-sw-cyan text-sm">The listener was the network</h2>
              <p>
                A rogue access point does not need to shout. It waits for people
                to trust a familiar name, then listens for traffic, device names,
                sessions, and credentials.
              </p>
              <blockquote className="zoey-quote">
                "Verification matters because a network can lie with a name just
                like a person can lie with a badge."
              </blockquote>
            </div>
            <div className="veteran-results-grid">
              <div>
                <span>Action</span>
                <strong>{incidentPassed ? 'Rogue AP flagged' : 'Unsafe'}</strong>
              </div>
              <div>
                <span>Judgments</span>
                <strong>
                  {judgmentCorrect} / {CASE4_VETERAN_JUDGMENTS.length}
                </strong>
              </div>
              <div>
                <span>Quiz</span>
                <strong>{quizCorrect} / 10</strong>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CASE4_VETERAN_TEACHING_POINTS.map((point) => (
                <article key={point.title} className="red-flag-card">
                  <IconFlag size={18} />
                  <div>
                    <h3>{point.title}</h3>
                    <p>{point.text}</p>
                  </div>
                </article>
              ))}
            </div>
            {passedVeteran && (
              <div className="badge-card">
                <span>Badge unlocked</span>
                <strong>NETWORK NAVIGATOR</strong>
              </div>
            )}
            {route === 'incidentFailed' && (
              <p className="text-sw-text3 text-sm">
                Replay required. The investigation action must flag
                Mall_Guest_Free as malicious before certification unlocks.
              </p>
            )}
            {route === 'wrongFlag' && (
              <p className="text-sw-text3 text-sm">
                Replay required. You marked a legitimate mall access point as
                malicious and missed the actual listening network.
              </p>
            )}
            {route === 'ignoredThreat' && (
              <p className="text-sw-text3 text-sm">
                Replay required. The malicious network was left active, allowing
                the credential harvest to continue.
              </p>
            )}
            {route === 'connectedThreat' && (
              <p className="text-sw-text3 text-sm">
                Replay required. Connecting to the suspect network exposed the
                government device before the threat was contained.
              </p>
            )}
            {route === 'fieldFailed' && (
              <p className="text-sw-text3 text-sm">
                Replay required. Every Veteran judgment call must be correct
                before the final certification unlocks.
              </p>
            )}
            {route === 'quizFailed' && (
              <p className="text-sw-text3 text-sm">
                The final certification score was below 50%. Replay is required.
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                className="ss-btn ss-btn-pink"
                onClick={
                  passedVeteran
                    ? restart
                    : failureLifeSpent
                      ? restart
                      : () => spendFailureLife('replay')
                }
                disabled={resolvingDebrief}
              >
                Replay Veteran
              </button>
              <button
                type="button"
                className="ss-btn ss-btn-cyan"
                onClick={
                  passedVeteran
                    ? () => finishVeteran('caseFiles')
                    : failureLifeSpent
                      ? () => navigate('/play')
                      : () => spendFailureLife('continue')
                }
                disabled={resolvingDebrief}
              >
                Continue to Case Files
              </button>
            </div>
          </div>
        </section>
      )}

      {phase === 'end' && (
        <section className="ss-card p-6 flex flex-col gap-4">
          <h2 className="font-pixel text-sw-cyan text-sm">
            Case 04 Veteran Complete
          </h2>
          <p className="text-sw-text2">
            The Silent Listener closed. Quiz score: {quizCorrect}/10.
          </p>
          <PixelBadgeCard badge={badge} pointsAwarded={pointsAwarded} />
          <div className="badge-card">
            <span>Field guide unlocked</span>
            <strong>NETWORK NAVIGATOR</strong>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              className="ss-btn ss-btn-cyan"
              onClick={() => navigate('/play')}
            >
              Return to Case Files
            </button>
            <button type="button" className="ss-btn ss-btn-pink" onClick={restart}>
              Replay Veteran
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

function LockedCase() {
  const navigate = useNavigate()
  return (
    <section className="ss-card p-6 flex flex-col gap-4 max-w-3xl mx-auto opacity-70">
      <IconLock size={28} className="text-sw-text3" />
      <h2 className="font-pixel text-sw-cyan text-sm">Case file locked</h2>
      <p className="text-sw-text2">
        Clear the previous case to access this file.
      </p>
      <button
        type="button"
        className="ss-btn ss-btn-cyan self-start"
        onClick={() => navigate('/play')}
      >
        Return to Case Files
      </button>
    </section>
  )
}

function NoLivesCase() {
  const navigate = useNavigate()
  return (
    <section className="ss-card p-6 flex flex-col gap-4 max-w-3xl mx-auto opacity-90">
      <IconLock size={28} className="text-sw-red" />
      <h2 className="font-pixel text-sw-cyan text-sm">No lives remaining</h2>
      <p className="text-sw-text2">
        You need at least 1 life to start a case.
      </p>
      <button
        type="button"
        className="ss-btn ss-btn-cyan self-start"
        onClick={() => navigate('/play')}
      >
        Return to Case Files
      </button>
    </section>
  )
}

function FutureCase({ caseId }) {
  const navigate = useNavigate()
  return (
    <section className="ss-card p-6 flex flex-col gap-4 max-w-3xl mx-auto">
      <span className="font-pixel text-sw-pink text-xs">CASE 0{caseId}</span>
      <h2 className="font-pixel text-sw-cyan text-sm">Coming next</h2>
      <p className="text-sw-text2">
        This investigation is a placeholder while Unit Zero prepares the file.
      </p>
      <button
        type="button"
        className="ss-btn ss-btn-cyan self-start"
        onClick={() => navigate('/play')}
      >
        Return to Case Files
      </button>
    </section>
  )
}

export default function Case() {
  const { caseId, difficulty = 'rookie' } = useParams()
  const { user, token, setUser } = useAuth()
  const navigate = useNavigate()
  const numericCaseId = Number(caseId)
  const [phase, setPhase] = useState('intro')
  const [stepIndex, setStepIndex] = useState(0)
  const [outcome, setOutcome] = useState(null)
  const [badge, setBadge] = useState(null)
  const [pointsAwarded, setPointsAwarded] = useState(0)
  const [sceneExiting, setSceneExiting] = useState(false)
  const [resolvingDebrief, setResolvingDebrief] = useState(false)
  const [progressError, setProgressError] = useState('')
  const resolvingRef = useRef(false)
  const internName = user?.username || 'Nova'
  const hasLives = (user?.livesRemaining ?? 0) > 0

  if (!['rookie', 'veteran'].includes(difficulty)) {
    return <Navigate to={`/case/${caseId}/rookie`} replace />
  }

  if (!hasLives) return <NoLivesCase />
  if (!isCaseModeUnlocked(user, numericCaseId, difficulty)) return <LockedCase />
  if (numericCaseId === 2 && difficulty === 'rookie') return <Case2Rookie />
  if (numericCaseId === 2 && difficulty === 'veteran') return <Case2Veteran />
  if (numericCaseId === 2) return <FutureCase caseId={numericCaseId} />
  if (numericCaseId === 3 && difficulty === 'rookie') return <Case3Rookie />
  if (numericCaseId === 3 && difficulty === 'veteran') return <Case3Veteran />
  if (numericCaseId === 4 && difficulty === 'rookie') return <Case4Rookie />
  if (numericCaseId === 4 && difficulty === 'veteran') return <Case4Veteran />
  if (numericCaseId !== 1) return <FutureCase caseId={numericCaseId} />
  if (difficulty === 'veteran') return <VeteranCase />

  function nextIntro() {
    if (stepIndex < INTRO_STEPS.length - 1) {
      setStepIndex((value) => value + 1)
      return
    }
    setSceneExiting(true)
    setTimeout(() => {
      setSceneExiting(false)
      setPhase('inbox')
    }, 520)
  }

  async function spendFailureLife() {
    if (!token) throw new Error('You need to be signed in to update progress.')
    const data = await api.failAttempt(token, {
      caseId: numericCaseId,
      difficulty,
    })
    setUser(data.user)
    return data
  }

  async function handleClaimVoucher() {
    setPhase('glitch')
  }

  function restart() {
    setPhase('intro')
    setStepIndex(0)
    setOutcome(null)
    setBadge(null)
    setPointsAwarded(0)
    setSceneExiting(false)
    setResolvingDebrief(false)
    setProgressError('')
    resolvingRef.current = false
  }

  async function finishFailedAttempt(nextAction) {
    if (resolvingRef.current) return
    resolvingRef.current = true
    setResolvingDebrief(true)
    setProgressError('')
    try {
      await spendFailureLife()
      playSfx('lifeLost')
      playSfx('caseFailed')
      if (nextAction === 'replay') {
        restart()
        return
      }
      navigate('/play')
    } catch (error) {
      console.error('[progress] Failed case attempt update failed', {
        endpoint: '/progress/fail-attempt',
        action: nextAction,
        caseId: numericCaseId,
        difficulty,
        message: error.message,
      })
      setProgressError(error.message || 'Could not update lives.')
      resolvingRef.current = false
      setResolvingDebrief(false)
    }
  }

  async function awardRookieCompletion() {
    const unlockedBadge = BADGES.sharpEyes
    setBadge(unlockedBadge)
    if (!token) throw new Error('You need to be signed in to update progress.')
    const data = await api.completeCase(token, {
      caseId: 1,
      difficulty: 'rookie',
      result: 'success',
      badge: unlockedBadge,
    })
    setUser(data.user)
    setPointsAwarded(data.pointsAwarded)
    if (data.pointsAwarded > 0) {
      playSfx('coins')
      playSfx('badge')
    }
    playSfx('caseComplete')
    return { unlockedBadge, awarded: data.pointsAwarded }
  }

  async function replayAfterSuccess() {
    if (resolvingRef.current) return
    resolvingRef.current = true
    setResolvingDebrief(true)
    setProgressError('')
    try {
      await awardRookieCompletion()
      restart()
    } catch (error) {
      console.error('[progress] Successful replay progress update failed', {
        endpoint: '/progress/complete-case',
        caseId: numericCaseId,
        difficulty: 'rookie',
        message: error.message,
      })
      setProgressError(error.message || 'Could not update case progress.')
      resolvingRef.current = false
      setResolvingDebrief(false)
    }
  }

  async function finishRookie() {
    if (resolvingRef.current) return
    resolvingRef.current = true
    setResolvingDebrief(true)
    setProgressError('')
    try {
      await awardRookieCompletion()
      setPhase('end')
    } catch (error) {
      console.error('[progress] Case completion update failed', {
        endpoint: '/progress/complete-case',
        caseId: numericCaseId,
        difficulty: 'rookie',
        message: error.message,
      })
      setProgressError(error.message || 'Could not update case progress.')
    } finally {
      resolvingRef.current = false
      setResolvingDebrief(false)
    }
  }

  return (
    <div className="case-shell max-w-5xl mx-auto">
      <div className="case-title-row">
        <div>
          <span className="font-pixel text-sw-pink text-xs">CASE 01 ROOKIE</span>
          <h2 className="font-pixel text-sw-cyan text-sm md:text-base">
            The Bait
          </h2>
        </div>
      </div>
      {progressError && (
        <div className="ss-card p-3 text-sw-red text-sm">{progressError}</div>
      )}

      {phase === 'intro' && (
        <StoryScene
          step={INTRO_STEPS[stepIndex]}
          onNext={nextIntro}
          internName={internName}
          isLastStep={stepIndex === INTRO_STEPS.length - 1}
          exiting={sceneExiting}
        />
      )}
      {phase === 'inbox' && (
        <InboxScene onNext={() => setPhase('email')} internName={internName} />
      )}
      {phase === 'email' && (
        <EmailScene
          internName={internName}
          onClaim={handleClaimVoucher}
          onReport={() => {
            setOutcome('report')
            setPhase('zoey')
          }}
        />
      )}
      {phase === 'glitch' && <GlitchScreen onNext={() => setPhase('form')} />}
      {phase === 'form' && (
        <FakeForm
          onSubmit={() => {
            setOutcome('claim')
            setPhase('zoey')
          }}
        />
      )}
      {phase === 'zoey' && (
        <ZoeyBrief outcome={outcome} onNext={() => setPhase('debrief')} />
      )}
      {phase === 'debrief' && (
        <Debrief
          outcome={outcome}
          onReplay={
            outcome === 'claim'
              ? () => finishFailedAttempt('replay')
              : replayAfterSuccess
          }
          onContinue={
            outcome === 'claim'
              ? () => finishFailedAttempt('continue')
              : finishRookie
          }
          busy={resolvingDebrief}
        />
      )}
      {phase === 'end' && (
        <EndScreen
          badge={badge}
          pointsAwarded={pointsAwarded}
          onReturn={() => navigate('/play')}
          onVeteran={() => navigate('/case/1/veteran')}
        />
      )}
    </div>
  )
}
