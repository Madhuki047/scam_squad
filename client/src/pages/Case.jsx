import { useParams, useNavigate } from 'react-router-dom'
import { getCase } from '../cases/index.js'
import CaseRunner from '../components/cases/CaseRunner.jsx'

// Single case gameplay screen. Loads the scripted case for the :id in the
// URL and hands it to the engine; completing it (END_SUCCESS) records the
// case server-side, which is what advances casesSolved / points.
function Case() {
  const { id } = useParams()
  const navigate = useNavigate()
  const caseData = getCase(id)

  if (!caseData) {
    return (
      <div className="ss-card p-8 text-center max-w-xl mx-auto flex flex-col gap-4">
        <h2 className="font-pixel text-sw-red text-glow text-base">
          CASE NOT FOUND
        </h2>
        <p className="text-sw-text2">No case file matches "{id}".</p>
        <button
          type="button"
          className="ss-btn ss-btn-cyan self-center"
          onClick={() => navigate('/play')}
        >
          Return to case files
        </button>
      </div>
    )
  }

  return <CaseRunner caseData={caseData} onExit={() => navigate('/play')} />
}

export default Case
