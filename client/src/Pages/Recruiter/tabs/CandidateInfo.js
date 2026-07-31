import React from 'react';
import { User, Mail, Phone, MapPin, UserCircle2, BadgeInfo } from 'lucide-react';

const CandidateInfo = ({ applicationData = {} }) => {
    const { candidateID = {}, contactInfo, emailInfo, fullName, experience } = applicationData;

    // Helper to extract Name/City from experience string if present
    const parseExperienceMetadata = (expStr) => {
        if (!expStr) return {};
        const res = {};
        expStr.split(/\s*\|\s*/).forEach(part => {
            const clean = part.replace(/^Details:\s*/i, "");
            const idx = clean.indexOf(":");
            if (idx !== -1) {
                res[clean.substring(0, idx).trim().toLowerCase()] = clean.substring(idx + 1).trim();
            }
        });
        return res;
    };

    const expMeta = parseExperienceMetadata(experience);

    let waitlistName = '';
    if (applicationData['candidate-info'] && typeof applicationData['candidate-info'] === 'string') {
        const namePart = applicationData['candidate-info'].split('|').find(p => p.trim().startsWith('name:'));
        if (namePart) {
            waitlistName = namePart.split(':')[1]?.trim();
        }
    }

    const capitalizeWords = (str) => {
        if (!str) return "";

        return str
            .toLowerCase()
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const displayName = candidateID?.userName || waitlistName || fullName || expMeta.name || 'N/A';
    const displayEmail = candidateID?.email || emailInfo || 'N/A';
    const displayGender = candidateID?.gender || 'N/A';
    const displayAddress = candidateID?.address || expMeta.city || applicationData.city || 'N/A';
    const displayContact = contactInfo || candidateID?.contact || 'N/A';

    return (
        <div className="max-w-none mx-auto rounded-xl overflow-hidden transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm mb-6">
            <div className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <BadgeInfo className="text-blue-600" size={22} />
                    Candidate Profile
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <User className="text-blue-500 w-5 h-5 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Full Name</p>
                            <p className="font-semibold text-gray-800 dark:text-gray-100">{capitalizeWords(displayName)}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <Mail className="text-emerald-500 w-5 h-5 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Email Address</p>
                            <p className="font-semibold text-gray-800 dark:text-gray-100">{displayEmail}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <Phone className="text-teal-500 w-5 h-5 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Contact Number</p>
                            <p className="font-semibold text-gray-800 dark:text-gray-100">{displayContact}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <UserCircle2 className="text-purple-500 w-5 h-5 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Gender</p>
                            <p className="font-semibold text-gray-800 dark:text-gray-100">{capitalizeWords(displayGender)}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <MapPin className="text-rose-500 w-5 h-5 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">City / Address</p>
                            <p className="font-semibold text-gray-800 dark:text-gray-100">{capitalizeWords(displayAddress)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateInfo;
