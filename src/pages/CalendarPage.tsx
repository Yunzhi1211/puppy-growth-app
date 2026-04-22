export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">日历提醒</h1>

        {/* 日历视图占位 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="text-center text-gray-400 py-12">
            日历功能开发中...
          </div>
        </div>

        {/* 即将到来的提醒 */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-gray-800 mb-4">即将到来</h2>
          <div className="text-center text-gray-400 py-8">
            暂无提醒事项
          </div>
        </div>
      </div>
    </div>
  );
}
