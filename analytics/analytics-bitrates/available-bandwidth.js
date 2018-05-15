bitmovin.analytics.queries.builder
  .avg('AVG_BANDWIDTH')
  .filter('PLAYED', 'GT', 0)
  .filter('VIDEO_ID', 'EQ', 'vid-39102-123')
  .interval('4S').query();
