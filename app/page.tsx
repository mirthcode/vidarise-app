import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-brand-slate-gray">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold">VidaRise</div>
          </div>
          <nav className="flex gap-6">
            <Link href="/auth/login" className="text-brand-cool-gray hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/auth/signup" className="btn-primary">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Rise in Life</h1>
          <p className="text-xl md:text-2xl text-brand-cool-gray mb-4 max-w-3xl mx-auto">
            Built for leaders who grow through mentorship.
          </p>
          <p className="text-lg text-brand-cool-gray mb-12 max-w-2xl mx-auto">
            VidaRise empowers structured progress through meaningful connection, discipline, and purpose.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup" className="btn-primary text-lg px-8 py-4">
              Create Your Profile
            </Link>
            <Link href="/auth/login" className="btn-secondary text-lg px-8 py-4">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-slate-gray py-8">
        <div className="container mx-auto px-4 text-center text-brand-cool-gray">
          <p>&copy; 2025 VidaRise. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
