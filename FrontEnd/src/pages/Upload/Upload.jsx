import React, { useState } from "react";
import { HiArrowNarrowLeft } from "react-icons/hi";
import { Link } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";

import { FiDownload } from "react-icons/fi";
import UploadMain from "./UploadMain";
import { LuUpload } from "react-icons/lu";

function Upload() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [split, setSplit] = useState(false);

         

  const handleUploadImage = async () => {
  
    if (!selectedImage) return;
    setSplit(true)
    setLoading(true);
    setError(null);

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("image", dataURLToFile(selectedImage, "image.png"));

      // Send request to backend
      const response = await fetch("http://localhost:8000/api/predict/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload and process image");
      }

      // Get the processed image blob and convert it to URL
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      setProcessedImage(imageUrl);
      setSplit(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadImage = () => {
    if (!processedImage) return;

    const link = document.createElement("a");
    link.href = processedImage;
    link.download = "processed-image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadNewImage = () => {
    setSelectedImage(null);
    setProcessedImage(null);
    setSplit(false);
  };

  // Convert Data URL to File
  const dataURLToFile = (dataURL, filename) => {
    const [header, data] = dataURL.split(",");
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(data);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new File([new Uint8Array(array)], filename, { type: mime });
  };

  let bgImage = "https://i.ibb.co/QJgRcYD/stars.jpg";

  return (
    <>
      <div
        className="flex flex-col items-center justify-center px-4 relative min-h-screen"
        style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover" }}
      >
        <Link to="/" className="self-start mb-4">
          <HiArrowNarrowLeft color="white" className="text-3xl text-gray-600 hover:text-indigo-600 transition-colors duration-200" />
        </Link>


        {split ? (
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
                {loading?(<div className="w-full flex items-center justify-center">
              <FaSpinner className="animate-spin text-gray-600 text-5xl" />
            </div>):(processedImage && 
                  <img
                    src={processedImage}
                    alt="Processed Preview"
                    className="w-full h-full object-cover"
                  />
                )  }
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
        ):<UploadMain handleUploadImage={handleUploadImage} selectedImage={selectedImage} setSelectedImage={setSelectedImage} error={error} /> }
      </div>
    </>
  );
}

export default Upload;
