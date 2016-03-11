// Avoid `console` errors in browsers that lack a console.
(function() {

  var player = document.getElementsByClassName('player')[0];
  var controls = document.getElementsByClassName('controls')[0];

  // Video
  var video = document.querySelector('video');

  // Buttons
  var playButton = document.getElementById('play-btn');
  var muteButton = document.getElementById('mute');
  var fullScreenButton = document.getElementById('full-screen');

  // Sliders
  var seekBar = document.getElementById('seek-bar');
  var volumeBar = document.getElementById('volume-bar');

  // Event listener for the play/pause button
  video.addEventListener('click', togglePlayPause);
  playButton.addEventListener('click', togglePlayPause);

  // Event listener for the mute button
  muteButton.addEventListener('click', toggleMute);

  // Event listener for the volume bar
  volumeBar.addEventListener("change", changeVolume);

  // Event listener for the full-screen button
  video.addEventListener('dblclick', toggleFullScreen);
  fullScreenButton.addEventListener('click', toggleFullScreen);

  // Event listener for the seek bar
  seekBar.addEventListener('change', onSeekBarChange);

  // Pause the video when the slider handle is being dragged
  seekBar.addEventListener("mousedown", onSeekBarMouseDown);

  // Play the video when the slider handle is dropped
  seekBar.addEventListener("mouseup", onSeekBarMouseUp);


  video.addEventListener('playing', function() {
    console.log('playing has initialized');
  });

  // Update the seek bar as the video plays
  video.addEventListener('timeupdate', updateSeekBar);

  player.addEventListener('mouseout', function() {
    if (video.played.length === 1) {
      controls.style.opacity = 0;
    }
  });
  player.addEventListener('mouseover', function() {
    if (video.played.length === 1) {
      controls.style.opacity = 1;
    }
  });

  function togglePlayPause() {
    if (video.paused == true) {
      video.play();
      playButton.classList.remove('paused');
      playButton.classList.add('playing');
    } else {
      video.pause();
      playButton.classList.remove('playing');
      playButton.classList.add('paused');
    }
  }
  function toggleMute() {
    if (video.muted == false) {
      video.muted = true;
      muteButton.innerHTML = 'Unmute';
    } else {
      video.muted = false;
      muteButton.innerHTML = 'Mute';
    }
  }

  function changeVolume() {
    video.volume = volumeBar.value;
  }

  function toggleFullScreen() {
    if (!document.fullscreenElement && !document.mozFullScreenElement &&
      !document.webkitFullscreenElement && !document.msFullscreenElement ) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
      } else if (video.mozRequestFullScreen) {
        video.mozRequestFullScreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen(video.ALLOW_KEYBOARD_INPUT);
      }
    } else {
      if (video.exitFullscreen) {
        video.exitFullscreen();
      } else if (video.msExitFullscreen) {
        video.msExitFullscreen();
      } else if (video.mozCancelFullScreen) {
        video.mozCancelFullScreen();
      } else if (video.webkitExitFullscreen) {
        video.webkitExitFullscreen();
      }
    }
  }

  function updateSeekBar() {
    seekBar.value = video.currentTime * (100 / video.duration);
  }

  function onSeekBarChange() {
    video.currentTime = video.duration * (seekBar.value / 100);
  }

  function onSeekBarMouseDown() {
    video.pause();
  }

  function onSeekBarMouseUp() {
    video.play();
  }
}());
