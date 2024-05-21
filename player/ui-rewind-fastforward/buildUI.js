function buildUI() {
  let mainSettingsPanelPage = new bitmovin.playerui.SettingsPanelPage({
    components: [
      new bitmovin.playerui.SettingsPanelItem(bitmovin.playerui.i18n.getLocalizer('settings.video.quality'), new bitmovin.playerui.VideoQualitySelectBox()),
      new bitmovin.playerui.SettingsPanelItem(bitmovin.playerui.i18n.getLocalizer('speed'), new bitmovin.playerui.PlaybackSpeedSelectBox()),
    ],
  });

  let settingsPanel = new bitmovin.playerui.SettingsPanel({
    components: [
      mainSettingsPanelPage,
    ],
    hidden: true,
  });

  let controlBar = new bitmovin.playerui.ControlBar({
    components: [
      settingsPanel,
      new bitmovin.playerui.Container({
        components: [
          new bitmovin.playerui.PlaybackTimeLabel({ timeLabelMode: bitmovin.playerui.PlaybackTimeLabelMode.CurrentTime, hideInLivePlayback: true }),
          new bitmovin.playerui.SeekBar({ label: new bitmovin.playerui.SeekBarLabel() }),
          new bitmovin.playerui.PlaybackTimeLabel({ timeLabelMode: bitmovin.playerui.PlaybackTimeLabelMode.TotalTime, cssClasses: ['text-right'] }),
        ],
        cssClasses: ['controlbar-top'],
      }),
      new bitmovin.playerui.Container({
        components: [
          new bitmovin.playerui.PlaybackToggleButton(),
          new bitmovin.playerui.QuickSeekButton({ seekSeconds: -10 }),
          new bitmovin.playerui.QuickSeekButton({ seekSeconds: 10 }),
          new bitmovin.playerui.VolumeToggleButton(),
          new bitmovin.playerui.VolumeSlider(),
          new bitmovin.playerui.Spacer(),
          new bitmovin.playerui.SettingsToggleButton({ settingsPanel: settingsPanel }),
          new bitmovin.playerui.FullscreenToggleButton(),
        ],
        cssClasses: ['controlbar-bottom'],
      }),
    ],
  });

  return new bitmovin.playerui.UIContainer({
    components: [
      new bitmovin.playerui.BufferingOverlay(),
      new bitmovin.playerui.PlaybackToggleOverlay(),
      controlBar,
      new bitmovin.playerui.TitleBar(),
      new bitmovin.playerui.ErrorMessageOverlay(),
    ],
    hideDelay: 2000,
    hidePlayerStateExceptions: [
      bitmovin.playerui.PlayerUtils.PlayerState.Prepared,
      bitmovin.playerui.PlayerUtils.PlayerState.Paused,
      bitmovin.playerui.PlayerUtils.PlayerState.Finished,
    ],
  });
}
