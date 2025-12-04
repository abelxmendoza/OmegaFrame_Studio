import Logo from '@/components/Logo'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-omega-bg">
      <div className="text-center space-y-8">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <p className="text-xl text-omega-text/70">AI-Powered Video Generation</p>
        <a
          href="/dashboard"
          className="inline-block bg-omega-accent hover:bg-omega-accent/90 text-white font-semibold py-3 px-8 rounded-md transition-all shadow-omega-glow hover:shadow-omega-glow-lg"
        >
          Get Started
        </a>
      </div>
    </main>
  )
}

