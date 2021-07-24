
// Our input frames will come from here.

const videoElement =
    document.getElementsByClassName('input_video')[0];
const canvasElement =
    document.getElementsByClassName('output_canvas')[0];
const controlsElement =
    document.getElementsByClassName('control-panel')[0];
const canvasCtx = canvasElement.getContext('2d');

// We'll add this to our control panel later, but we'll save it here so we can
// call tick() each time the graph runs.
const fpsControl = new FPS();

// Optimization: Turn off animated spinner after its hiding animation is done.
const spinner = document.querySelector('.loading');
spinner.ontransitionend = () => {
  spinner.style.display = 'none';
};

function angle2partial(angle) {
  if(angle < 10) {
    return 6 ;
  }
  else if(angle < 20) {
    return 5
  }
  else if(angle < 30) {
    return 4
  }
  else if(angle < 40) {
    return 3
  }
  else if(angle < 50) {
    return 2
  }
  return 1;
}

function angle2valve(angle, valve) {
  if(angle > 90) {
    window.trumpetAudio.valveDown(valve);
  }
  else {
    window.trumpetAudio.valveUp(valve);
  }
}

function onResults(results) {
  // Hide the spinner.
  document.body.classList.add('loaded');

  // Update the frame rate.
  fpsControl.tick();

  // Draw the overlays.
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);
  if (results.multiHandLandmarks && results.multiHandedness) {
    for (let index = 0; index < results.multiHandLandmarks.length; index++) {
      const classification = results.multiHandedness[index];
      const isRightHand = classification.label === 'Right';
      const landmarks = results.multiHandLandmarks[index];
      let rightHand = null;
      let leftHand = null;
      if(isRightHand) {
        rightHand = fingerMeasurements(landmarks);
      }
      else {
        leftHand = fingerMeasurements(landmarks);
      }
      drawConnectors(
          canvasCtx, landmarks, HAND_CONNECTIONS,
          {color: isRightHand ? '#00FF00' : '#FF0000'}),
      drawLandmarks(canvasCtx, landmarks, {
        color: isRightHand ? '#00FF00' : '#FF0000',
        fillColor: isRightHand ? '#FF0000' : '#00FF00',
        radius: (x) => {
          return lerp(x.from.z, -0.15, .1, 10, 1);
        }

      });
      if(rightHand != null) {
        setDisplayValue('rh_index', rightHand.indexFlex);
        setDisplayValue('rh_middle', rightHand.middleFlex);
        setDisplayValue('rh_ring', rightHand.ringFlex);
        angle2valve(rightHand.indexFlex, 1);
        angle2valve(rightHand.middleFlex, 2);
        angle2valve(rightHand.ringFlex, 3);
      }
      if(leftHand != null) {
        setDisplayValue('lh_index2thumb', leftHand.thumbIndexDist);
        setDisplayValue('lh_middle', leftHand.middleFlex);
        window.trumpetAudio.blowing = leftHand.thumbIndexDist < 0.1;
        window.trumpetAudio.partial = angle2partial(leftHand.middleFlex);
      }
    }
  }
  canvasCtx.restore();
}

const hands = new Hands({locateFile: (file) => {
  return `static/mediapipe/hands/${file}`;
}});
hands.onResults(onResults);

/**
 * Instantiate a camera. We'll feed each frame we receive into the solution.
 */
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({image: videoElement});
  },
  width: 1280,
  height: 720
});
camera.start();

// Present a control panel through which the user can manipulate the solution
// options.
new ControlPanel(controlsElement, {
      selfieMode: true,
      maxNumHands: 2,
      minDetectionConfidence: 0.9,
      minTrackingConfidence: 0.9,
      angle: 90
    })
    .add([
      new StaticText({title: 'MediaPipe Hands'}),
      fpsControl,
      new Toggle({title: 'Selfie Mode', field: 'selfieMode'}),
      new Slider(
          {title: 'Max Number of Hands', field: 'maxNumHands', range: [1, 4], step: 1}),
      new Slider({
        title: 'Min Detection Confidence',
        field: 'minDetectionConfidence',
        range: [0, 1],
        step: 0.01
      }),
      new Slider({
        title: 'Min Tracking Confidence',
        field: 'minTrackingConfidence',
        range: [0, 1],
        step: 0.01
      }),
      new Slider({
        title: 'rh_index',
        field: 'rh_index',
        range: [0, 180],
        step: 1
      }),
      new Slider({
        title: 'rh_middle',
        field: 'rh_middle',
        range: [0, 180],
        step: 1
      }),
      new Slider({
        title: 'rh_ring',
        field: 'rh_ring',
        range: [0, 180],
        step: 1
      }),
      new Slider({
        title: 'lh_index2thumb',
        field: 'lh_index2thumb',
        range: [0, 0.5],
        step: .01
      }),
      new Slider({
        title: 'lh_middle',
        field: 'lh_middle',
        range: [0, 180],
        step: 1
      }),
    ])
    .on(options => {
      videoElement.classList.toggle('selfie', options.selfieMode);
      hands.setOptions(options);
    });

function setDisplayValue(label, value) {
  let list = document.querySelectorAll(".control-panel-entry > .label")
  let cpi = Array.from(list).find(x => x.innerHTML === label).parentElement
  cpi.querySelector('.callout').innerText = parseFloat(value).toFixed( 2 );
  cpi.querySelector('.value').value = value;
}


