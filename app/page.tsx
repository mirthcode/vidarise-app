import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-brand-slate-gray/50 sticky top-0 backdrop-blur-lg bg-brand-dark-navy/80 z-50">
        <div className="container mx-auto px-4 py-1 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity my-1">
            <div className="relative w-[650px] h-[90px] overflow-hidden">
              <Image
                src="/logo-horizontal-transparent.png"
                alt="VidaRise"
                width={800}
                height={150}
                className="absolute object-contain object-left"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '250%',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              />
            </div>
          </Link>
          <nav className="flex gap-4">
            <Link
              href="/auth/login"
              className="text-brand-cool-gray hover:text-white transition-colors px-4 py-2"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="btn-primary"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Gradient Background with Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-navy via-brand-charcoal to-brand-dark-navy">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full"></div>
          </div>

          <div className="relative container mx-auto px-4 py-24 md:py-32 text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-brand-cool-gray bg-clip-text text-transparent">
              Rise in Life
            </h1>
            <p className="text-xl md:text-2xl text-brand-cool-gray mb-12 max-w-4xl mx-auto leading-relaxed">
              Create a program space for your organization, match people with mentors, and track progress – all in one place.
            </p>
            <Link
              href="/auth/signup"
              className="btn-primary text-lg px-10 py-4 inline-block shadow-lg shadow-brand-cobalt-blue/20 hover:shadow-xl hover:shadow-brand-cobalt-blue/30 transition-all"
            >
              Get Started
            </Link>
          </div>
        </section>

        {/* Main Callout */}
        <section className="py-16 bg-brand-charcoal/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Mentorship at Scale
              </h2>
              <p className="text-lg text-brand-cool-gray leading-relaxed">
                VidaRise makes it simple to run mentorship that actually works. Organizers create a dedicated program space, mentors set their capacity and focus areas, mentees share goals, and everyone follows clear milestones from first meeting to outcomes.
              </p>
            </div>
          </div>
        </section>

        {/* Three Pillars */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* For Mentees */}
              <div className="card group hover:border-brand-cobalt-blue/50 transition-all text-center">
                <div className="w-12 h-12 rounded-full bg-brand-cobalt-blue/10 flex items-center justify-center mb-4 group-hover:bg-brand-cobalt-blue/20 transition-all mx-auto">
                  <svg className="w-6 h-6 text-brand-cobalt-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3">For Mentees</h3>
                <p className="text-brand-cool-gray leading-relaxed">
                  Get matched with a mentor who can guide your growth.
                </p>
              </div>

              {/* For Mentors */}
              <div className="card group hover:border-brand-cobalt-blue/50 transition-all text-center">
                <div className="w-12 h-12 rounded-full bg-brand-cobalt-blue/10 flex items-center justify-center mb-4 group-hover:bg-brand-cobalt-blue/20 transition-all mx-auto">
                  <svg className="w-6 h-6 text-brand-cobalt-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3">For Mentors</h3>
                <p className="text-brand-cool-gray leading-relaxed">
                  Share your expertise with a right-sized number of mentees.
                </p>
              </div>

              {/* Track Your Journey */}
              <div className="card group hover:border-brand-cobalt-blue/50 transition-all text-center">
                <div className="w-12 h-12 rounded-full bg-brand-cobalt-blue/10 flex items-center justify-center mb-4 group-hover:bg-brand-cobalt-blue/20 transition-all mx-auto">
                  <svg className="w-6 h-6 text-brand-cobalt-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3">Track Your Journey</h3>
                <p className="text-brand-cool-gray leading-relaxed">
                  See your progress at a glance and capture key takeaways after each meeting.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-brand-charcoal/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Features That Make Mentorship Simple
              </h2>
              <p className="text-xl text-brand-cool-gray max-w-3xl mx-auto">
                VidaRise removes friction so programs launch fast and stays on track.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {/* Program Spaces */}
              <div className="card group hover:border-brand-cobalt-blue/50 transition-all text-center">
                <div className="w-10 h-10 rounded-lg bg-brand-cobalt-blue/10 flex items-center justify-center mb-4 group-hover:bg-brand-cobalt-blue/20 transition-all mx-auto">
                  <svg className="w-5 h-5 text-brand-cobalt-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Program Spaces</h3>
                <p className="text-brand-cool-gray text-sm leading-relaxed">
                  Stand up a dedicated space for each organization or department with its own branding, members, rules, and admins.
                </p>
              </div>

              {/* Profile Setup */}
              <div className="card group hover:border-brand-cobalt-blue/50 transition-all text-center">
                <div className="w-10 h-10 rounded-lg bg-brand-cobalt-blue/10 flex items-center justify-center mb-4 group-hover:bg-brand-cobalt-blue/20 transition-all mx-auto">
                  <svg className="w-5 h-5 text-brand-cobalt-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Profile Setup</h3>
                <p className="text-brand-cool-gray text-sm leading-relaxed">
                  Mentors and mentees create concise profiles with goals, topics, industry, experience, and availability.
                </p>
              </div>

              {/* Smart Matching */}
              <div className="card group hover:border-brand-cobalt-blue/50 transition-all text-center">
                <div className="w-10 h-10 rounded-lg bg-brand-cobalt-blue/10 flex items-center justify-center mb-4 group-hover:bg-brand-cobalt-blue/20 transition-all mx-auto">
                  <svg className="w-5 h-5 text-brand-cobalt-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Smart Matching</h3>
                <p className="text-brand-cool-gray text-sm leading-relaxed">
                  Receive match suggestions based on goals and tags. Program admins can approve, pin, or adjust matches as needed.
                </p>
              </div>

              {/* Clear Milestones */}
              <div className="card group hover:border-brand-cobalt-blue/50 transition-all text-center">
                <div className="w-10 h-10 rounded-lg bg-brand-cobalt-blue/10 flex items-center justify-center mb-4 group-hover:bg-brand-cobalt-blue/20 transition-all mx-auto">
                  <svg className="w-5 h-5 text-brand-cobalt-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Clear Milestones</h3>
                <p className="text-brand-cool-gray text-sm leading-relaxed">
                  Follow a simple path: complete profile, submit preferences, review matches, schedule meetings, log sessions, and submit reflections.
                </p>
              </div>

              {/* Progress Tracking */}
              <div className="card group hover:border-brand-cobalt-blue/50 transition-all text-center">
                <div className="w-10 h-10 rounded-lg bg-brand-cobalt-blue/10 flex items-center justify-center mb-4 group-hover:bg-brand-cobalt-blue/20 transition-all mx-auto">
                  <svg className="w-5 h-5 text-brand-cobalt-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Progress Tracking</h3>
                <p className="text-brand-cool-gray text-sm leading-relaxed">
                  Dashboards highlight upcoming meetings, completed sessions, reflections, and overall status for each participant.
                </p>
              </div>

              {/* Feedback & Reflections */}
              <div className="card group hover:border-brand-cobalt-blue/50 transition-all text-center">
                <div className="w-10 h-10 rounded-lg bg-brand-cobalt-blue/10 flex items-center justify-center mb-4 group-hover:bg-brand-cobalt-blue/20 transition-all mx-auto">
                  <svg className="w-5 h-5 text-brand-cobalt-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Feedback & Reflections</h3>
                <p className="text-brand-cool-gray text-sm leading-relaxed">
                  Quick post-meeting reflections capture insights and keep momentum between sessions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
                About VidaRise
              </h2>
              <p className="text-lg text-brand-cool-gray leading-relaxed text-center">
                VidaRise is a mentorship platform for organizations that need structure and scale. Create a program space, invite mentors and mentees, streamline matching, and track meetings and reflections. Participants sign in from the main page and access the programs they belong to.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-brand-cobalt-blue/10 to-cyan-500/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to start your mentorship journey?
            </h2>
            <p className="text-lg text-brand-cool-gray mb-8 max-w-2xl mx-auto">
              Join VidaRise today and experience mentorship that actually works.
            </p>
            <Link
              href="/auth/signup"
              className="btn-primary text-lg px-10 py-4 inline-block shadow-lg shadow-brand-cobalt-blue/20 hover:shadow-xl hover:shadow-brand-cobalt-blue/30 transition-all"
            >
              Get Started
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-slate-gray/50 py-8 bg-brand-charcoal/30">
        <div className="container mx-auto px-4 text-center text-brand-cool-gray text-sm">
          <p className="mb-2">Pilot Mentorship Platform – Public Use Unauthorized</p>
          <p>Powered by MirthCode 2025</p>
        </div>
      </footer>
    </div>
  );
}
