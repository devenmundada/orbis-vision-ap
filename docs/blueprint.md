# **App Name**: ORBIS Vision

## Core Features:

- Image Input: Allow users to upload images from their local system or capture them using a webcam.
- AI-Powered Detection: Use YOLOv8 model to detect Toolbox, Oxygen Tank, and Fire Extinguisher in the uploaded image. Provide ability for LLM to leverage simulated test images as a tool to determine base detection parameters.
- Real-time Annotation: Display bounding boxes with class names and confidence scores overlaid on the image.
- Detection Statistics: Generate and show the report the count of each detected object.
- Data Export: Allow users to download the annotated image and optionally export detection metadata as JSON.
- Model Info Panel: Show model version, training dataset summary, accuracy metrics (mAP@0.5), and last training date in the sidebar.
- Data Source Toggle: Enable users to toggle between image input and simulated test images from datasets like Falcon.

## Style Guidelines:

- Primary color: HSL 214, 70%, 44% (approximately #2286D3 in RGB hex) for a techy and reliable feel.
- Background color: HSL 214, 20%, 95% (approximately #F0F4F7 in RGB hex) for a clean, light interface.
- Accent color: HSL 184, 50%, 50% (approximately #40BFB7 in RGB hex) for interactive elements and highlights.
- Font pairing: 'Space Grotesk' (sans-serif) for headings, paired with 'Inter' (sans-serif) for body text. Code samples: 'Source Code Pro'.
- The layout will follow the suggestion from the prompt. Use a sidebar for model information and input options, a main panel for image display and object detection results, and a bottom panel for detection summary and download options.
- Use clear and simple icons to represent Toolbox, Oxygen Tank, and Fire Extinguisher. Adopt icons that align with standard safety symbols for ease of recognition.
- Implement subtle animations to indicate the progress of object detection and data loading. A simple loading spinner during inference will improve the user experience.