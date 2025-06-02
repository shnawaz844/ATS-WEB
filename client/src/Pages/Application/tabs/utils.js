import { useState } from "react";

// Map Tailwind color names to actual color values
export const getStatusColor = (status) => {
    const colorMapping = {
        'New Submission': 'blue',
        'Initial Review': 'purple',
        'Screening': 'indigo',
        'Interview': 'cyan',
        'Offer': 'green',
        'Hired': 'emerald',
        'Withdrawn': 'yellow',
        'Rejected': 'red'
    };

    // If the status is known, return its color.
    if (colorMapping[status]) {
        return colorMapping[status];
    }

    // Fallback colors for unknown statuses.
    const fallbackColors = ['pink', 'teal', 'amber', 'orange', 'lime', 'violet'];

    // Generate a hash from the status string.
    let hash = 0;
    for (let i = 0; i < status?.length; i++) {
        hash = status.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Ensure a positive index within fallbackColors array bounds.
    const index = Math.abs(hash) % fallbackColors?.length;
    return fallbackColors[index];
};

export const CustomSelect = ( { options, selected, setSelected } ) => {
    const [ open, setOpen ] = useState( false );

    return (
        <div className="relative w-64">
            <button
                onClick={ () => setOpen( !open ) }
                className="w-full bg-gray-200 text-left px-4 py-2 rounded-xl focus:outline-none"
            >
                { selected || "Select an option" }
            </button>

            { open && (
                <ul className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-60 overflow-auto">
                    { options.map( ( option, index ) => {
                        const colorName = getStatusColor( option );
                        const bgColor = getColorStyles( colorName, 100 ); // background on idle
                        const hoverColor = getColorStyles( colorName, 500 ); // background on hover
                        const textColor = getColorStyles( colorName, 800 ); // text color

                        return (
                            <li
                                key={ index }
                                onClick={ () => {
                                    setSelected( option );
                                    setOpen( false );
                                } }
                                style={ {
                                    backgroundColor: bgColor,
                                    color: textColor,
                                } }
                                className="px-4 py-2 cursor-pointer transition-colors"
                                onMouseEnter={ ( e ) => ( e.currentTarget.style.backgroundColor = hoverColor ) }
                                onMouseLeave={ ( e ) => ( e.currentTarget.style.backgroundColor = bgColor ) }
                            >
                                { option }
                            </li>
                        );
                    } ) }
                </ul>
            ) }
        </div>
    );
};

// Map Tailwind color names to actual color values
export const getColorStyles = (colorName, variant) => {
    const colorMap = {
        blue: {
            50: '#eff6ff',
            100: '#dbeafe',
            500: '#3b82f6',
            700: '#1d4ed8',
            800: '#1e40af'
        },
        purple: {
            50: '#faf5ff',
            100: '#f3e8ff',
            500: '#a855f7',
            700: '#7e22ce',
            800: '#6b21a8'
        },
        indigo: {
            50: '#eef2ff',
            100: '#e0e7ff',
            500: '#6366f1',
            700: '#4338ca',
            800: '#3730a3'
        },
        cyan: {
            50: '#ecfeff',
            100: '#cffafe',
            500: '#06b6d4',
            700: '#0e7490',
            800: '#155e75'
        },
        green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            500: '#22c55e',
            700: '#15803d',
            800: '#166534'
        },
        emerald: {
            50: '#ecfdf5',
            100: '#d1fae5',
            500: '#10b981',
            700: '#047857',
            800: '#065f46'
        },
        yellow: {
            50: '#fefce8',
            100: '#fef9c3',
            500: '#eab308',
            700: '#a16207',
            800: '#854d0e'
        },
        red: {
            50: '#fef2f2',
            100: '#fee2e2',
            500: '#ef4444',
            700: '#b91c1c',
            800: '#991b1b'
        },
        pink: {
            50: '#fdf2f8',
            100: '#fce7f3',
            500: '#ec4899',
            700: '#be185d',
            800: '#9d174d'
        },
        teal: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            500: '#14b8a6',
            700: '#0f766e',
            800: '#115e59'
        },
        amber: {
            50: '#fffbeb',
            100: '#fef3c7',
            500: '#f59e0b',
            700: '#b45309',
            800: '#92400e'
        },
        orange: {
            50: '#fff7ed',
            100: '#ffedd5',
            500: '#f97316',
            700: '#c2410c',
            800: '#9a3412'
        },
        lime: {
            50: '#f7fee7',
            100: '#ecfccb',
            500: '#84cc16',
            700: '#4d7c0f',
            800: '#3f6212'
        },
        violet: {
            50: '#f5f3ff',
            100: '#ede9fe',
            500: '#8b5cf6',
            700: '#6d28d9',
            800: '#5b21b6'
        },
        gray: {
            50: '#f9fafb',
            100: '#f3f4f6',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563'
        }
    };

    return colorMap[colorName]?.[variant] || colorMap.gray[variant];
};