import React from 'react'

function UploadMain({selectedImage,processedImage}) {
  return (
    <div className="flex flex-col items-center max-w-5xl w-full">
    <div className="flex flex-row border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden w-full h-96">
      <div className="w-1/2 bg-gray-100 flex items-center justify-center">
        {selectedImage && (
          <img
            src={selectedImage}
            alt="Uploaded Preview"
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="w-1/2 bg-gray-100 flex items-center justify-center">
        {processedImage ? (
          <img
            src={processedImage}
            alt="Processed Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <p className="text-gray-500">No processed image available</p>
        )}
      </div>
    </div>
    <div className="mt-4 flex gap-4">
      <button
        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 flex items-center"
        onClick={handleDownloadImage}
      >
        <FiDownload className="mr-2" />
        Download Processed Image
      </button>
      <button
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center"
        onClick={handleUploadNewImage}
      >
        <LuUpload className="mr-2" />
        Upload New Image
      </button>
    </div>
  </div>
  )
}

export default UploadMain
