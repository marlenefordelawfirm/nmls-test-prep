import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 bg-[radial-gradient(#cbd5e1_0.5px,transparent_0.5px)] bg-[length:24px_24px]">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl font-bold">N</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-blue-700">NMLS Test Prep</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-slate-700 hover:text-slate-900 px-4 py-2 text-sm font-semibold transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="bg-blue-700 text-white hover:bg-blue-800 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/10 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-bold border border-blue-100 mb-8">
            <span>✨</span>
            <span>AI-Powered NMLS Exam Preparation</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            Pass Your NMLS Exam
            <span className="block text-blue-700">With Confidence</span>
          </h1>

          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Comprehensive test preparation platform with <span className="font-semibold text-slate-900">adaptive learning</span>,
            AI-powered study aids, and real exam simulations to help you succeed on your first attempt.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/register"
              className="bg-blue-700 text-white hover:bg-blue-800 px-10 py-4 rounded-xl text-lg font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-3"
            >
              Start Free Trial
              <span>→</span>
            </Link>
            <Link
              href="/login"
              className="bg-white text-slate-700 hover:bg-slate-50 px-10 py-4 rounded-xl text-lg font-bold border-2 border-slate-200 transition-all"
            >
              Sign In
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span>
              <span>200+ Practice Questions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span>
              <span>100% NMLS Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span>
              <span>Adaptive Learning</span>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
              Everything You Need to Pass
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Comprehensive coverage of all 5 NMLS content areas with intelligent, personalized study plans
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200/50 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-3xl mb-6">
                📚
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                5 Complete Content Areas
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Full coverage of Federal Mortgage Laws, General Knowledge, Loan Origination,
                Ethics, and Uniform State Content with 50+ sub-topics
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200/50 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-3xl mb-6">
                🎯
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Adaptive Learning Engine
              </h3>
              <p className="text-slate-600 leading-relaxed">
                AI-powered algorithm analyzes your performance and automatically adjusts
                difficulty to focus on your weak areas
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200/50 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-3xl mb-6">
                ✅
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Real Exam Simulation
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Practice with full 125-question exams that mirror the actual NMLS test
                format, timing, and difficulty level
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24">
          <div className="bg-white rounded-2xl shadow-xl p-12 border border-slate-200/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div>
                <div className="text-5xl font-black text-blue-700 mb-3">200+</div>
                <div className="text-slate-600 font-semibold">Practice Questions</div>
                <p className="text-sm text-slate-500 mt-2">Expertly crafted and reviewed</p>
              </div>
              <div>
                <div className="text-5xl font-black text-blue-700 mb-3">50+</div>
                <div className="text-slate-600 font-semibold">Sub-Topics Covered</div>
                <p className="text-sm text-slate-500 mt-2">Comprehensive content library</p>
              </div>
              <div>
                <div className="text-5xl font-black text-blue-700 mb-3">100%</div>
                <div className="text-slate-600 font-semibold">NMLS Compliant</div>
                <p className="text-sm text-slate-500 mt-2">Always up-to-date standards</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
              Your Path to Success
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              A proven, systematic approach to NMLS exam preparation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Take Assessment',
                description: 'Start with a diagnostic test to identify your current knowledge level and weak areas'
              },
              {
                step: '02',
                title: 'Adaptive Learning',
                description: 'Our AI creates a personalized study plan focusing on topics you need to improve'
              },
              {
                step: '03',
                title: 'Pass With Confidence',
                description: 'Take full practice exams and track your progress until you\'re ready for the real test'
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-7xl font-black text-slate-100 mb-4">{item.step}</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24">
          <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl shadow-2xl p-16 text-center text-white">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Join thousands of successful NMLS exam takers who prepared with our platform
            </p>
            <Link
              href="/register"
              className="bg-white text-blue-700 hover:bg-blue-50 px-10 py-4 rounded-xl text-lg font-bold shadow-lg inline-flex items-center gap-3 transition-all"
            >
              Create Your Free Account
              <span>→</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">N</span>
              </div>
              <span className="font-bold text-slate-900">NMLS Test Prep</span>
            </div>
            <div className="text-sm text-slate-600">
              &copy; 2026 NMLS Test Prep. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
