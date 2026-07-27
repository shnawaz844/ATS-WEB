import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const useCompanyCheck = () => {
    const navigate = useNavigate();
    const initialCompanyUserName = useRef( null );

    // Function to check if user is logged in by validating token
    const isLoggedIn = () => {
        const token = localStorage.getItem( "usertoken" );
        if ( !token ) return false;
        try {
            const decodedToken = jwtDecode( token );
            const currentTime = Date.now() / 1000;
            return decodedToken.exp > currentTime;
        } catch ( error ) {
            return false;
        }
    };

    useEffect( () => {
        // Store initial companyUserName on mount
        initialCompanyUserName.current = localStorage.getItem( "companyUserName" );

        // Handler for storage event to detect changes in localStorage
        const handleStorageChange = ( event ) => {
            if ( event.key === "companyUserName" ) {
                const newCompanyUserName = event.newValue;
                if (
                    isLoggedIn() &&
                    initialCompanyUserName.current &&
                    newCompanyUserName !== initialCompanyUserName.current
                ) {
                    navigate( "/notfound" );
                }
            }
        };

        window.addEventListener( "storage", handleStorageChange );

        return () => {
            window.removeEventListener( "storage", handleStorageChange );
        };
    }, [ navigate ] );
};

export default useCompanyCheck;
