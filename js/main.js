// todo: convert to module pattern
// https://toddmotto.com/mastering-the-module-pattern/

// Avoid `console` errors in browsers that lack a console.
(function() {

  var player = document.querySelector('.player');
  var controls = document.getElementsByClassName('controls')[0];

  // Video
  var video = document.querySelector('video');

  // Buttons
  var playButton = document.getElementById('play-btn');
  var fullscreenButton = document.querySelector('.fullscreen');

  // Sliders
  var progress = document.querySelector('.controls .progress');
  var timeCode = document.querySelector('.controls .timecode');
  var timeCodeText = document.querySelector('.controls .timecode span');
  var ghostTimeCode = document.querySelector('.controls .ghost-timecode');
  var ghostTimeCodeText = document.querySelector('.controls .ghost-timecode span');
  var progressPlayed = document.querySelector('.controls .progress .played');
  var progressLoaded = document.querySelector('.controls .progress .loaded');

  var volume = document.querySelector('.volume');

  // Event listener for the play/pause button
  video.addEventListener('click', togglePlayPause);
  playButton.addEventListener('click', togglePlayPause);

  // Event listener for the volume bar
  volume.addEventListener('click', changeVolume);

  // Event listener for the full-screen button
  video.addEventListener('dblclick', toggleFullScreen);
  fullscreenButton.addEventListener('click', toggleFullScreen);

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


  // $(document).ready() equivalent for HTML5 video
  video.addEventListener('canplay', function() {
    // Set ARIA accessibility attributes
    progressPlayed.setAttribute('aria-valuemin', 0);
    progressPlayed.setAttribute('aria-valuemax', video.duration);

    progressLoaded.setAttribute('aria-valuemin', 0);
    progressLoaded.setAttribute('aria-valuemax', video.duration);

    // Get total video duration in hh:mm:ss format
    var totalFormattedTime = secondsToHms(video.duration);

    // Fade in tooltip with total duration
    timeCode.style.opacity = 1;
    timeCodeText.innerHTML = totalFormattedTime;

    // Fade in video controls
    controls.style.opacity = 1;
  });

  // Update progress bar as the video plays
  video.addEventListener('timeupdate', updateProgressPlayed);

  video.addEventListener('progress', updateProgressBuffered);

  player.addEventListener('mouseout', function() {
    if (video.played.length > 0) {
      controls.style.opacity = 0;
    }
  });
  player.addEventListener('mouseover', function() {
    if (video.played.length > 0) {
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

  function changeVolume(event) {
    var TOTAL_BAR_WIDTH = 4.8;
    var TOTAL_BARS = 5;

    // Get first volume bar
    var volumeBar = volume.firstElementChild;

    // Returns the size of an element and its position relative to the viewport
    var rect = volume.getBoundingClientRect();

    // Returns mouse cursor position in pixels relative to the volume control
    var relX = event.pageX - (rect.left + document.body.scrollLeft);

    // Keep track of how far it's "scanned" volume control, incrementing by 4.8 in each loop iteration
    // Each bar is 3px (plus 1.8px for spacing)
    // Total volume control width is 24px
    var position = 0;

    for (var i = 0; i < TOTAL_BARS; i++) {
      if (volumeBar) {
        // Keep volume bars before mouse cursor as-is (blue color)
        if (relX > position) {
          // Clean up previous classes
          volumeBar.classList.remove('fill0', 'fill1', 'fill2');

          // Handle partial volume bar fills
          // The outer if-condition makes sure it applies partial fill to the correct bar
          // It defaults to 0 since first bar will have `relX` less than the total bar width
          var order = relX > TOTAL_BAR_WIDTH ? Math.floor(relX / TOTAL_BAR_WIDTH) : 0;
          if (order === i) {
            // This condition is more lenient than the second because it is more visually pleasing
            // to have a small partial fill for a greater range of values between 0 and 1
            // Defaults to `TOTAL_BAR_WIDTH` since `position` is initially 0, which will result in NaN value
            var remainder = relX % (position || TOTAL_BAR_WIDTH);
            if (remainder > 0 && Math.floor(remainder) <= 1) {
              volumeBar.classList.add('fill1');
            } else if (Math.floor(remainder) === 2) {
              volumeBar.classList.add('fill2');
            }
          }
        } else {
          // Grey-out volume bars after mouse cursor
          volumeBar.classList.add('fill0');
        }

        // Go to next volume bar
        volumeBar = volumeBar.nextElementSibling;
      }

      // Increment by bar width (3px) + spacing (1.8px)
      position += TOTAL_BAR_WIDTH;
    }
    // Returns mouse cursor position in percentage relative to the progress bar element

    // Set ARIA accessibility attributes
    volume.setAttribute('aria-valuenow', parseFloat(relX / volume.offsetWidth).toFixed(2));
    volume.setAttribute('aria-valuetext', Math.round((relX / volume.offsetWidth) * 100) + '%');

    // Update the actual video volume
    video.volume = relX / volume.offsetWidth;
  }

  function toggleFullScreen() {
    // Enable fullscreen
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

      fullscreenButton.classList.add('enabled');
    } else {
      // Disable fullscreen
      if (video.exitFullscreen) {
        video.exitFullscreen();
      } else if (video.msExitFullscreen) {
        video.msExitFullscreen();
      } else if (video.mozCancelFullScreen) {
        video.mozCancelFullScreen();
      } else if (video.webkitExitFullscreen) {
        video.webkitExitFullscreen();
      }

      fullscreenButton.classList.remove('enabled');
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
    // Returns the size of an element and its position relative to the viewport
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

  function onProgressClick() {
    // Returns the size of an element and its position relative to the viewport
    var rect = progress.getBoundingClientRect();

    // Returns mouse cursor position in pixels relative to the progress bar element
    var relX = event.pageX - (rect.left + document.body.scrollLeft);

    // Returns mouse cursor position in percentage relative to the progress bar element
    var relXPercent = (relX / progress.offsetWidth) * 100;

    // Set video time relative to mouse cursor
    video.currentTime = (video.duration * relXPercent) / 100;
  }

  function updateProgressBuffered() {
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
