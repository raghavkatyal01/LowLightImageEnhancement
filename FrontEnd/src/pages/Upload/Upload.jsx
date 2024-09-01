import React, { useState } from "react";
import { HiArrowNarrowLeft } from "react-icons/hi";
import { Link } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { LuUpload } from "react-icons/lu";
import { FiDownload } from "react-icons/fi";

function Upload() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [split, setSplit] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedImage) return;

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

        {loading && (
          <div className="flex flex-row border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden max-w-5xl w-full h-96">
            <div className="w-full flex items-center justify-center">
              <FaSpinner className="animate-spin text-gray-600 text-5xl" />
            </div>
          </div>
        )}

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
        ) : (
          <div className="flex flex-row border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden max-w-4xl w-full h-96">
            <div className="w-1/2 bg-gray-100 flex items-center justify-center">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Uploaded Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <p className="text-gray-500">No image uploaded</p>
              )}
            </div>

            <div className="w-1/2 p-8 flex flex-col justify-center bg-white">
              <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                Image Enhancer
              </h1>
              <p className="text-gray-600 mb-8">
                Upload your images and enhance them using our advanced algorithm.
              </p>

              <div className="flex flex-col h-full gap-2">
                <input
                  type="file"
                  onChange={handleImageUpload}
                  className="mb-4 hidden"
                  id="fileInput"
                />
                <label
                  htmlFor="fileInput"
                  className="cursor-pointer px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 w-full"
                >
                  Choose File
                </label>
                <button
                  className={`px-6 py-3 rounded-lg transition duration-200 w-full flex justify-center items-center ${
                    selectedImage
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  onClick={handleUploadImage}
                  disabled={!selectedImage}
                >
                  <LuUpload className="mr-2" />
                  Upload Image
                </button>
                {error && <p className="text-red-500 mt-2">{error}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Upload;
