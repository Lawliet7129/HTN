<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Webcam Capture</title>
  <style>
    #video, #canvas { display: block; margin: 10px auto; }
    #capture { display: block; margin: 10px auto; }
  </style>
</head>
<body>
  <video id="video" width="320" height="240" autoplay></video>
  <button id="capture">Take Picture</button>
  <canvas id="canvas" width="320" height="240"></canvas>

  <script>
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const captureBtn = document.getElementById('capture');
    const context = canvas.getContext('2d');

    // Request access to the webcam
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        video.srcObject = stream;
      })
      .catch(err => {
        alert('Error accessing webcam: ' + err);
      });

    // Capture image on button click
    captureBtn.addEventListener('click', () => {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
    });
  </script>
</body>
</html>