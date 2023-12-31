var img;
var canvas, ctx;
var startX, startY, endX, endY;
var isDrawing = false;

// Function to handle user mouse down event
function handleMouseDown(event) {
  // only start drawing once user has uploaded an image
  if (!img) return; 
      startX = event.offsetX;
      startY = event.offsetY;
      isDrawing = true;
}


// Function to handle user mouse move event
function handleMouseMove(event) {
  if (!isDrawing) return;
  endX = event.offsetX;
  endY = event.offsetY;
  drawRectangle();
}


// Function to handle user mouse up event
function handleMouseUp(event) {
  if (!isDrawing) return;
  endX = event.offsetX;
  endY = event.offsetY;
  isDrawing = false;
  drawRectangle();
  // Display Extract Text button
  document.getElementById('extract-button').style.display = 'block';
}


// Function to draw a rectangle on the image canvas
function drawRectangle() {
  // Clear the canvas to remove any previous rectangle drawings
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw onto the canvas the image that the user uploaded
  ctx.drawImage(img, 0, 0);
  // Draw the rectangle based on user's mouse movement
  ctx.beginPath();
  ctx.rect(startX, startY, endX - startX, endY - startY);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'red';
  ctx.stroke();
}


// Function to handle when user clicks Extract Text button
function handleExtractText() {
  // Check rectangle selection is okay
  if (startX >= endX || startY >= endY) {
    alert("Invalid selection - please draw a rectangle starting from top left moving to bottom right direction");
    return;
  }

  // Extract the selected region of interest
  let roiData = {
    startX: startX,
    startY: startY,
    endX: endX,
    endY: endY,
    imageData: getImageDataInROI(startX, startY, endX, endY)
  };

   // Make an AJAX request to the Flask route and send the ROI data 
  $.ajax({
    url: '/extract_text',
    type: 'POST',
    data: JSON.stringify(roiData),
    contentType: 'application/json',
    success: function(response) {
      // Retrieve server response
      var extractedText = response.extracted_text;
      // Display server response (extracted text or error) on page
      $("#extractedTextDisplay").text(extractedText);
    },
    error: function(xhr, status, error) {
      // Log the error
      console.error(error);
      // Display error message on page
      var errorMessage = "An error occurred while extracting text. Please try again.";
      $("#extractedTextDisplay").text(errorMessage);
    }
  });

  // Display Extract Text box
  document.getElementById('extract-box').style.display = 'block';
}


// Function to retrieve image data within user-selected ROI
function getImageDataInROI(startX, startY, endX, endY) {
  // Get the pixels within the specified region of interest
  const imageData = ctx.getImageData(startX, startY, endX - startX, endY - startY);
  
  // Convert the pixel data to a Uint8Array
  const pixelData = new Uint8Array(imageData.data.buffer);
  
  return Array.from(pixelData); // Convert Uint8Array to a regular array
}


// Function to handle image uploaded by user
function handleImageUpload(event) {
    // Create a new instance of FileReader
    let reader = new FileReader();
  
    // Define an event handler for when the FileReader has loaded the file
    reader.onload = function(event) {
      // Create image element
      img = new Image();
  
      // Define an event handler for when the Image has finished loading
      img.onload = function() {
        // Set the canvas dimensions to match the loaded image
        canvas.width = img.width;
        canvas.height = img.height;
        // Draw the image on the canvas at position (0, 0)
        ctx.drawImage(img, 0, 0);
      };

      // Define an event handler for when the Image encounters an error during loading
      img.onerror = function() {
      // Handle the error and inform the user
      console.error("Failed to load the image.");
      alert('Error uploading image.');
      };
  
      // Set the source of the Image element to the loaded file data
      img.src = event.target.result;
    };

    // Define an event handler for when FileReader encounters an error during reading
    reader.onerror = function() {
    // Handle the error and inform the user
    console.error("Failed to read the file.");
    alert('Error uploading image.');
    };
  
    // Check if a file was selected
    if (event.target.files && event.target.files[0]) {
      // Read the selected file as a Data URL
      reader.readAsDataURL(event.target.files[0]);
    }
  }
  

// Function to copy extracted text to clipboard
function copyTextToClipboard() {
  // get extracted text from textarea element
  const text = $("#extractedTextDisplay").val();
  // Copy text to clipboard
  navigator.clipboard.writeText(text)
    .then(() => {
      alert("Text copied to clipboard");
    })
    .catch((error) => {
      console.error("Failed to copy text to clipboard:", error);
    });
}  


// Function to export extracted text to txt file
function exportTextFile() {
  // Get the value of the 'extractedTextDisplay' textarea
  const textToExport = document.getElementById('extractedTextDisplay').value;
  // Create a Blob object with the text content and specify the MIME type as 'text/plain'
  const blob = new Blob([textToExport], { type: 'text/plain' });
  // Create an anchor element to simulate a click and trigger the file download
  const anchorElement = document.createElement('a');
  // Set the href attribute of the anchor element to the URL of the Blob object
  anchorElement.href = URL.createObjectURL(blob);
  // Set the download attribute of the anchor element to the desired file name
  anchorElement.download = 'exported_text.txt';
  // Simulate a click on the anchor element to initiate the file download
  anchorElement.click();
}


// Function that adds event listeners to the canvas element - gets called when body in index.html is loaded
function init() {
    // Create a 2d context object on the canvas
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    // Add event listeners for mouse on canvas
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    // Add event listener for image upload
    document.getElementById('image_upload').addEventListener('change', handleImageUpload);
    // Hide Extract Text button
    document.getElementById('extract-button').style.display = 'none';
    // Hide Extract Text box
    document.getElementById('extract-box').style.display = 'none';
}