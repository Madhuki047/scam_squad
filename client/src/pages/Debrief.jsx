import { useParams } from 'react-router-dom'

// Post-case debrief screen ("failure is the best teacher"). Placeholder stub.
function Debrief() {
  const { caseId } = useParams()
  return <div className="p-6">Case {caseId} - Debrief (placeholder)</div>
}

export default Debrief
