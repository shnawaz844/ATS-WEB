import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * ThemeToggle Component
 * Displays a toggle button to switch between light and dark themes
 * Shows Sun icon 🌞 when in dark mode (click to go light)
 * Shows Moon icon 🌙 when in light mode (click to go dark)
 */
const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition-all duration-200"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'dark' ? (
                <Sun className="w-5 h-5 transition-transform duration-300 hover:rotate-90" />
            ) : (
                <Moon className="w-5 h-5 transition-transform duration-300 hover:-rotate-12" />
            )}
        </button>
    );
};

export default ThemeToggle;
