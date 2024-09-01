from django.http import JsonResponse, HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_POST
from rest_framework.views import APIView
from PIL import Image
import io
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing import image
import numpy as np
import matplotlib.pyplot as plt
import os

def build_dce_net():
    input_img = keras.Input(shape=[None, None, 3])
    conv1 = layers.Conv2D(
        32, (3, 3), strides=(1, 1), activation="relu", padding="same"
    )(input_img)
    conv2 = layers.Conv2D(
        32, (3, 3), strides=(1, 1), activation="relu", padding="same"
    )(conv1)
    conv3 = layers.Conv2D(
        32, (3, 3), strides=(1, 1), activation="relu", padding="same"
    )(conv2)
    conv4 = layers.Conv2D(
        32, (3, 3), strides=(1, 1), activation="relu", padding="same"
    )(conv3)
    int_con1 = layers.Concatenate(axis=-1)([conv4, conv3])
    conv5 = layers.Conv2D(
        32, (3, 3), strides=(1, 1), activation="relu", padding="same"
    )(int_con1)
    int_con2 = layers.Concatenate(axis=-1)([conv5, conv2])
    conv6 = layers.Conv2D(
        32, (3, 3), strides=(1, 1), activation="relu", padding="same"
    )(int_con2)
    int_con3 = layers.Concatenate(axis=-1)([conv6, conv1])
    x_r = layers.Conv2D(24, (3, 3), strides=(1, 1), activation="tanh", padding="same")(
        int_con3
    )
    return keras.Model(inputs=input_img, outputs=x_r)

class SpatialConsistencyLoss(keras.losses.Loss):
    def __init__(self, **kwargs):
        super().__init__(reduction="none")

        self.left_kernel = tf.constant(
            [[[[0, 0, 0]], [[-1, 1, 0]], [[0, 0, 0]]]], dtype=tf.float32
        )
        self.right_kernel = tf.constant(
            [[[[0, 0, 0]], [[0, 1, -1]], [[0, 0, 0]]]], dtype=tf.float32
        )
        self.up_kernel = tf.constant(
            [[[[0, -1, 0]], [[0, 1, 0]], [[0, 0, 0]]]], dtype=tf.float32
        )
        self.down_kernel = tf.constant(
            [[[[0, 0, 0]], [[0, 1, 0]], [[0, -1, 0]]]], dtype=tf.float32
        )

    def call(self, y_true, y_pred):
        original_mean = tf.reduce_mean(y_true, 3, keepdims=True)
        enhanced_mean = tf.reduce_mean(y_pred, 3, keepdims=True)
        original_pool = tf.nn.avg_pool2d(
            original_mean, ksize=4, strides=4, padding="VALID"
        )
        enhanced_pool = tf.nn.avg_pool2d(
            enhanced_mean, ksize=4, strides=4, padding="VALID"
        )

        d_original_left = tf.nn.conv2d(
            original_pool,
            self.left_kernel,
            strides=[1, 1, 1, 1],
            padding="SAME",
        )
        d_original_right = tf.nn.conv2d(
            original_pool,
            self.right_kernel,
            strides=[1, 1, 1, 1],
            padding="SAME",
        )
        d_original_up = tf.nn.conv2d(
            original_pool, self.up_kernel, strides=[1, 1, 1, 1], padding="SAME"
        )
        d_original_down = tf.nn.conv2d(
            original_pool,
            self.down_kernel,
            strides=[1, 1, 1, 1],
            padding="SAME",
        )

        d_enhanced_left = tf.nn.conv2d(
            enhanced_pool,
            self.left_kernel,
            strides=[1, 1, 1, 1],
            padding="SAME",
        )
        d_enhanced_right = tf.nn.conv2d(
            enhanced_pool,
            self.right_kernel,
            strides=[1, 1, 1, 1],
            padding="SAME",
        )
        d_enhanced_up = tf.nn.conv2d(
            enhanced_pool, self.up_kernel, strides=[1, 1, 1, 1], padding="SAME"
        )
        d_enhanced_down = tf.nn.conv2d(
            enhanced_pool,
            self.down_kernel,
            strides=[1, 1, 1, 1],
            padding="SAME",
        )

        d_left = tf.square(d_original_left - d_enhanced_left)
        d_right = tf.square(d_original_right - d_enhanced_right)
        d_up = tf.square(d_original_up - d_enhanced_up)
        d_down = tf.square(d_original_down - d_enhanced_down)
        return d_left + d_right + d_up + d_down

class ZeroDCE(keras.Model):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.dce_model = build_dce_net()

    def compile(self, learning_rate, **kwargs):
        super().compile(**kwargs)
        self.optimizer = keras.optimizers.Adam(learning_rate=learning_rate)
        self.spatial_constancy_loss = SpatialConsistencyLoss(reduction="none")
        self.total_loss_tracker = keras.metrics.Mean(name="total_loss")
        self.illumination_smoothness_loss_tracker = keras.metrics.Mean(
            name="illumination_smoothness_loss"
        )
        self.spatial_constancy_loss_tracker = keras.metrics.Mean(
            name="spatial_constancy_loss"
        )
        self.color_constancy_loss_tracker = keras.metrics.Mean(
            name="color_constancy_loss"
        )
        self.exposure_loss_tracker = keras.metrics.Mean(name="exposure_loss")

    @property
    def metrics(self):
        return [
            self.total_loss_tracker,
            self.illumination_smoothness_loss_tracker,
            self.spatial_constancy_loss_tracker,
            self.color_constancy_loss_tracker,
            self.exposure_loss_tracker,
        ]

    def get_enhanced_image(self, data, output):
        r1 = output[:, :, :, :3]
        r2 = output[:, :, :, 3:6]
        r3 = output[:, :, :, 6:9]
        r4 = output[:, :, :, 9:12]
        r5 = output[:, :, :, 12:15]
        r6 = output[:, :, :, 15:18]
        r7 = output[:, :, :, 18:21]
        r8 = output[:, :, :, 21:24]
        x = data + r1 * (tf.square(data) - data)
        x = x + r2 * (tf.square(x) - x)
        x = x + r3 * (tf.square(x) - x)
        enhanced_image = x + r4 * (tf.square(x) - x)
        x = enhanced_image + r5 * (tf.square(enhanced_image) - enhanced_image)
        x = x + r6 * (tf.square(x) - x)
        x = x + r7 * (tf.square(x) - x)
        enhanced_image = x + r8 * (tf.square(x) - x)
        return enhanced_image

    def call(self, data):
        dce_net_output = self.dce_model(data)
        return self.get_enhanced_image(data, dce_net_output)

    def compute_losses(self, data, output):
        enhanced_image = self.get_enhanced_image(data, output)
        loss_illumination = 200 * illumination_smoothness_loss(output)
        loss_spatial_constancy = tf.reduce_mean(
            self.spatial_constancy_loss(enhanced_image, data)
        )
        loss_color_constancy = 5 * tf.reduce_mean(color_constancy_loss(enhanced_image))
        loss_exposure = 10 * tf.reduce_mean(exposure_loss(enhanced_image))
        total_loss = (
            loss_illumination
            + loss_spatial_constancy
            + loss_color_constancy
            + loss_exposure
        )

        return {
            "total_loss": total_loss,
            "illumination_smoothness_loss": loss_illumination,
            "spatial_constancy_loss": loss_spatial_constancy,
            "color_constancy_loss": loss_color_constancy,
            "exposure_loss": loss_exposure,
        }

    def train_step(self, data):
        with tf.GradientTape() as tape:
            output = self.dce_model(data)
            losses = self.compute_losses(data, output)

        gradients = tape.gradient(
            losses["total_loss"], self.dce_model.trainable_weights
        )
        self.optimizer.apply_gradients(zip(gradients, self.dce_model.trainable_weights))

        self.total_loss_tracker.update_state(losses["total_loss"])
        self.illumination_smoothness_loss_tracker.update_state(
            losses["illumination_smoothness_loss"]
        )
        self.spatial_constancy_loss_tracker.update_state(
            losses["spatial_constancy_loss"]
        )
        self.color_constancy_loss_tracker.update_state(losses["color_constancy_loss"])
        self.exposure_loss_tracker.update_state(losses["exposure_loss"])

        return {metric.name: metric.result() for metric in self.metrics}

    def test_step(self, data):
        output = self.dce_model(data)
        losses = self.compute_losses(data, output)

        self.total_loss_tracker.update_state(losses["total_loss"])
        self.illumination_smoothness_loss_tracker.update_state(
            losses["illumination_smoothness_loss"]
        )
        self.spatial_constancy_loss_tracker.update_state(
            losses["spatial_constancy_loss"]
        )
        self.color_constancy_loss_tracker.update_state(losses["color_constancy_loss"])
        self.exposure_loss_tracker.update_state(losses["exposure_loss"])

        return {metric.name: metric.result() for metric in self.metrics}

    def save_weights(self, filepath, overwrite=True, save_format=None):
        """While saving the weights, we simply save the weights of the DCE-Net"""
        self.dce_model.save_weights(
            filepath,
            overwrite=overwrite,
            save_format=save_format
        )

    def load_weights(self, filepath, by_name=False, skip_mismatch=False):
        """While loading the weights, we simply load the weights of the DCE-Net"""
        self.dce_model.load_weights(
            filepath=filepath,
            by_name=by_name,
            skip_mismatch=skip_mismatch
        )

# Instantiate the ZeroDCE model and load weights
zero_dce_model = ZeroDCE()
zero_dce_model.compile(learning_rate=1e-4)

# Load the weights from the file
# zero_dce_model.load_weights("C:/Users/theni/Desktop/LowLightImageEnhancement/BackEnd/server/api/zero_dce_model_weights.h5")
zero_dce_model.load_weights(os.path.join(os.getcwd() ,"api/zero_dce_model_weights.h5"))




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

        # Validate the image format
        if image_file.content_type not in ['image/jpeg', 'image/png']:
            return JsonResponse({"error": "Unsupported file format. Please upload JPEG or PNG images."}, status=400)

        try:
            # Define the path where the image will be saved
            # save_path = "C:/Users/theni/Desktop/LowLightImageEnhancement/BackEnd/server/api/uploads"
            save_path = os.path.join(os.getcwd(), "api/uploads")

            img_path = os.path.join(save_path, image_file.name)
            
            # Save the uploaded image
            with open(img_path, 'wb+') as f:
                for chunk in image_file.chunks():
                    f.write(chunk)

            # Load and preprocess the image
            img = image.load_img(img_path, target_size=(400, 600))  # Resize as per your model's input requirement
            img_array = image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
            img_array = img_array / 255.0  # Normalize to [0, 1] range

            # Pass the image through the model
            enhanced_image = zero_dce_model(img_array, training=False)

            # Convert the enhanced image back to a displayable format
            enhanced_image = tf.squeeze(enhanced_image, axis=0)  # Remove the batch dimension
            enhanced_image = tf.clip_by_value(enhanced_image, 0.0, 1.0)  # Ensure values are in [0, 1]
            enhanced_image = (enhanced_image * 255).numpy().astype(np.uint8)  # Scale back to [0, 255]
            
            # Convert numpy array back to an image
            enhanced_image = image.array_to_img(enhanced_image)
            response = HttpResponse(content_type="image/jpeg")
            enhanced_image.save(response, "JPEG")
            return response

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)