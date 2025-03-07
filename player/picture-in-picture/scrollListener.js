function adjustPlayer() {
  const container = $('.player-container');

  /* extract constants for better readabilty */
  const lowerEdge = container.offset().top + container.height();
  const switchToMinPlayerPos = lowerEdge - (window.innerHeight / 3);
  const currentScrollPos = document.body.scrollTop || document.documentElement.scrollTop;
  const nativePipEnabled = player.getViewMode() === bitmovin.player.ViewMode.PictureInPicture;

  /* Disable CSS PiP, if native PiP is already in use */
  if (nativePipEnabled) {
    document.querySelector('.player-switch').classList.remove('fixed-player');
    return;
  }

  /* toggle the css-class responsible for the player moving to the lower right corner */
  if (currentScrollPos > switchToMinPlayerPos && !nativePipEnabled) {
    $('.player-switch').addClass('fixed-player');
  } else {
    $('.player-switch').removeClass('fixed-player');
  }
}

/* listen to scrolling events */
window.onscroll = adjustPlayer;
