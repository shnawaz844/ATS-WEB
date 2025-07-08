import { ChevronLeft } from "lucide-react";

const BackButtonMobile = () => {
    return (
        <div className="flex sm:hidden items-center w-full gap-4 p-2
        ">
            <button
                onClick={() => window.history.back()}
                className="flex items-center text-gray-700 hover:text-gray-200 transition-colors duration-200  hover:bg-gray-500 rounded-full px-3 py-1.5"
            >
                <ChevronLeft className="h-5 w-5 mr-1" />
                <span className="text-sm">Back</span>
            </button>
        </div>
    );
};

export default BackButtonMobile;
