// Placeholder for screens built in later phases. Keeps the sidebar
// links from 404-ing before their real pages exist.
export default function ComingSoon({ title, phase }) {
  return (
    <div className="max-w-xl mx-auto ss-card p-10 text-center flex flex-col gap-3">
      <h2 className="font-pixel text-sw-cyan text-glow text-base">{title}</h2>
      <p className="text-sw-text2">This screen is under construction.</p>
      <p className="text-sw-text3 text-sm">Arriving in {phase}.</p>
    </div>
  )
}
