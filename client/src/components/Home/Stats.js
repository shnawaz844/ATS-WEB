const Stats = () => (
  <div className="py-20 translate-y-10 transition-all duration-700">
    <div className="max-w-screen-xl mx-auto px-4">
      <div className="grid md:grid-cols-3 gap-8 text-center">
        <div className="p-6">
          <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">500+</div>
          <p className="dark:text-slate-300 text-gray-600">Companies Using Our Platform</p>
        </div>
        <div className="p-6">
          <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">10,000+</div>
          <p className="dark:text-slate-300 text-gray-600">Jobs Posted Monthly</p>
        </div>
        <div className="p-6">
          <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">98%</div>
          <p className="dark:text-slate-300 text-gray-600">Customer Satisfaction</p>
        </div>
      </div>
    </div>
  </div>
);
export default Stats;