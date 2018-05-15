const moment = require('moment');
const Bitmovin = require('bitmovin-javascript').default;
const bitmovin = new Bitmovin({'apiKey': '<YOUR API KEY>'});

// Query the Analytics Impressions that occured in the last 24 hours, grouped by hour:

const query = bitmovin.analytics.queries.builder.count('IMPRESSION_ID')
  .between(moment().subtract(1, 'day').toDate(), moment().toDate())
  .interval('HOUR')
  .query() // this returns a JavaScript Promise

query.then((results) => {
  // results.rows contains the result set
  // result.columnLabels contains a description of what the array rows represent
  console.log(results.rows);
});
