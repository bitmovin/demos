bitmovin.analytics.queries.builder
  .groupBy('VIDEO_BITRATE')
  .filter('PLAYED', 'GT', 0)
  .filter('VIDEO_ID', 'EQ', 'vid-39102-123')
  .count('IMPRESSION_ID').query();
