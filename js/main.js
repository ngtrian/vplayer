// todo: convert to module pattern
// https://toddmotto.com/mastering-the-module-pattern/

// Avoid `console` errors in browsers that lack a console.
(function() {

  var player = document.getElementsByClassName('player')[0];
  var controls = document.getElementsByClassName('controls')[0];

  // Video
  var video = document.querySelector('video');

  // Buttons
  var playButton = document.getElementById('play-btn');
  var fullScreenButton = document.getElementById('full-screen');

  // Sliders
  var progress = document.querySelector('.controls .progress');
  var timeCode = document.querySelector('.controls .timecode');
  var timeCodeText = document.querySelector('.controls .timecode span');
  var ghostTimeCode = document.querySelector('.controls .ghost-timecode');
  var ghostTimeCodeText = document.querySelector('.controls .ghost-timecode span');
  var progressPlayed = document.querySelector('.controls .progress .played');
  var progressLoaded = document.querySelector('.controls .progress .loaded');

  var seekBar = document.getElementById('seek-bar');
  var volumeBar = document.getElementById('volume-bar');

  // Event listener for the play/pause button
  video.addEventListener('click', togglePlayPause);
  playButton.addEventListener('click', togglePlayPause);

  // Event listener for the volume bar
  //volumeBar.addEventListener("change", changeVolume);

  // Event listener for the full-screen button
  video.addEventListener('dblclick', toggleFullScreen);
  //fullScreenButton.addEventListener('click', toggleFullScreen);

  progress.addEventListener('click', onProgressClick);

  progress.addEventListener('mousemove', onProgressMouseOver);

  progress.addEventListener('mouseout', onProgressMouseOut);

  //// Event listener for the seek bar
  //seekBar.addEventListener('change', onSeekBarChange);
  //
  //// Pause the video when the slider handle is being dragged
  //seekBar.addEventListener("mousedown", onSeekBarMouseDown);
  //
  //// Play the video when the slider handle is dropped
  //seekBar.addEventListener("mouseup", onSeekBarMouseUp);


  video.addEventListener('canplay', function() {
    // Set ARIA accessibility attributes
    progressPlayed.setAttribute('aria-valuemin', 0);
    progressPlayed.setAttribute('aria-valuemax', video.duration);

    progressLoaded.setAttribute('aria-valuemin', 0);
    progressLoaded.setAttribute('aria-valuemax', video.duration);

    // Get total video duration in hh:mm:ss format
    var totalFormattedTime = secondsToHms(video.duration);

    timeCode.style.opacity = 1;
    timeCodeText.innerHTML = totalFormattedTime;
  });

  // Update progress bar as the video plays
  video.addEventListener('timeupdate', updateProgressPlayed);

  video.addEventListener('progress', updateProgressBuffered);

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

  function changeVolume() {
    video.volume = volumeBar.value;
  }

  function toggleFullScreen() {
    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
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

  function updateProgressPlayed() {
    // Set ARIA accessibility attributes
    progressPlayed.setAttribute('aria-valuenow', video.currentTime);

    // Returns current time in percentage
    var playedPercent = (video.currentTime / video.duration) * 100;

    // Update played progress
    progressPlayed.style.width = playedPercent + '%';

    // Calculate current time using "hh:mm:ss" format
    var relFormattedTime = secondsToHms(video.currentTime);

    // Update timestamp relative to played progress
    timeCode.style.left = playedPercent + '%';
    timeCodeText.innerHTML = relFormattedTime;

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

  function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return (h > 0 ? h + ':' : '') + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function onProgressMouseOver(event) {
    // Returns the size of an element and its position relative to the viewport.
    var rect = progress.getBoundingClientRect();

    // Returns mouse cursor position in pixels relative to the progress bar element
    var relX = event.pageX - (rect.left + document.body.scrollLeft);

    // Returns mouse cursor position in percentage relative to the progress bar element
    var relXPercent = (relX / progress.offsetWidth) * 100;

    // Calculate video duration relative to mouse cursor using "hh:mm:ss" format
    var relFormattedTime = secondsToHms((video.duration * relXPercent) / 100);

    // Display tooltip with timestamp relative to mouse cursor
    ghostTimeCode.style.opacity = 1;
    ghostTimeCode.style.left = relXPercent + '%';
    ghostTimeCodeText.innerHTML = relFormattedTime;
  }

  function onProgressMouseOut() {
    // Hide tooltip with timestamp relative to mouse cursor
    ghostTimeCode.style.opacity = 0;
  }

  function updateProgressBuffered() {
    console.log(video.buffered);
    if (video.buffered.length > 0) {
      var bufferedEnd = video.buffered.end(video.buffered.length - 1);
      var duration = video.duration;
      var bufferedAmount = (bufferedEnd / duration) * 100;

      // Show buffered amount on the progress bar
      if (duration > 0) {
        progressLoaded.style.width = bufferedAmount + '%';

        // Set ARIA accessibility attributes
        progressLoaded.setAttribute('aria-valuenow', bufferedAmount);

      }
    }
  }

}());
