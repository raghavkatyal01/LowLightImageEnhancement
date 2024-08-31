from django.http import JsonResponse, HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_POST
from rest_framework.views import APIView
from PIL import Image
import io
import numpy as np
import tensorflow as tf

# Constants
IMAGE_SIZE = (400, 600)  # Update to match model's expected input size
BATCH_SIZE = 1  # Set to 1 for testing a single image

# Define the preprocessing function with the correct size
def load_data(image_path):
    image = tf.io.read_file(image_path)
    image = tf.image.decode_png(image, channels=3)
    image = tf.image.resize(images=image, size=IMAGE_SIZE)  # Resize to (400, 600)
    image = image / 255.0
    return image


import tensorflow as tf
from PIL import Image
import numpy as np

# Assuming 'prediction' is the output tensor from the model
# Remove the batch dimension
def makeImage(prediction):
    predicted_image = tf.squeeze(prediction, axis=0)

# Scale the pixel values back to [0, 255]
    predicted_image = predicted_image * 255.0
    predicted_image = tf.clip_by_value(predicted_image, 0, 255)  # Ensure values are in valid range
    predicted_image = tf.cast(predicted_image, tf.uint8)  # Convert to uint8 type

    # Convert the tensor to a numpy array
    predicted_image_np = predicted_image.numpy()

    # Create an Image object from the numpy array
    image = Image.fromarray(predicted_image_np)

    # Save the image
    image.save('moon_2_pred_1.png')
    print("Image saved as 'predicted_image.png'")
    return image

class ProcessImageView(APIView):
    
    def get(self, request):
        # Return an HTML form for image upload
        html_form = '''
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Image Upload</title>
            </head>
            <body>
                <h1>Upload an Image</h1>
                <form id="uploadForm" enctype="multipart/form-data" method="post">
                    <label for="image">Select an image:</label>
                    <input type="file" id="image" name="image" accept="image/jpeg, image/png" required>
                    <br><br>
                    <input type="submit" value="Upload">
                </form>

                <h2>Processed Image:</h2>
                <img id="processedImage" src="" alt="Processed Image will appear here" style="max-width: 500px; display: none;">

                <script>
                    document.getElementById('uploadForm').onsubmit = function(event) {
                        event.preventDefault();  // Prevent form from submitting the traditional way

                        const formData = new FormData();
                        const imageFile = document.getElementById('image').files[0];
                        formData.append('image', imageFile);

                        fetch('', {
                            method: 'POST',
                            body: formData
                        })
                        .then(response => {
                            if (response.ok) {
                                return response.blob();
                            } else {
                                return Promise.reject('Failed to upload and process image');
                            }
                        })
                        .then(blob => {
                            const imgUrl = URL.createObjectURL(blob);
                            const imgElement = document.getElementById('processedImage');
                            imgElement.src = imgUrl;
                            imgElement.style.display = 'block';
                        })
                        .catch(error => console.error(error));
                    }
                </script>
            </body>
            </html>
        '''
        return HttpResponse(html_form)
    
    @method_decorator(require_POST)
    def post(self, request):
        # Retrieve the image from the request
        image_file = request.FILES.get('image')
        
        if not image_file:
            return JsonResponse({"error": "No image provided"}, status=400)
        
        # Validate the image format (optional)
        if not image_file.content_type in ['image/jpeg', 'image/png']:
            return JsonResponse({"error": "Unsupported file format. Please upload JPEG or PNG images."}, status=400)

        try:
            # Open the image using Pillow
            # image = Image.open(image_file).convert('RGB')

            # Convert the PIL image to a TensorFlow tensor
            loaded_model = tf.saved_model.load('zero_dce_model')

            # Path to the image you want to test
            test_image_path = 'Moon_Image_scaled.jpg'  # Replace with the actual path to your image

            # Preprocess the image and create a batch
            # test_image = load_data(test_image_path)
            test_image = tf.expand_dims(image_file, axis=0)  # Expand dimensions to create a batch

            # Use the model to make a prediction on the preprocessed image
            prediction = loaded_model(test_image, training=False)  # Explicitly set training=False if needed

            image = makeImage(prediction=prediction)
            

            # Return the processed image as an HTTP response
            return HttpResponse(image, content_type='image/jpeg')

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
