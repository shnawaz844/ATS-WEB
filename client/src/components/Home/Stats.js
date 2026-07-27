import { useTheme } from "../../context/ThemeContext";

const Stats = () => {
  const { theme } = useTheme();

  return (
    <div className="py-20 translate-y-10 transition-all duration-700">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className={`text-4xl md:text-5xl font-bold mb-2 ${theme === "dark" ? "text-purple-400" : "text-purple-700"}`}>500+</div>
            <p className={`transition-colors duration-300 ${theme === "dark" ? "text-slate-300" : "text-gray-900"}`}>Companies Using Our Platform</p>
          </div>
          <div className="p-6">
            <div className={`text-4xl md:text-5xl font-bold mb-2 ${theme === "dark" ? "text-purple-400" : "text-purple-700"}`}>10,000+</div>
            <p className={`transition-colors duration-300 ${theme === "dark" ? "text-slate-300" : "text-gray-900"}`}>Jobs Posted Monthly</p>
          </div>
          <div className="p-6">
            <div className={`text-4xl md:text-5xl font-bold mb-2 ${theme === "dark" ? "text-purple-400" : "text-purple-700"}`}>98%</div>
            <p className={`transition-colors duration-300 ${theme === "dark" ? "text-slate-300" : "text-gray-900"}`}>Customer Satisfaction</p>
          </div>
        </div>
      </div>
    </div>
  )
};
export default Stats;
