import { useParams } from 'react-router-dom'

// Single case gameplay screen. Placeholder stub.
function Case() {
  const { caseId } = useParams()
  return <div className="p-6">Case {caseId} (placeholder)</div>
}

export default Case
