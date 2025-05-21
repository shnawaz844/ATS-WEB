import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import { Country, State, City } from 'country-state-city';
import TimePicker from 'react-time-picker';
import ReactQuill from 'react-quill';
import CandidateForm from './CandidateForm';
import 'react-quill/dist/quill.snow.css';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';

const FORM_OPTIONS = {
  location: [
    { value: 'Remote', label: 'Remote' },
    { value: 'On-site', label: 'On-site' },
    { value: 'Hybrid', label: 'Hybrid' }
  ],
  employment: [
    { value: 'Full-Time', label: 'Full-Time' },
    { value: 'Part-Time', label: 'Part-Time' },
    { value: 'Contract', label: 'Contract' }
  ],
  schedule: [
    { value: 'Flexible', label: 'Flexible' },
    { value: 'Morning Shift', label: 'Morning Shift' },
    { value: 'Day Shift', label: 'Day Shift' },
    { value: 'Night Shift', label: 'Night Shift' }
  ],
  hire: [
    { value: 'New', label: 'New' },
    { value: 'Replacement', label: 'Replacement' }
  ],
  status: [
    { value: 'Approve', label: 'Approve' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Filled', label: 'Filled' },
    { value: 'On Hold', label: 'On Hold' }
  ]
};

const capitalizeFirstLetter = ( string ) => {
  return string.charAt( 0 ).toUpperCase() + string.slice( 1 );
};

const FormField = ( {
  label,
  error,
  children
} ) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{ label }</label>
    { children }
    { error && <span className="text-sm text-red-500">{ error }</span> }
  </div>
);

const FormInput = ( {
  label,
  register,
  name,
  type = 'text',
  error,
  placeholder,
  options,
  ...props
} ) => (
  <FormField label={ label } error={ error }>
    { type === 'select' ? (
      <select
        { ...register( name ) }
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        { ...props }
      >
        <option value="" disabled>Select { label.toLowerCase() }</option>
        { options?.map( ( { value, label } ) => (
          <option key={ value } value={ value }>{ label }</option>
        ) ) }
      </select>
    ) : (
      <input
        type={ type }
        { ...register( name ) }
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400"
        placeholder={ placeholder }
        { ...props }
      />
    ) }
  </FormField>
);

const LocationPicker = ( {
  selectedCountry,
  setSelectedCountry,
  selectedState,
  setSelectedState,
  selectedCity,
  setSelectedCity,
  errors
} ) => {
  const countries = Country.getAllCountries();
  const states = selectedCountry ? State.getStatesOfCountry( selectedCountry ) : [];
  const cities = selectedState ? City.getCitiesOfState( selectedCountry, selectedState ) : [];

  const handleCityChange = ( e ) => {
    const cityName = e.target.value;
    setSelectedCity( cityName );  // Set selected city name
    console.log( "Selected City: ", cityName );
  };

  return (
    <div className="space-y-4">
      <FormField label="Country" error={ errors?.country }>
        <select
          value={ selectedCountry }
          onChange={ ( e ) => {
            setSelectedCountry( e.target.value );
            setSelectedState( '' );
            setSelectedCity( '' );
          } }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option value="">Select Country</option>
          { countries.map( country => (
            <option key={ country.isoCode } value={ country.name }>
              { country.name }
            </option>
          ) ) }
        </select>
      </FormField>

      <FormField label="State" error={ errors?.state }>
        <select
          value={ selectedState }
          onChange={ ( e ) => {
            setSelectedState( e.target.value );
            setSelectedCity( '' );
          } }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          disabled={ !selectedCountry }
        >
          <option value="">Select State</option>
          { states.map( state => (
            <option key={ state.isoCode } value={ state.name }>
              { state.name }
            </option>
          ) ) }
        </select>
      </FormField>

      <FormField label="City" error={ errors?.city }>
        <select
          value={ selectedCity }
          onChange={ handleCityChange }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          disabled={ !selectedState }
        >
          <option value="">Select City</option>
          { cities.map( city => (
            <option key={ city.name } value={ city.name }>
              { city.name }
            </option>
          ) ) }
        </select>
      </FormField>
    </div>
  );
};

const ShiftPicker = ( {
  shiftStart,
  setShiftStart,
  shiftEnd,
  setShiftEnd,
  errors
} ) => (
  <div className="grid grid-cols-2 gap-4">
    <FormField label="Shift Start" error={ errors?.shiftStart }>
      <TimePicker
        onChange={ setShiftStart }
        value={ shiftStart }
        disableClock={ true }
        format="hh:mm a"
        className="w-full"
      />
    </FormField>
    <FormField label="Shift End" error={ errors?.shiftEnd }>
      <TimePicker
        onChange={ setShiftEnd }
        value={ shiftEnd }
        disableClock={ true }
        format="hh:mm a"
        className="w-full"
      />
    </FormField>
  </div>
);

export const PostJobForm = ( {
  jobToEdit,
  handleSubmit,
  onSubmit,
  errors,
  register,
  control,
  shiftStart,
  setShiftStart,
  shiftEnd,
  setShiftEnd,
  questions,
  setQuestions,
  addQuestion,
  handleDeleteQuestion,
  selectedCountry,
  setSelectedCountry,
  selectedState,
  setSelectedState,
  selectedCity,
  setSelectedCity,
  recruiterRole,
  // recruiterName
} ) => {
  const [ isHead, setIsHead ] = React.useState( false );
  const [ recruitersList, setRecruitersList ] = useState( [] );
  const [ hiringManagersList, setHiringManagersList ] = useState( [] );
  const companyId = JSON.parse( localStorage.getItem( "user" ) ).company_id; 
  // console.log( "recruiterRole>>>>", recruiterRole )


  useEffect( () => {
    console.log( "Recruiter Role in useEffect:", recruiterRole );
    if ( recruiterRole === true ) {  // Check if recruiterRole is true
      setIsHead( true );  // Set to true if recruiterRole is true
    } else {
      setIsHead( false );  // Set to false otherwise
    }
  }, [ recruiterRole ] );


  useEffect( () => {
    const fetchRecruiters = async () => {
      try {
        const response = await fetch( `${ process.env.REACT_APP_BASE_URL }/recruiter/all-recruiter`, {
          headers: {
            'company_id': companyId  // Pass company_id in headers
          }
        } );
        const data = await response.json();
        console.log( 'Fetched Recruiters:', data );
        setRecruitersList( data ); // Assuming response contains a list of recruiters
      } catch ( error ) {
        console.error( 'Error fetching recruiters:', error );
      }
    };

    fetchRecruiters();
  }, [] );

  useEffect( () => {
    const fetchHiringManagers = async () => {
      try {
        const response = await fetch( `${ process.env.REACT_APP_BASE_URL }/hiringmanager/all-hiring-manager`, {
          headers: {
            'company_id': companyId
          }
        } );
        const data = await response.json();
        console.log( 'Fetched Hiring Managers:', data );
        setHiringManagersList( data );
      } catch ( error ) {
        console.error( 'Error fetching hiring managers:', error );
      }
    };

    fetchHiringManagers();
  }, [] );


  // console.log( "recruitersList", recruitersList )
  return (
    <div className="min-h-screen py-12"
      style={ { background: 'linear-gradient(135deg, #ffffff, #808080)' } }>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            { jobToEdit ? 'Edit Job Posting' : 'Create New Job Posting' }
          </h1>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <form onSubmit={ handleSubmit( onSubmit ) } className="p-6 sm:p-8 space-y-8">
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Job Details</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Fill in the basic information about the position.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label={ capitalizeFirstLetter("Title")}
                    register={ register }
                    name="title"
                    error={ errors?.title }
                    placeholder="Ex: Software Engineer"
                  />

                  <FormInput
                    label="Location Type"
                    register={ register }
                    name="locationType"
                    type="select"
                    options={ FORM_OPTIONS.location }
                    error={ errors?.locationType }
                  />

                  <FormInput
                    label="Employment Type"
                    register={ register }
                    name="type"
                    type="select"
                    options={ FORM_OPTIONS.employment }
                    error={ errors?.type }
                  />

                  <FormInput
                    label="Schedule Type"
                    register={ register }
                    name="scheduleType"
                    type="select"
                    options={ FORM_OPTIONS.schedule }
                    error={ errors?.scheduleType }
                  />

                  <ShiftPicker
                    shiftStart={ shiftStart }
                    setShiftStart={ setShiftStart }
                    shiftEnd={ shiftEnd }
                    setShiftEnd={ setShiftEnd }
                    errors={ errors }
                  />

                  <FormInput
                    label="Hire Type"
                    register={ register }
                    name="hireType"
                    type="select"
                    options={ FORM_OPTIONS.hire }
                    error={ errors?.hireType }
                  />

                  <FormInput
                    label="Compensation"
                    register={ register }
                    name="compensation"
                    type="number"
                    error={ errors?.compensation }
                    placeholder="Ex: 50000"
                  />

                  <FormInput
                    label="Experience Required (years)"
                    register={ register }
                    name="experienceRequired"
                    type="number"
                    error={ errors?.experienceRequired }
                    placeholder="Ex: 3"
                  />

                  <FormInput
                    label="Required Number of Resources"
                    register={ register }
                    name="requiredResources"
                    type="number"
                    error={ errors?.requiredResources }
                    placeholder="Ex: 5"
                  />

                  <FormInput
                    label="Status"
                    register={ register }
                    name="status"
                    type="select"
                    options={ FORM_OPTIONS.status }
                    error={ errors?.status }
                  />

                  {/* Conditional Recruiter Name Field */ }
                  { isHead && (
                    <FormField label="Recruiter Name" error={ errors?.recruiterName }>
                      <select
                        { ...register( "recruiterName" ) }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">Select Recruiter</option>
                        { recruitersList && recruitersList.length > 0 ? (
                          recruitersList.map( ( recruiter ) => (
                            <option key={ recruiter._id } value={ recruiter._id }>
                              { recruiter.userName }
                            </option>
                          ) )
                        ) : (
                          <option disabled>No recruiters found</option>
                        ) }
                      </select>
                    </FormField>
                  ) }

                  <FormField label="Hiring Manager Email" error={ errors?.hiringManagerEmail }>
                    <select
                      { ...register( "hiringManagerEmail", {
                        required: "Hiring Manager is required"
                      } ) }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select Hiring Manager</option>
                      { hiringManagersList && hiringManagersList.length > 0 ? (
                        hiringManagersList.map( ( manager ) => (
                          <option key={ manager._id } value={ manager.email }>
                          { manager.email }
                          </option>
                        ) )
                      ) : (
                        <option disabled>No hiring managers found</option>
                      ) }
                    </select>
                  </FormField>

                  {/* Hiring Manager Dropdown */ }
                  <FormField label="Hiring Manager Name">
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select Hiring Manager</option>
                      { hiringManagersList && hiringManagersList.length > 0 ? (
                        hiringManagersList.map( ( manager ) => (
                          <option key={ manager._id } value={ manager._id }>
                            { manager.userName }
                          </option>
                        ) )
                      ) : (
                        <option disabled>No hiring managers found</option>
                      ) }
                    </select>
                  </FormField>

                  <div className="col-span-2">
                    <LocationPicker
                      selectedCountry={ selectedCountry }
                      setSelectedCountry={ setSelectedCountry }
                      selectedState={ selectedState }
                      setSelectedState={ setSelectedState }
                      selectedCity={ selectedCity }
                      setSelectedCity={ setSelectedCity }
                      errors={ errors }
                    />
                  </div>
                </div>
              </div>

              <FormField label="Description" error={ errors?.description }>
                <Controller
                  name="description"
                  control={ control }
                  render={ ( { field } ) => (
                    <ReactQuill
                      { ...field }
                      theme="snow"
                      className="bg-white border rounded"
                    />
                  ) }
                />
              </FormField>

              <CandidateForm
                questions={ questions }
                setQuestions={ setQuestions }
                addQuestion={ addQuestion }
                handleDeleteQuestion={ handleDeleteQuestion }
              />

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="px-8 py-3 bg-gray-700 text-white font-medium hover:bg-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  { jobToEdit ? 'Update Job Post' : 'Create Job Post' }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJobForm;
