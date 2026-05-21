import { useState, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { api } from '../../lib/api.js'
import DialogScene from './DialogScene.jsx'
import NarrationScene from './NarrationScene.jsx'
import ChoiceScene from './ChoiceScene.jsx'
import MCQScene from './MCQScene.jsx'
import MultiScene from './MultiScene.jsx'
import DebriefScene from './DebriefScene.jsx'
import BadgeBanner from './BadgeBanner.jsx'
import EndScene from './EndScene.jsx'

// Drives a scripted case. Each entry in `caseData.scenes` is one of the
// scene types below; every scene declares its successor(s) by id. Two
// reserved successors complete the case:
//   - "END_SUCCESS" : record the case as solved, award catalog rewards
//   - "END_FAIL"    : show the same end card but skip the API call
// Badges raised by 'badge' scenes are purely cosmetic in this engine;
// real awards happen server-side from the case catalog on completion.
export default function CaseRunner({ caseData, onExit }) {
  const { token, refreshUser } = useAuth()
  const [sceneId, setSceneId] = useState(caseData.start)
  const [banner, setBanner] = useState(null)
  const [outcome, setOutcome] = useState(null) // null | 'success' | 'fail'
  const [history, setHistory] = useState([])

  const go = useCallback(
    async (nextId) => {
      if (!nextId) return
      if (nextId === 'END_SUCCESS' || nextId === 'END_FAIL') {
        const success = nextId === 'END_SUCCESS'
        if (success) {
          try {
            await api.completeCase(token, caseData.id)
            refreshUser?.()
          } catch {
            // Idempotent endpoint: a duplicate complete is fine.
          }
        }
        setOutcome(success ? 'success' : 'fail')
        return
      }
      setHistory((h) => [...h, sceneId])
      setSceneId(nextId)
    },
    [caseData.id, refreshUser, sceneId, token],
  )

  // Show outcome card.
  if (outcome) {
    return (
      <EndScene
        caseData={caseData}
        success={outcome === 'success'}
        onExit={onExit}
      />
    )
  }

  const scene = caseData.scenes[sceneId]
  if (!scene) {
    return (
      <div className="ss-card p-5 text-sw-red max-w-xl mx-auto">
        Scene "{sceneId}" missing from case {caseData.id}.
      </div>
    )
  }

  // Badge scenes raise a transient banner instead of taking over the
  // viewport, so dialog momentum isn't broken.
  const handleBadge = (badge, next) => {
    setBanner(badge)
    setTimeout(() => setBanner(null), 2200)
    go(next)
  }

  let body
  switch (scene.type) {
    case 'dialog':
      body = <DialogScene scene={scene} onAdvance={go} />
      break
    case 'narration':
      body = <NarrationScene scene={scene} onAdvance={go} />
      break
    case 'choice':
      body = <ChoiceScene scene={scene} onAdvance={go} />
      break
    case 'mcq':
      body = <MCQScene scene={scene} onAdvance={go} />
      break
    case 'multi':
      body = <MultiScene scene={scene} onAdvance={go} />
      break
    case 'debrief':
      body = <DebriefScene scene={scene} onAdvance={go} />
      break
    case 'badge':
      // Render-on-mount badge: kick the banner immediately and forward.
      // Wrapped in an effect via a small inline component to avoid
      // calling setState during render.
      body = <AutoBadge scene={scene} onTrigger={handleBadge} />
      break
    default:
      body = (
        <div className="ss-card p-5 text-sw-red">
          Unknown scene type "{scene.type}".
        </div>
      )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {body}
      {banner && <BadgeBanner badge={banner} />}
    </div>
  )
}

function AutoBadge({ scene, onTrigger }) {
  // Fires once on mount, then renders a placeholder while the engine
  // advances to the next scene on the same tick.
  const [fired, setFired] = useState(false)
  if (!fired) {
    setFired(true)
    // Defer to a microtask so the parent setState happens after render.
    Promise.resolve().then(() => onTrigger(scene, scene.next))
  }
  return null
}
