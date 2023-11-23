console.log("Attendance.js loaded!");

async function getLabeledFaceDescriptions() {
  try {
    const labels = ["Lee Jun Hong" || "YongJun" || "ShiJie"];
    return await Promise.all(
      labels.map(async (label) => {
        const descriptions = [];
        for (let i = 1; i <= 3; i++) {
          const img = await faceapi.fetchImage(`./labels/${label}/${i}.jpg`);
          const detections = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();
          descriptions.push(detections.descriptor);
        }
        return new faceapi.LabeledFaceDescriptors(label, descriptions);
      })
    );
  } catch (error) {
    console.error('Error getting labeled face descriptions:', error);
    return [];
  }
}

async function fetchStudentId(studentName) {
  try {
    const response = await fetch(`http://localhost:5500/fetchStudentId?studentName=${studentName}`);
    const data = await response.json();

    if (data.success) {
      return data.studentId;
    } else {
      console.error('Error fetching student ID:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching student ID:', error);
    return null;
  }
}

window.onload = function () {
  let recognitionSuccessful = false;

  fetchUserInfo();

  const detailsString = localStorage.getItem("generatedDetails");
  let details;

  if (detailsString) {
    details = JSON.parse(detailsString);
    document.getElementById('date').textContent = details.date;
    document.getElementById('timeslot').textContent = details.timeslot;
    document.getElementById('subject').textContent = details.subject;
    document.getElementById('instructorName').textContent = details.instructor;
  }

  function fetchUserInfo() {
    const userId = sessionStorage.getItem('userId');
    const userName = sessionStorage.getItem('userName');

    if (userId) {
      document.getElementById('userID').textContent = userId;
      document.getElementById('userName').textContent = userName;
    }
  }

  async function markAttendance(date, timeslot, subject, instructorName) {
    try {
      const userId = sessionStorage.getItem('userId');
      const userName = sessionStorage.getItem('userName');

      if (!userId || !userName) {
        console.error('User details not found');
        return;
      }

      const response = await fetch('http://localhost:5500/updateAttendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          StudentName: userName,
          studentId: userId,
          date: date,
          timeslot: timeslot,
          subject: subject,
          instructorName: instructorName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Attendance record updated successfully');
      } else {
        console.error('Error updating attendance:', data.message);
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  }

  function startFacialRecognition() {
    Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    ])
      .then(startWebcam)
      .catch((error) => {
        console.error('Error loading face recognition models:', error);
      });

    function startWebcam() {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: false,
        })
        .then((stream) => {
          video.srcObject = stream;
        })
        .catch((error) => {
          console.error('Error accessing camera:', error);
        });
    }

    video.addEventListener("play", async () => {
      try {
        const labeledFaceDescriptors = await getLabeledFaceDescriptions();
        const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

        const canvas = faceapi.createCanvasFromMedia(video);
        document.body.append(canvas);

        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
          try {
            const detections = await faceapi
              .detectAllFaces(video)
              .withFaceLandmarks()
              .withFaceDescriptors();

            const resizedDetections = faceapi.resizeResults(detections, displaySize);

            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

            const results = resizedDetections.map((d) => {
              return faceMatcher.findBestMatch(d.descriptor);
            });

            results.forEach(async (result, i) => {
              const box = resizedDetections[i].detection.box;
              const drawBox = new faceapi.draw.DrawBox(box, {
                label: result,
              });
              drawBox.draw(canvas);

              console.log('Recognized:', result.label);
              recognitionSuccessful = true;

              if (recognitionSuccessful) {
                markAttendance(details.date, details.timeslot, details.subject, details.instructor);
                recognitionSuccessful = false;
              }
            });
          } catch (error) {
            console.error('Error during facial recognition:', error);
          }
        }, 100);
      } catch (error) {
        console.error('Error setting up facial recognition:', error);
      }
    });
  }

  startFacialRecognition();

  // getLocation(function (success) {
  //   if (success) {
  //     startFacialRecognition();
  //   }
  // });
};