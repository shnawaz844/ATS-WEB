import React, { useState, useEffect } from 'react'
import {
    Plus,
    Edit,
    Mail,
    MapPin,
    Building2,
    Search,
    X,
    ChevronLeft,
    ChevronRight,
    FilterX,
    Phone,
    Globe,
    ChartNoAxesCombined,
} from 'lucide-react'
import 'react-toastify/dist/ReactToastify.css'
import { toast, ToastContainer } from 'react-toastify'

const CompanyListing = () => {
    // State for company data, pagination, and search
    const [ companies, setCompanies ] = useState( [] )
    const [ totalCompanies, setTotalCompanies ] = useState( 0 )
    const [ isDialogOpen, setIsDialogOpen ] = useState( false )
    const [ formData, setFormData ] = useState( {
        CompanyUserName: '',
        name: '',
        email: '',
        address: '',
        phone: '',
        website: '',
    } )
    const [ isEditing, setIsEditing ] = useState( false )
    const [ editId, setEditId ] = useState( null )
    const [ searchTerm, setSearchTerm ] = useState( '' )
    const [ isSearching, setIsSearching ] = useState( false )

    // Pagination state
    const [ currentPage, setCurrentPage ] = useState( 1 )
    const itemsPerPage = 6

    // Dummy data in case API call fails
    const dummyCompanies = [
        {
            id: 1,
            name: 'Dummy Company 1',
            email: 'dummy1@example.com',
            address: '123 Dummy St',
            phone: '111-111-1111',
            website: 'https://dummy1.com',
        },
        {
            id: 2,
            name: 'Dummy Company 2',
            email: 'dummy2@example.com',
            address: '456 Dummy Ave',
            phone: '222-222-2222',
            website: 'https://dummy2.com',
        },
    ]

    // Calculate pagination indexes (for display purposes)
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const totalPages = Math.ceil( totalCompanies / itemsPerPage )

    // Function to fetch companies from API with page, limit, and search query parameters
    const fetchCompanies = async () => {
        try {
            const response = await fetch(
                `${ process.env.REACT_APP_BASE_URL }/companies/get?page=${ currentPage }&limit=${ itemsPerPage }&search=${ encodeURIComponent(
                    searchTerm
                ) }`
            )
            if ( response.ok ) {
                const data = await response.json()
                setCompanies( data.Companies )
                setTotalCompanies( data.totalCount )
                // Show success toast only on initial load or search
                if ( searchTerm && data.Companies.length > 0 ) {
                    toast.success( `Found ${ data.totalCount } companies matching "${ searchTerm }"` )
                } else if ( searchTerm && data.Companies.length === 0 ) {
                    toast.info( `No companies found matching "${ searchTerm }"` )
                }
            } else {
                // Fallback to dummy data if API responds with error status
                setCompanies( dummyCompanies )
                setTotalCompanies( dummyCompanies.length )
            }
        } catch ( error ) {
            console.error( 'Error fetching companies:', error )
            setCompanies( dummyCompanies )
            setTotalCompanies( dummyCompanies.length )
            
        }
    }

    // Re-fetch companies when currentPage, itemsPerPage, or searchTerm change
    useEffect( () => {
        fetchCompanies()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ currentPage, itemsPerPage, searchTerm ] )

    // Pagination controls
    const paginate = ( pageNumber ) => {
        setCurrentPage( pageNumber )
        window.scrollTo( { top: 0, behavior: 'smooth' } )
    }

    const nextPage = () => {
        if ( currentPage < totalPages ) {
            paginate( currentPage + 1 )
        }
    }

    const prevPage = () => {
        if ( currentPage > 1 ) {
            paginate( currentPage - 1 )
        }
    }

    // Search handlers
    const handleSearch = ( e ) => {
        const value = e.target.value
        setSearchTerm( value )
        setCurrentPage( 1 ) // Reset to first page on search
        setIsSearching( value.length > 0 )
    }

    const clearSearch = () => {
        setSearchTerm( '' )
        setIsSearching( false )
        setCurrentPage( 1 )
        toast.info( 'Search cleared' )
    }

    // Open dialog to add a new company (reset form)
    const openAddDialog = () => {
        setIsEditing( false )
        setFormData( {
            CompanyUserName: '',
            name: '',
            email: '',
            address: '',
            phone: '',
            website: '',
        } )
        setIsDialogOpen( true )
        toast.info( 'Ready to add a new company' )
    }

    // Open dialog to edit an existing company (populate form)
    const openEditDialog = ( company ) => {
        setIsEditing( true )
        setEditId( company._id )
        setFormData( {
            CompanyUserName: company.CompanyUserName,
            name: company.name,
            email: company.email,
            address: company.address,
            phone: company.phone,
            website: company.website,
        } )
        setIsDialogOpen( true )
    }

    const closeDialog = () => {
        setIsDialogOpen( false )
    }

    // Handle input changes in the form
    const handleChange = ( e ) => {
        const { name, value } = e.target
        setFormData( ( prev ) => ( { ...prev, [ name ]: value } ) )
    }

    // Submit handler for add/edit form
    const handleSubmit = async ( e ) => {
        e.preventDefault()
        // Ensure all required fields are filled
        if (
            !formData.CompanyUserName ||
            !formData.name ||
            !formData.email ||
            !formData.address ||
            !formData.phone ||
            !formData.website
        ) {
            alert( 'Please fill all required fields with "*"' )
            return
        }

        if ( isEditing ) {
            // Update existing company via PUT API call
            try {
                const response = await fetch( `${ process.env.REACT_APP_BASE_URL }/companies/update/${ editId }`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify( formData ),
                } )
                if ( response.ok ) {
                    // Refresh the list from API after update
                    fetchCompanies()
                    closeDialog()
                } else {
                    alert( 'Failed to update company' )
                }
            } catch ( error ) {
                console.error( 'Error updating company:', error )
            }
        } else {
            // Add a new company via POST API call
            try {
                const response = await fetch( `${ process.env.REACT_APP_BASE_URL }/companies/create`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify( formData ),
                } )
                if ( response.ok ) {
                    // Optionally, reset to page 1 and re-fetch the list after adding
                    setCurrentPage( 1 )
                    fetchCompanies()
                    closeDialog()
                } else {
                    alert( 'Failed to add company' )
                }
            } catch ( error ) {
                console.error( 'Error adding company:', error )
            }
        }
    }

    return (
        <div className="px-8 py-4 w-full min-h-screen"
            style={ { background: 'linear-gradient(90deg, rgba(189, 189, 189, 1) 0%, rgba(189, 189, 189, 1) 7%, rgba(255, 255, 255, 1) 100%)' } }
        >
            <div className="max-w-screen-2xl">
                {/* Header Section */ }
                <div className='mb-6 h-[15vh] flex items-center rounded-xl p-4 bg-gray-700'>
                    <div className="flex items-center w-full gap-4">
                        <ChartNoAxesCombined className="h-6 w-6 text-white" />
                        <h1 className="text-3xl font-bold text-white">Company Directory</h1>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="relative flex-grow">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search by company name, email, or address..."
                                value={ searchTerm }
                                onChange={ handleSearch }
                                className="w-[30vw] pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            />
                            { isSearching && (
                                <button
                                    onClick={ clearSearch }
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                                    title="Clear search"
                                >
                                    <FilterX
                                        size={ 20 }
                                        className="text-gray-400 hover:text-gray-600"
                                    />
                                </button>
                            ) }
                        </div>
                        <button
                            onClick={ openAddDialog }
                            className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 hover:text-white border border-white transition-colors duration-200 whitespace-nowrap shadow-sm"
                        >
                            <Plus size={ 20 } />
                            Add Company
                        </button>
                    </div>

                </div>
                <div className='pb-4 ml-4'>
                    <p className="text-white text-sm">
                        Showing{ ' ' }
                        { companies.length > 0
                            ? `${ indexOfFirstItem + 1 }-${ Math.min(
                                indexOfLastItem,
                                totalCompanies
                            ) }`
                            : 0 }{ ' ' }
                        of { totalCompanies } companies
                    </p>
                </div>

                {/* Company Cards Grid */ }
                { companies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        { companies.map( ( company ) => (
                            <div
                                key={ company.id }
                                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-100"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-200 rounded-xl">
                                            <Building2 className="text-blue-600" size={ 24 } />
                                        </div>
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            { company.name }
                                        </h2>
                                    </div>
                                    <button
                                        onClick={ () => openEditDialog( company ) }
                                        className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-all duration-200"
                                    >
                                        <Edit size={ 18 } />
                                    </button>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Mail size={ 16 } className="text-gray-400" />
                                        <span>{ company.email }</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MapPin size={ 16 } className="text-gray-400" />
                                        <span>{ company.address }</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Phone size={ 16 } className="text-gray-400" />
                                        <span>{ company.phone }</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Globe size={ 16 } className="text-gray-400" />
                                        <a
                                            href={ company.website }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            { company.website }
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ) ) }
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-600">
                            No companies found matching your search.
                        </p>
                    </div>
                ) }

                {/* Pagination Controls */ }
                { totalCompanies > itemsPerPage && (
                    <div className="flex justify-center items-center gap-2">
                        <button
                            onClick={ prevPage }
                            disabled={ currentPage === 1 }
                            className={ `p-2 rounded-lg ${ currentPage === 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-100'
                                }` }
                        >
                            <ChevronLeft size={ 20 } />
                        </button>

                        { Array.from( { length: totalPages }, ( _, i ) => i + 1 ).map(
                            ( number ) => (
                                <button
                                    key={ number }
                                    onClick={ () => paginate( number ) }
                                    className={ `px-4 py-2 rounded-lg transition-colors duration-200 ${ currentPage === number
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }` }
                                >
                                    { number }
                                </button>
                            )
                        ) }

                        <button
                            onClick={ nextPage }
                            disabled={ currentPage === totalPages }
                            className={ `p-2 rounded-lg ${ currentPage === totalPages
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-100'
                                }` }
                        >
                            <ChevronRight size={ 20 } />
                        </button>
                    </div>
                ) }

                {/* Modal Dialog for Add/Edit Company */ }
                { isDialogOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                            onClick={ closeDialog }
                        />
                        <div className="fixed inset-0 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl transform transition-all duration-300 border border-gray-200">
                                {/* Header */ }
                                <div className="relative bg-gray-700 px-6 py-4 flex">
                                    <h3 className="text-xl font-semibold text-white">
                                        { isEditing ? 'Edit Company' : 'Add New Company' }
                                    </h3>
                                    <button
                                        onClick={ closeDialog }
                                        className="absolute right-4 text-white hover:bg-white/20 rounded-full p-1 transition-all duration-200"
                                    >
                                        <X size={ 20 } />
                                    </button>
                                </div>

                                {/* Form content */ }
                                <div className="max-h-[calc(90vh-150px)] overflow-y-auto p-6">
                                    <form onSubmit={ handleSubmit } className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Left column */ }
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Unique Name <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            name="CompanyUserName"
                                                            value={ formData.CompanyUserName }
                                                            onChange={ handleChange }
                                                            required
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                            placeholder="Enter unique company name"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Company Name <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={ formData.name }
                                                        onChange={ handleChange }
                                                        required
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                        placeholder="Enter company name"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Email Address <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={ formData.email }
                                                        onChange={ handleChange }
                                                        required
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                        placeholder="Enter email address"
                                                    />
                                                </div>
                                            </div>

                                            {/* Right column */ }
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Address <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="address"
                                                        value={ formData.address }
                                                        onChange={ handleChange }
                                                        required
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                        placeholder="Enter company address"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Phone Number <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="phone"
                                                        value={ formData.phone }
                                                        onChange={ handleChange }
                                                        required
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                        placeholder="Enter phone number"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Website URL <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="url"
                                                        name="website"
                                                        value={ formData.website }
                                                        onChange={ handleChange }
                                                        required
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                        placeholder="Enter website URL"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer with buttons */ }
                                        <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-gray-200">
                                            <button
                                                type="button"
                                                onClick={ closeDialog }
                                                className="px-5 py-2.5 text-black bg-gray-500 hover:bg-gray-400 rounded-xl font-medium transition-colors duration-200"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-6 py-2.5 bg-gray-700 hover:bg-gray-500 text-white rounded-xl font-medium transition-colors duration-200 flex items-center gap-2"
                                            >
                                                { isEditing ? 'Save Changes' : 'Add Company' }
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                ) }
            </div>
        </div>
    )
}

export default CompanyListing
