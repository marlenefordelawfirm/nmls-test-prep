import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">NMLS Test Prep</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Pass Your NMLS Exam
            <span className="block text-indigo-600">With Confidence</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Comprehensive test preparation platform with adaptive learning, AI-powered
            study aids, and real exam simulations to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-3 rounded-md text-lg font-medium shadow-lg"
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className="bg-white text-indigo-600 hover:bg-gray-50 px-8 py-3 rounded-md text-lg font-medium border-2 border-indigo-600"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              5 Content Areas
            </h3>
            <p className="text-gray-600">
              Complete coverage of Federal Mortgage Laws, General Knowledge, Loan
              Origination, Ethics, and Uniform State Content
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Adaptive Learning
            </h3>
            <p className="text-gray-600">
              AI-powered algorithm identifies your weak areas and focuses on what you
              need to improve most
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Real Exam Simulation
            </h3>
            <p className="text-gray-600">
              Practice with full 125-question exams that mirror the actual NMLS test
              format and difficulty
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-24 bg-white rounded-lg shadow-xl p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">200+</div>
              <div className="text-gray-600">Practice Questions</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">50+</div>
              <div className="text-gray-600">Sub-Topics Covered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">100%</div>
              <div className="text-gray-600">NMLS Compliant</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of successful NMLS exam takers
          </p>
          <Link
            href="/register"
            className="bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-3 rounded-md text-lg font-medium shadow-lg inline-block"
          >
            Create Your Free Account
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2026 NMLS Test Prep. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
