import React from 'react';
import Marquee from 'react-fast-marquee';

function Companies() {
    return (
        <div className="w-full py-8 relative overflow-hidden bg-slate-900/50">
            <div className="flex items-center justify-center w-full">
                <h2 className="text-center text-gray-100 text-3xl font-semibold mb-10 mt-8 h-20">Trusted by <span className="text-blue-500 relative">Leading Companies
                </span>
                </h2>
            </div>
            {/* Container with fade effects */ }
            <div className="relative">
                {/* Left fade gradient */ }
                <div className="absolute left-0 top-0 h-full w-24 z-10 "></div>

                {/* Right fade gradient */ }
                <div className="absolute right-0 top-0 h-full w-24 z-10 "></div>

                {/* Marquee component */ }
                <div className="px-4 py-6">
                    <Marquee pauseOnHover={ true } speed={ 40 } gradient={ false }>
                        <div className="flex items-center space-x-12 mx-4">
                            { [
                                "mar1.webp", "mar2.webp", "mar3.webp", "mar4.webp",
                                "mar5.webp", "mar6.jpg", "mar7.jpg", "mar10.png",
                                "marr1.webp", "marr2.webp", "marr3.webp"
                            ].map( ( src, index ) => (
                                <div key={ index } className="flex flex-col items-center">
                                    <img
                                        src={ src }
                                        alt={ `Company logo ${ index + 1 }` }
                                        className="w-28 h-28 object-contain filter brightness-100 hover:brightness-125 transition-all duration-300"
                                    />
                                </div>
                            ) ) }
                        </div>
                    </Marquee>
                </div>
            </div>
        </div>
    );
}

export default Companies;