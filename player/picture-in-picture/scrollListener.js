function adjustPlayer() {
  const container = $('.player-container');

  /* extract constants for better readabilty */
  const lowerEdge = container.offset().top + container.height();
  const switchToMinPlayerPos = lowerEdge - (window.innerHeight / 3);
  const currentScrollPos = document.body.scrollTop || document.documentElement.scrollTop;

  /* toggle the css-class responsible for the player moving to the lower right corner */
  if (currentScrollPos > switchToMinPlayerPos) {
    $('.player-switch').addClass('fixed-player');
  } else {
    $('.player-switch').removeClass('fixed-player');
  }
}

/* listen to scrolling events */
window.onscroll = adjustPlayer;
