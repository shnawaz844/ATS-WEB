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
    Trash2,
    Loader2
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
        image: null
    } )
    const [ isEditing, setIsEditing ] = useState( false )
    const [ editId, setEditId ] = useState( null )
    const [ searchTerm, setSearchTerm ] = useState( '' )
    const [ isSearching, setIsSearching ] = useState( false )
    const [ deleteConfirmDialog, setDeleteConfirmDialog ] = useState( {
        isOpen: false,
        company: null,
        isDeleting: false
    } )

    // Pagination state
    const [ currentPage, setCurrentPage ] = useState( 1 )
    const itemsPerPage = 6

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
            }
        } catch ( error ) {
            console.error( 'Error fetching companies:', error )
        }
    }

    // Delete confirmation dialog handlers
    const openDeleteDialog = ( company ) => {
        setDeleteConfirmDialog( {
            isOpen: true,
            company: company,
            isDeleting: false
        } )
    }

    const closeDeleteDialog = () => {
        setDeleteConfirmDialog( {
            isOpen: false,
            company: null,
            isDeleting: false
        } )
    }

    // Delete company function
    const handleDeleteCompany = async () => {
        if ( !deleteConfirmDialog.company ) return

        setDeleteConfirmDialog( prev => ( { ...prev, isDeleting: true } ) )

        try {
            const response = await fetch(
                `${ process.env.REACT_APP_BASE_URL }/companies/delete/${ deleteConfirmDialog.company.CompanyUserName }`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )

            if ( response.ok ) {
                toast.success( `Company "${ deleteConfirmDialog.company.CompanyUserName }" deleted successfully` )

                // If we're on a page that will be empty after deletion, go to previous page
                if ( companies.length === 1 && currentPage > 1 ) {
                    setCurrentPage( currentPage - 1 )
                } else {
                    // Refresh the current page
                    fetchCompanies()
                }

                closeDeleteDialog()
            } else {
                const errorData = await response.json()
                toast.error( errorData.message || 'Failed to delete company' )
                setDeleteConfirmDialog( prev => ( { ...prev, isDeleting: false } ) )
            }
        } catch ( error ) {
            console.error( 'Error deleting company:', error )
            toast.error( 'Failed to delete company. Please try again.' )
            setDeleteConfirmDialog( prev => ( { ...prev, isDeleting: false } ) )
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
            image: company.image || null
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
        e.preventDefault();

        if (
            !formData.CompanyUserName ||
            !formData.name ||
            !formData.email ||
            !formData.address ||
            !formData.phone ||
            !formData.website
        ) {
            alert( 'Please fill all required fields with "*"' );
            return;
        }

        // Create FormData for multipart/form-data
        const formPayload = new FormData();
        Object.entries( formData ).forEach( ( [ key, value ] ) => {
            if ( value !== undefined && value !== null ) {
                formPayload.append( key, value );
            }
        } );

        const url = isEditing
            ? `${ process.env.REACT_APP_BASE_URL }/companies/update/${ editId }`
            : `${ process.env.REACT_APP_BASE_URL }/companies/create`;

        try {
            const response = await fetch( url, {
                method: isEditing ? 'PUT' : 'POST',
                body: formPayload,
            } );

            if ( response.ok ) {
                if ( !isEditing ) setCurrentPage( 1 );
                fetchCompanies();
                closeDialog();
            } else {
                alert( `Failed to ${ isEditing ? 'update' : 'add' } company` );
            }
        } catch ( error ) {
            console.error( `Error ${ isEditing ? 'updating' : 'adding' } company:`, error );
        }
    };


    useEffect( () => {
        console.log( "formdata", formData )
    }, [ formData ] )


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
                                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-100 flex flex-col"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-200 rounded-xl">
                                            <Building2 className="text-blue-600" size={ 24 } />
                                        </div>
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            { company.CompanyUserName }
                                        </h2>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={ () => openEditDialog( company ) }
                                            className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-all duration-200"
                                        >
                                            <Edit size={ 18 } />
                                        </button>
                                        <button
                                            onClick={ ( e ) => {
                                                e.stopPropagation();
                                                openDeleteDialog( company );
                                            } }
                                            className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-all duration-200"
                                        >
                                            <Trash2 size={ 18 } />
                                        </button>
                                    </div>
                                </div>

                                {/* Improved Company Image Section */ }
                                { company.image && (
                                    <div className="mt-4 mb-4 flex justify-center items-center bg-gray-50 rounded-lg border border-gray-200 overflow-hidden h-40 relative group">
                                        <img
                                            src={ company.image }
                                            alt={ `${ company.CompanyUserName } logo` }
                                            className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                                            onError={ ( e ) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.classList.add( 'hidden' );
                                            } }
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>
                                ) }

                                <div className="mt-4 space-y-3 flex-grow">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Mail size={ 16 } className="text-gray-400" />
                                        <span className="truncate">{ company.email }</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <ChartNoAxesCombined size={ 16 } className="text-gray-400" />
                                        <span>{ company.name }</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MapPin size={ 16 } className="text-gray-400" />
                                        <span className="truncate">{ company.address }</span>
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
                                            className="text-blue-600 hover:underline truncate"
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
                                            <div className="space-y-6">
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
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Slug <span className="text-red-500">*</span>
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
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Company Logo
                                                    </label>
                                                    <div className="mt-1">
                                                        <label
                                                            htmlFor="image-upload"
                                                            className={ `cursor-pointer flex flex-col items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 overflow-hidden ${ formData.image ? 'h-auto min-h-32' : 'h-32'
                                                                }` }
                                                        >
                                                            { formData.image ? (
                                                                <div className="relative w-full flex items-center justify-center p-4 group">
                                                                    <img
                                                                        src={
                                                                            typeof formData.image === 'string'
                                                                                ? formData.image
                                                                                : URL.createObjectURL( formData.image )
                                                                        }
                                                                        alt="Company logo preview"
                                                                        className="h-auto rounded-lg shadow-sm"
                                                                        style={ { maxHeight: '100px', maxWidth: '150px' } } // Minimized logo size
                                                                        onError={ ( e ) => {
                                                                            console.error( 'Image failed to load:', formData.image );
                                                                            // Optionally show a fallback or placeholder
                                                                            e.target.style.display = 'none';
                                                                            e.target.nextSibling.style.display = 'flex';
                                                                        } }
                                                                        onLoad={ ( e ) => {
                                                                            console.log( 'Image loaded successfully', formData.image );
                                                                            if ( e.target.nextSibling ) {
                                                                                e.target.nextSibling.style.display = 'none';
                                                                            }
                                                                        } }
                                                                    />
                                                                    {/* Fallback content if image fails to load */ }
                                                                    <div
                                                                        className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-500"
                                                                        style={ { display: 'none' } }
                                                                    >
                                                                        <div className="text-center">
                                                                            <div className="text-sm">Image failed to load</div>
                                                                            <div className="text-xs mt-1">Click to select new image</div>
                                                                        </div>
                                                                    </div>
                                                                    {/* Hover overlay */ }
                                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black bg-opacity-50 rounded-lg">
                                                                        <div className="text-white text-sm px-3 py-1 rounded bg-black bg-opacity-70">
                                                                            Change Image
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                // No image selected
                                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                    <Plus className="w-8 h-8 text-gray-400 mb-2" />
                                                                    <p className="text-sm text-gray-500">
                                                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        PNG, JPG, GIF (MAX. 5MB)
                                                                    </p>
                                                                </div>
                                                            ) }
                                                            <input
                                                                id="image-upload"
                                                                name="image"
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={ ( e ) => {
                                                                    if ( e.target.files && e.target.files[ 0 ] ) {
                                                                        const file = e.target.files[ 0 ];

                                                                        // Optional: Add file size validation
                                                                        if ( file.size > 5 * 1024 * 1024 ) { // 5MB limit
                                                                            alert( 'File size must be less than 5MB' );
                                                                            return;
                                                                        }

                                                                        // Optional: Add file type validation
                                                                        if ( !file.type.startsWith( 'image/' ) ) {
                                                                            alert( 'Please select an image file' );
                                                                            return;
                                                                        }

                                                                        setFormData( prev => ( {
                                                                            ...prev,
                                                                            image: file
                                                                        } ) );

                                                                        console.log( 'New image selected:', file.name );
                                                                    }
                                                                } }
                                                            />
                                                        </label>
                                                    </div>
                                                    { formData.image && (
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={ () => {
                                                                    setFormData( prev => ( { ...prev, image: null } ) );
                                                                    // Clear the file input
                                                                    const fileInput = document.getElementById( 'image-upload' );
                                                                    if ( fileInput ) {
                                                                        fileInput.value = '';
                                                                    }
                                                                } }
                                                                className="text-sm text-red-600 hover:text-red-800 transition-colors duration-200"
                                                            >
                                                                Remove image
                                                            </button>
                                                            { typeof formData.image === 'string' && (
                                                                <span className="text-xs text-gray-500">
                                                                    Current: { formData.image.split( '/' ).pop() }
                                                                </span>
                                                            ) }
                                                            { typeof formData.image !== 'string' && (
                                                                <span className="text-xs text-gray-500">
                                                                    New: { formData.image.name }
                                                                </span>
                                                            ) }
                                                        </div>
                                                    ) }
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
                    </div >
                ) }

                {/* Delete Confirmation Dialog */ }
                {
                    deleteConfirmDialog.isOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Confirm Deletion
                                    </h3>
                                    <button
                                        onClick={ closeDeleteDialog }
                                        className="text-gray-400 hover:text-gray-600"
                                        disabled={ deleteConfirmDialog.isDeleting }
                                    >
                                        <X size={ 20 } />
                                    </button>
                                </div>
                                <p className="text-gray-600 mb-6">
                                    Are you sure you want to delete the company "
                                    <span className="font-semibold">
                                        { deleteConfirmDialog.company?.CompanyUserName }
                                    </span>
                                    "? This action cannot be undone.
                                </p>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={ closeDeleteDialog }
                                        disabled={ deleteConfirmDialog.isDeleting }
                                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={ handleDeleteCompany }
                                        disabled={ deleteConfirmDialog.isDeleting }
                                        className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors duration-200 flex items-center gap-2"
                                    >
                                        { deleteConfirmDialog.isDeleting ? (
                                            <>
                                                <Loader2 className="animate-spin h-4 w-4" />
                                                Deleting...
                                            </>
                                        ) : (
                                            'Delete Company'
                                        ) }
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

                <ToastContainer position="top-right" autoClose={ 3000 } />
            </div >
        </div >
    )
}

export default CompanyListing