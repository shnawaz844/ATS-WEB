import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export const useAuth = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const publicRoutes = [ '/', '/login', '/signup', '/all-posted-jobs', '/CompanyUserName'];

    useEffect( () => {
        // Check if current route is public
        const isPublicRoute = publicRoutes.includes( location.pathname ) ||
            location.pathname.startsWith( '/current-job/' ) ||
            location.pathname.includes( '/all-posted-jobs' ) ||
            location.pathname.match( /^\/[a-zA-Z0-9-]+$/ ) ||
            location.pathname.match('/sign')


        if ( isPublicRoute ) {
            return;
        }

        const token = localStorage.getItem( 'usertoken' );

        if ( token ) {
            try {
                const decodedToken = jwtDecode( token );
                const currentTime = Date.now() / 1000;

                if ( decodedToken.exp < currentTime ) {
                    localStorage.removeItem( 'usertoken' );
                    navigate( '/login' );
                }
            } catch ( error ) {
                console.error( 'Invalid token:', error );
                localStorage.removeItem( 'usertoken' );
                navigate( '/login' );
            }
        } else {
            navigate( '/login' );
        }
    }, [ location.pathname, navigate ] );
};
