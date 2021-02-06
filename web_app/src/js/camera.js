/*
 * This file contains camera handling functions that will be imported into the plugin.js file
 */

// Selectors
let viewfinder = document.getElementById("viewfinder");
let video = document.getElementById("video");
let width_slider = document.getElementById("width_slider");
let height_slider = document.getElementById("height_slider");
let canvas = document.getElementById("canvas");

// vars
let vis_dim = null;
let localStream = null;
let video_width = null;
let video_height = null;
let vf_width = null;
let vf_height = null;
let allow_camera_page = false;
let constraints = {
  video: {
    width: { ideal: 1080 },
    height: { ideal: 720 },
    facingMode: "environment",
  },
  audio: false,
};

/*
 * Start camera function
 */
function start() {
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

  // Check if camera exist and is enbaled
  if (
    !navigator.mediaDevices ||
    typeof navigator.mediaDevices.getUserMedia === "undefined"
  ) {
    alert("Error : please make sure camera is enbaled!");
    return false;
  } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function (stream) {
        allow_camera_page = true;
        // pass stream to our variable
        localStream = stream;
      })
      .catch(function (err) {
        // allow_camera_page = false;
        console.log("An error occurred: " + err);
      });

    // Wait until the video element is loaded
    video.addEventListener("canplay", function (e) {
      // get it's height and width
      video_height = video.offsetHeight;
      video_width = video.offsetWidth;
      // get min dimension
      vis_dim = Math.min(video_height, video_width);
      // Change div#viewfinder w/h
      setViewfinder(2, 2);
    });
  }
}

/*
 * Take camera shot respecting our viewfinder dimensions
 */
async function capture() {
  // get canvas context
  let context = canvas.getContext("2d");

  // Copy viewfinder's view on the canvas
  context.drawImage(
    // element to copy
    video,

    // Begin off the zone to copy: left
    viewfinder.offsetLeft - video.offsetLeft,

    // Begin off the zone to copy: top
    viewfinder.offsetTop - video.offsetTop,

    // Width of the zone to copy
    vf_width,

    // Height of the zone to copy
    vf_height,

    // Left point to begin the copy in the canvas
    0,

    // Top point to begin the copy in the canvas
    0,

    // Copy width
    vf_width,

    // Copy heiht
    vf_height
  );
  // convert image to base64
  let imageBase64 = canvas.toDataURL("image/png");
  return imageBase64;
}

/*
 * Since .stop() is permanent and we won't be able to resume our track, we switch betwen true/false in enabled to replace video with black screen
 * A function to be used when the active screen is the camera
 */
function playVideo() {
  localStream?.getTracks().forEach(function (track) {
    if (track.readyState == "live" && track.kind === "video") {
      track.enabled = true;
    }
  });

  video.srcObject = localStream;
  video.play();
}

/*
 * A functio nto be used when the active screen is not the camera
 */
function stopVideo() {
  video.pause();
  video.srcObject = null;

  localStream?.getTracks().forEach(function (track) {
    if (track.readyState == "live" && track.kind === "video") {
      track.enabled = false;
    }
  });
}

/*
 * A function to change our viewFinder style
 *
 * @param {number} w, new width.
 * @param {number} h, new height.
 * @param {bool} updatacanvas, set if the canvas should be updated too.
 */
function setViewfinder(w, h, updatacanvas = true) {
  // Set width and height
  viewfinder.style.width = vis_dim - vis_dim / w + "px";
  viewfinder.style.height = vis_dim - vis_dim / h + "px";
  // get offsets
  vf_width = viewfinder.offsetWidth;
  vf_height = viewfinder.offsetHeight;

  // Centre the viewfinder
  viewfinder.style.left =
    video.offsetLeft + (video_width - vf_width) / 2 + "px";
  viewfinder.style.top =
    video.offsetTop + (video_height - vf_height) / 2 + "px";

  // change canvas dimensions
  if (updatacanvas) {
    canvas.width = vf_width;
    canvas.height = vf_height;
  }
}

// setViewfinder on window resize
window.onresize = (_) => {
  setViewfinder(5, 5, false);
};

function updateViewfinder() {
  return setViewfinder(width_slider.value, height_slider.value);
}

export { start, playVideo, stopVideo, updateViewfinder, capture, allow_camera_page };
