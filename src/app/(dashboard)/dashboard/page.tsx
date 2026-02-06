import { getCurrentUser } from '@/lib/utils/auth';

const CONTENT_AREAS = [
  {
    id: 'federal-laws',
    title: 'Federal Mortgage-Related Laws',
    description: 'TILA, RESPA, SAFE Act, and other federal regulations',
    icon: '📋',
    color: 'bg-blue-500',
    progress: 0
  },
  {
    id: 'general-knowledge',
    title: 'General Mortgage Knowledge',
    description: 'Mortgage products, underwriting, and industry practices',
    icon: '🏠',
    color: 'bg-green-500',
    progress: 0
  },
  {
    id: 'loan-origination',
    title: 'Mortgage Loan Origination',
    description: 'Application process, documentation, and origination activities',
    icon: '📝',
    color: 'bg-purple-500',
    progress: 0
  },
  {
    id: 'ethics',
    title: 'Ethics',
    description: 'Professional conduct and ethical standards in lending',
    icon: '⚖️',
    color: 'bg-orange-500',
    progress: 0
  },
  {
    id: 'uniform-state',
    title: 'Uniform State Content',
    description: 'State-specific regulations and requirements',
    icon: '🗺️',
    color: 'bg-indigo-500',
    progress: 0
  }
];

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome{user?.name ? `, ${user.name}` : ''}!
        </h1>
        <p className="mt-2 text-gray-600">
          Start your NMLS test preparation journey. Select a content area below to begin practicing.
        </p>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Overall Progress</h2>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500">0% Complete</div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
            style={{ width: '0%' }}
          ></div>
        </div>
      </div>

      {/* Content Areas Grid */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Content Areas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CONTENT_AREAS.map((area) => (
            <div
              key={area.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              <div className={`${area.color} h-2`}></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{area.icon}</div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    area.progress === 0 ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                  }`}>
                    {area.progress}% Complete
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {area.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {area.description}
                </p>

                <div className="space-y-2">
                  <button
                    className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                    disabled
                  >
                    Start Practice
                  </button>
                  <button
                    className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                    disabled
                  >
                    View Progress
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${area.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${area.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Tests Taken</div>
          <div className="text-3xl font-bold text-gray-900">0</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Questions Answered</div>
          <div className="text-3xl font-bold text-gray-900">0</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Average Score</div>
          <div className="text-3xl font-bold text-gray-900">--</div>
        </div>
      </div>
    </div>
  );
}
