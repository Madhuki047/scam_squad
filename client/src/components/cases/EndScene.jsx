// Terminal scene: shown when the engine resolves END_SUCCESS or
// END_FAIL. Awards are granted server-side on success.
export default function EndScene({ caseData, success, onExit }) {
  return (
    <div className="ss-card p-8 text-center max-w-xl mx-auto flex flex-col gap-4">
      <h2
        className={`font-pixel text-glow text-base ${
          success ? 'text-sw-cyan' : 'text-sw-yellow'
        }`}
      >
        {success ? 'CASE CLOSED' : 'CASE ARCHIVED'}
      </h2>
      <p className="text-sw-text2">
        {success
          ? `Well done, Cadet. ${caseData.title} is in the books.`
          : `${caseData.title} is on file. Come back when you're ready to try again.`}
      </p>
      <button
        type="button"
        className="ss-btn ss-btn-cyan self-center"
        onClick={onExit}
      >
        Return to case files
      </button>
    </div>
  )
}
