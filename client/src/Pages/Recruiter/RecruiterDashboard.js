import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
    UserPlus,
    CheckCircle,
    Briefcase,
    XCircle,
    Users,
    TrendingUp,
    Calendar,
    ClipboardList,
    Activity,
} from "lucide-react";

// Chart.js Configuration
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import axios from "axios";
import { useApplicationStatuses } from "../../hooks/useApplicationStatuses";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const RecruiterDashboard = ( isOpen ) => {
    const [ job, setJob ] = useState();
    const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;
     const [ statusMap, setStatusMap ] = useState( {} );
      const { data: jobData, isLoading, isError } = useApplicationStatuses(
             companyId
         );

      useEffect(() => {
        console.log("hello");
        fetch(`${ process.env.REACT_APP_BASE_URL }/jobs/all-jobs`)
          .then((res) => res.json())
          .then((data) => setJob(data));
      }, []);

          // Fetch all application statuses once
          useEffect( () => {
              if ( isOpen ) {
                  axios.get(
                      `${ process.env.REACT_APP_BASE_URL }/application-statuses/all-application-statuses`,
                      { headers: { company_id: companyId } }
                  )
                      .then( res => {
                          const map = {};
                          res.data.applicationStatuses.forEach( s => {
                              map[ s._id ] = s.applicationStatus;
                          } );
                          setStatusMap( map );
                      } )
                      .catch( err => console.error( "Failed to load statuses", err ) );
              }
          }, [ companyId, isOpen ] );

          const fetchScheduledInterviews = async ( { queryKey } ) => {
              const [ key, { page, limit, searchTerm, candidateID, filterStatus, filterRound, jobID, interviewerID } ] = queryKey;
          
              const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id;
              let apiUrl = ""
              if ( candidateID ) {
                  apiUrl = `/applicationscheduledlist/scheduled-interviewer-app?page=${ page }&limit=${ limit }&searchTerm=${ searchTerm || '' }&candidateID=${ candidateID }&filterStatus=${ filterStatus || '' }&filterRound=${ filterRound || '' }&jobID=${ jobID || '' }`;
              } else if ( interviewerID ) {
                  apiUrl = `/applicationscheduledlist/scheduled-interviewer-app?page=${ page }&limit=${ limit }&searchTerm=${ searchTerm || '' }&interviewerID=${ interviewerID }&filterStatus=${ filterStatus || '' }&filterRound=${ filterRound || '' }&jobID=${ jobID || '' }`;
              }
          
              const response = await axios.get(
                  `${ process.env.REACT_APP_BASE_URL }${ apiUrl }`,
                  {
                      headers: {
                          "company_id": companyId,
                      },
                  }
              );
          
              return response.data;
          };

    return (
        <>
         
        </>
    );
};

export default RecruiterDashboard;


