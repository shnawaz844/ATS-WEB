import React from 'react';
import { User, Mail, Phone, MapPin, Briefcase, UserCircle2, BadgeInfo } from 'lucide-react';

const CandidateInfo = ({ applicationData }) => {
    const { candidateID, contactInfo } = applicationData;

    const capitalizeFirstLetter = ( string ) => {
        return string?.charAt( 0 ).toUpperCase() + string?.slice( 1 );
    };

    return (
        <div className="max-w-none mx-auto rounded-xl overflow-hidden transition-shadow border-2">
            <div className="p-6 space-y-4">
                
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 animate-fade-in">
                    <BadgeInfo className="text-blue-500" />
                    Candidate Profile
                </h2>

                <div className="grid grid-cols-[auto,1fr] gap-4">
                    <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                            <User className="text-blue-500 w-5 h-5" />
                            <span className="font-medium text-deepBlack"><strong>Name:</strong></span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Mail className="text-green-500 w-5 h-5" />
                            <span className="font-medium text-deepBlack"><strong>Email:</strong></span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <UserCircle2 className="text-purple-500 w-5 h-5" />
                            <span className="font-medium text-deepBlack"><strong>Gender:</strong></span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <MapPin className="text-red-500 w-5 h-5" />
                            <span className="font-medium text-deepBlack"><strong>Address:</strong></span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Phone className="text-teal-500 w-5 h-5" />
                            <span className="font-medium text-deepBlack"><strong>Contact:</strong></span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-gray-800">{ capitalizeFirstLetter(candidateID?.userName )|| 'N/A'}</p>
                        <p className="text-gray-800">{candidateID?.email || 'N/A'}</p>
                        <p className="text-gray-800">{candidateID?.gender || 'N/A'}</p>
                        <p className="text-gray-800">{ capitalizeFirstLetter(candidateID?.address) || 'N/A'}</p>
                        <p className="text-gray-800">{contactInfo || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateInfo;