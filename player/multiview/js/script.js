const sources = [
  {
    hls: 'https://cdn.bitmovin.com/content/sports-mashup/sports-mashup-hls/m3u8/master.m3u8',
    poster: 'https://cdn.bitmovin.com/content/sports-mashup/poster.jpg',
    title: 'Bitmovin Sports Mashup',
  },
  {
    dash: 'https://cdn.bitmovin.com/content/assets/MI201109210084/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
    poster: 'https://cdn.bitmovin.com/content/assets/poster/hd/RedBull.jpg',
    title: 'Red Bull - Art of Motion',
  },
  {
    dash: 'https://cdn.bitmovin.com/content/assets/bbb/stream.mpd',
    poster: 'https://cdn.bitmovin.com/content/assets/poster/hd/BigBuckBunny.jpg',
    title: 'Big Buck Bunny',
  },
  {
    dash: 'https://cdn.bitmovin.com/content/assets/sintel/sintel.mpd',
    poster: 'https://cdn.bitmovin.com/content/assets/sintel/poster.png',
    title: 'Sintel',
  },
];
const playerConfig = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  buffer: {
    audio: { forwardduration: 12 },
    video: { forwardduration: 12 }
  },
  playback: {
    muted: true,
    autoplay: true
  },
  ui: {
    disableAutoHideWhenHovered: true,
  }
};

var activeSources = [];
var allPlayers = [];
var unusedPlayers = [];
var draggedElement = null;
var primarySource = null;

const controlBarsContainer = document.getElementById('controlbars-container');

function populateCarousel() {
  const carousel = document.getElementById('carousel');

  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];

    const img = document.createElement('img');
    img.src = source.poster;
    img.alt = source.title;

    const checkmark = document.createElement('span');
    checkmark.className = 'checkmark';
    checkmark.textContent = '✔';

    const item = document.createElement('div');
    item.className = 'item';
    item.id = `${i}`;
    item.addEventListener('click', () => toggleCarouselItem(item));

    item.appendChild(img);
    item.appendChild(checkmark);
    carousel.appendChild(item);
  }
}

function initializePlayers() {
  document.getElementById('0').classList.add('selected');
  document.getElementById('1').classList.add('selected');

  enableSource(sources[0]);
  enableSource(sources[1]);

  updateGrid();
}

const toggleCarouselItem = (item) => {
  item.classList.toggle('selected');

  const sourceId = parseInt(item.id);
  const source = sources[sourceId];
  const isSelected = item.classList.contains('selected');
  if (isSelected) {
    enableSource(source);
  } else {
    disableSource(source);
  }

  updateGrid();
}

function enableSource(source) {
  activeSources.push(source);
}

function disableSource(source) {
  activeSources.splice(activeSources.indexOf(source), 1);

  if (primarySource === source) {
    const newPrimaryPlayer = findPlayerForSource(activeSources[0]);
    setPrimaryPlayer(newPrimaryPlayer, activeSources[0]);
  }
  const player = findPlayerForSource(source);
  player?.unload().then(() => {
    unusedPlayers.push(player);
  });
}

function updateGrid() {
  const grid = document.getElementById('grid');

  // Clear existing tiles and classes
  grid.innerHTML = '';
  grid.className = 'grid';

  // Add tiles dynamically
  for (let i = 0; i < activeSources.length; i++) {
    const source = activeSources[i];
    const player = getPlayerInstance(playerConfig, source);

    const tile = player.getContainer();
    tile.title = source.title;

    if (primarySource === null) {
      setPrimaryPlayer(player, source);
    }

    grid.appendChild(tile);
  }

  // Set grid layout using CSS classes
  grid.classList.add(`tile-count-${activeSources.length}`);
}

function getPlayerId(player) {
  return allPlayers.indexOf(player);
}

function getControlBar(player) {
  const playerId = getPlayerId(player);
  return controlBarsContainer.querySelector('.bmpui-ui-controlbar[data-player-id="' + playerId + '"]');
}

function getPlayerInstance(playerConfig, source) {
  let player = findPlayerForSource(source);
  if (player) {
    // An active player instance already exists for this source
    return player;
  }

  player = unusedPlayers.shift();
  if (player) {
    // Re-use one of the unused player instances
    player.load(source);
    return player;
  }

  // Create a new player instance
  const container = createPlayerTile();
  const newPlayer = new bitmovin.player.Player(container, playerConfig);
  container.addEventListener('click', event => onTileClicked(container, newPlayer, event), true);

  newPlayer.load(source).then(() => {
    // Move the control bar to the controlbars-container to be full-width
    // This lets us simulate a common control bar for all players

    const controlBar = container.getElementsByClassName('bmpui-ui-controlbar')[0];
    controlBar.setAttribute('data-player-id', getPlayerId(newPlayer).toString());
    if (source === primarySource) {
      controlBar.classList.add('active');
    }

    controlBarsContainer.appendChild(controlBar);
  });
  allPlayers.push(newPlayer);

  return newPlayer;
}

function findPlayerForSource(source) {
  return allPlayers.find(player => player.getSource() === source);
}

function setPrimaryPlayer(newPrimaryPlayer, newPrimarySource) {
  if (newPrimarySource === primarySource || newPrimaryPlayer === null) {
    return;
  }

  const container = document.getElementById('player-container');

  // Remove active classes from the previous primary player
  container.querySelector('.bmpui-ui-controlbar.active')?.classList.remove('active');
  container.querySelector('.tile.primary')?.classList.remove('primary');

  if (newPrimaryPlayer == null) {
    primarySource = null;
    return;
  }

  // Add active classes to the new primary player
  newPrimaryPlayer.getContainer().classList.add('primary');
  getControlBar(newPrimaryPlayer)?.classList.add('active');

  const previousPrimaryPlayer = findPlayerForSource(primarySource);
  if (previousPrimaryPlayer) {
    // Keep the volume state consistent across players
    if (previousPrimaryPlayer.isMuted()) {
      newPrimaryPlayer.mute();
    } else {
      newPrimaryPlayer.unmute();
    }
    const volume = previousPrimaryPlayer.getVolume();
    newPrimaryPlayer.setVolume(volume);
    previousPrimaryPlayer.mute();
  }

  primarySource = newPrimarySource;
}

function createPlayerTile() {
  const tile = document.createElement('div');

  tile.classList.add('tile');
  tile.id = 'player';
  tile.draggable = true;

  tile.addEventListener("dragstart", event => {
    if (event.target.id === 'player') {
      draggedElement = event.target;
    }
  });
  tile.addEventListener("dragover", (event) => {
    event.preventDefault();
  });
  tile.addEventListener("drop", (event) => {
    event.preventDefault();

    const targetElement = event.target.closest('#player');
    if (draggedElement == null || targetElement == null || draggedElement == targetElement) {
      return;
    }

    // Swap sources
    const targetIndex = activeSources.findIndex(config => config.title === targetElement.title);
    const sourceIndex = activeSources.findIndex(config => config.title === draggedElement.title);

    const temp = activeSources[targetIndex];
    activeSources[targetIndex] = activeSources[sourceIndex];
    activeSources[sourceIndex] = temp;

    updateGrid();
  });

  return tile;
}

const onTileClicked = (tile, player, event) => {
  if (!tile.classList.contains('primary')) {
    // Prevent play/pause button from having an effect when the source is not the primary one (requires another click)
    event.stopPropagation();
    setPrimaryPlayer(player, player.getSource());
  }
}

populateCarousel();

initializePlayers();
