import { ChevronLeft } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const BackButtonMobile = () => {
    const { theme } = useTheme();

    return (
        <div className="flex sm:hidden items-center w-full gap-4 p-2">
            <button
                onClick={() => window.history.back()}
                className={`flex items-center transition-colors duration-200 rounded-full px-3 py-1.5 ${theme === "dark"
                        ? "text-gray-300 hover:text-white hover:bg-gray-700"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-200"
                    }`}
            >
                <ChevronLeft className="h-5 w-5 mr-1" />
                <span className="text-sm">Back</span>
            </button>
        </div>
    );
};

export default BackButtonMobile;

