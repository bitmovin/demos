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
};

var activeSources = [];
var reusablePlayers = [];
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

const toggleCarouselItem = (item) => {
  item.classList.toggle('selected');

  const sourceId = parseInt(item.id);
  const source = sources[sourceId];
  const isSelected = item.classList.contains('selected');
  if (isSelected) {
    activeSources.push(source);
    if (primarySource == null) {
      primarySource = source;
    }
  } else {
    activeSources = activeSources.filter(active => {
      const shouldKeep = active.title !== source.title;
      if (!shouldKeep) {
        // Unload the player instance, so that it can be reused
        const player = reusablePlayers.find(player => player.getSource() === source);
        player && player.unload();
      }
      return shouldKeep;
    });

    if (primarySource === source) {
      primarySource = activeSources[0];
    }
  }

  updateGrid();
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

    const controlBar = getControlBar(player);
    if (source === primarySource) {
      tile.classList.add('primary');
      controlBar?.classList.add('active');
    } else {
      tile.classList.remove('primary');
      controlBar?.classList.remove('active');
    }

    grid.appendChild(tile);
  }

  // Set grid layout using CSS classes
  grid.classList.add(`tile-count-${activeSources.length}`);
}

function getPlayerId(player) {
  return reusablePlayers.indexOf(player);
}

function getControlBar(player) {
  const playerId = getPlayerId(player);
  return controlBarsContainer.querySelector('.bmpui-ui-controlbar[data-player-id="' + playerId + '"]');
}

function getPlayerInstance(playerConfig, source) {
  let player = reusablePlayers.find(player => player.getSource() === source);
  if (player) {
    // An active player instance already exists for this source
    return player;
  }

  player = reusablePlayers.find(player => player.getSource() == null);
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
  reusablePlayers.push(newPlayer);

  return newPlayer;
}

function setPrimaryPlayer(newPrimaryPlayer) {
  const newPrimarySource = newPrimaryPlayer.getSource();
  const container = document.getElementById('player-container');

  container.querySelector('.bmpui-ui-controlbar.active')?.classList.remove('active');
  container.querySelector('.tile.primary')?.classList.remove('primary');

  container.querySelector('.tile[title="' + newPrimarySource.title + '"]')?.classList.add('primary');
  getControlBar(newPrimaryPlayer)?.classList.add('active');

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
    setPrimaryPlayer(player);
  }
}

populateCarousel();

// Pre-select the first item to showcase the feature
toggleCarouselItem(document.getElementById('0'));