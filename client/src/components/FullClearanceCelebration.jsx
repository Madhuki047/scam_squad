import { Link } from 'react-router-dom'

export default function FullClearanceCelebration({
  compact = false,
  showMessage = true,
  showConfetti = true,
  actions = false,
}) {
  return (
    <section
      className={`full-clearance-card ${compact ? 'full-clearance-compact' : ''}`}
    >
      {showConfetti && (
        <div className="full-clearance-confetti" aria-hidden="true">
          {Array.from({ length: compact ? 8 : 14 }, (_, index) => (
            <span key={index} />
          ))}
        </div>
      )}
      <div className="full-clearance-agent" aria-hidden="true">
        <span />
        <i />
      </div>
      <div className="full-clearance-copy">
        <span className="font-pixel text-sw-yellow text-xs">
          UNIT ZERO INTERNSHIP COMPLETE
        </span>
        <h3 className="font-pixel text-sw-cyan">
          Congratulations, Agent.
        </h3>
        {showMessage && (
          <p>
            You passed your internship at Unit Zero. Full Agent Clearance has
            been granted. Await further case files as you begin your new role on
            the Unit Zero team.
          </p>
        )}
        <div className="full-clearance-stamp">FULL AGENT CLEARANCE</div>
        {actions && (
          <div className="full-clearance-actions">
            <Link to="/play" className="ss-btn ss-btn-cyan">
              View Cleared Case Files
            </Link>
            <Link to="/case/5/veteran" className="ss-btn ss-btn-pink">
              Replay Final Case
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
