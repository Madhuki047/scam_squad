import { Link } from 'react-router-dom'

// 404 fallback route. Placeholder stub.
function NotFound() {
  return (
    <div className="p-6">
      <p>404 - Page not found.</p>
      <Link to="/" className="underline">
        Back to home
      </Link>
    </div>
  )
}

export default NotFound
