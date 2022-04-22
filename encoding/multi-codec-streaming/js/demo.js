var player = null;

var CODEC = {
  H264: 'H264',
  H265: 'H265',
  VP9: 'VP9'
};

var compareBitrates = {
  '320_180': 350000,
  '480_270': 650000,
  '640_360': 1000000,
  '854_480': 1500000,
  '1280_720': 3000000,
  '1920_1080_5000000': 5000000,
  '1920_1080_8000000': 8000000
};

var mappingCodecBitrates = {};
mappingCodecBitrates[CODEC.H265] = {
  2500000: 5000000,
  4000000: 8000000
};

mappingCodecBitrates[CODEC.VP9] = {
  3500000: 5000000,
  5600000: 8000000
};

mappingCodecBitrates[CODEC.H264] = {
  5000000: 5000000,
  8000000: 8000000
};

var selectedCodec = CODEC.H264;
var COMPARE_CODEC = CODEC.H264;

var codecsBitratesSegmentSizes = {};
codecsBitratesSegmentSizes[CODEC.H264] = {
  350000: [685, 201608, 153039, 96589, 168128, 129749, 218458, 171236, 152517, 148939, 136647, 176398, 162364,
    180951, 148369, 151525, 165903, 140564, 110780, 118662, 156296, 179581, 128321, 138865, 175373, 142948, 152169,
    163324, 191471, 178332, 164577, 152358, 155635, 127246, 176723, 202441, 170261, 196069, 156367, 150710, 170825,
    178871, 160620, 168523, 153776, 171892, 166211, 162651, 143877, 198702, 104515, 179850, 157542, 32767],
  650000: [685, 394874, 277796, 195756, 337381, 242307, 430719, 323565, 283151, 295043, 262453, 338611, 304418,
    345256, 276298, 286003, 308694, 272646, 223498, 241935, 297729, 354948, 257745, 263646, 345760, 265907, 290868,
    304671, 361466, 344562, 302615, 289032, 295651, 237315, 335742, 392438, 324643, 373648, 291361, 283144, 325551,
    339011, 299153, 324972, 288583, 330863, 317717, 308813, 263933, 369941, 202711, 328663, 299450, 63421],
  1000000: [684, 626047, 428836, 327766, 541300, 398388, 696615, 505391, 442559, 471135, 413891, 541471, 472838,
    536610, 425145, 449029, 465839, 432214, 366228, 392807, 475372, 570527, 410627, 406827, 544938, 412210, 455828,
    476492, 564320, 546040, 479539, 458076, 465582, 370224, 522494, 621562, 515786, 584835, 447509, 440146, 508866,
    530674, 470231, 512554, 448884, 508206, 494897, 481978, 406512, 575652, 320016, 505282, 467033, 106828],
  1500000: [684, 951536, 652770, 533443, 812933, 597498, 1048305, 776150, 676469, 738455, 637941, 815191, 713776,
    822655, 645245, 693323, 698648, 680533, 587741, 615835, 724057, 875328, 643893, 624574, 845319, 629357, 698226,
    727522, 855270, 834700, 736568, 704293, 720894, 566303, 798836, 942700, 786461, 878340, 667196, 675836, 792214,
    809864, 715471, 796310, 686209, 776987, 753818, 735210, 617289, 869081, 498878, 760476, 716373, 178732],
  3000000: [685, 1653539, 1373917, 1194461, 1635590, 1247551, 2064168, 1561963, 1419628, 1547072, 1327086, 1563910,
    1515393, 1666332, 1333829, 1427871, 1412504, 1472746, 1297953, 1315628, 1491223, 1860828, 1400761, 1303187,
    1754722, 1308278, 1485701, 1489816, 1712376, 1721953, 1530624, 1449354, 1509692, 1204998, 1612102, 1830082,
    1582255, 1743489, 1413419, 1374414, 1576103, 1593363, 1454253, 1641826, 1394627, 1593439, 1542190, 1523587,
    1270934, 1688145, 1065171, 1532418, 1473899, 424258],
  5000000: [686, 2401470, 2502646, 2303901, 2632287, 2254375, 3379343, 2574562, 2489147, 2620347, 2341775, 2626471,
    2539426, 2758934, 2328248, 2474828, 2396290, 2614300, 2317618, 2375952, 2433161, 3344931, 2444204, 2301737,
    3010766, 2240535, 2632446, 2539150, 2804417, 2892980, 2681935, 2494571, 2598344, 2187796, 2743285, 3046143,
    2645105, 2923349, 2431444, 2475489, 2676831, 2676571, 2528940, 2834125, 2370770, 2798395, 2664922, 2603499,
    2318633, 2800597, 1877015, 2632045, 2606646, 872529],
  8000000: [686, 4280560, 4081131, 3716628, 4231889, 3597963, 5201595, 3914156, 4039138, 4093946, 3868820, 4341942,
    4067848, 4571671, 3854514, 4009218, 3754091, 4249077, 3797207, 3833006, 3827858, 5699442, 3877780, 3729113,
    4814556, 3731407, 4403464, 3952262, 4323577, 4690187, 4382517, 4049968, 4244221, 3619401, 4401876, 4821466,
    4164370, 4654223, 3941799, 4031354, 4378817, 4267801, 4041997, 4613190, 3725017, 4516282, 4336397, 4343495,
    3759102, 4449216, 3013121, 4155003, 4163343, 1337479]
};

codecsBitratesSegmentSizes[CODEC.H265] = {
  175000: [923, 120999, 82739, 55436, 94003, 74695, 130015, 84307, 76372, 83734, 72707, 95525, 81331, 98145, 82109,
    81146, 97537, 73294, 58514, 64530, 85568, 100674, 55561, 69166, 93621, 78264, 76431, 92778, 99265, 101484, 91525,
    80069, 84022, 63102, 98157, 115841, 100480, 115870, 83280, 76167, 96731, 99723, 89330, 96086, 82830, 96825, 81798,
    87666, 84752, 121169, 58972, 101391, 84234, 19660],
  325000: [922, 220938, 144308, 108217, 172098, 131585, 243778, 159370, 141624, 158900, 139794, 194013, 147223,
    193841, 150275, 154675, 178909, 137363, 113512, 123655, 160395, 197809, 97716, 138134, 175674, 148852, 140362,
    169933, 183784, 202449, 176823, 148267, 160603, 124006, 181570, 221324, 181229, 222468, 151779, 140591, 182113,
    183144, 167462, 186085, 146675, 190142, 157970, 160701, 157772, 220246, 109798, 179430, 154717, 37196],
  500000: [923, 342023, 222530, 172576, 263535, 202241, 382130, 241031, 220704, 251471, 213438, 310754, 224539,
    309480, 224913, 238752, 267196, 223709, 183078, 191122, 244502, 322134, 161215, 207719, 284326, 229821, 222947,
    259681, 280397, 320688, 274135, 228705, 253103, 190981, 271764, 347536, 276802, 351917, 229557, 217613, 285971,
    281444, 265234, 289975, 224143, 293736, 247604, 243037, 235178, 331764, 169930, 276831, 242809, 59299],
  750000: [924, 504571, 327097, 268645, 408791, 292803, 575816, 363046, 337641, 379709, 327225, 470435, 344106,
    479711, 344560, 361809, 383233, 354486, 286506, 300871, 364806, 500029, 259282, 304584, 455411, 349196, 334148,
    391949, 421270, 493143, 418858, 340166, 384639, 296176, 415520, 530601, 407155, 527482, 339065, 336498, 432772,
    426181, 401225, 447341, 328705, 451593, 377860, 372306, 347635, 491737, 259525, 412945, 368007, 92558],
  1500000: [922, 1011661, 661921, 584069, 825981, 599902, 1142056, 739709, 697444, 767229, 668207, 958929, 703034,
    933936, 718678, 759082, 736733, 749647, 631004, 635876, 745202, 1054969, 584772, 648270, 969427, 705379, 710258,
    802621, 848557, 1013116, 840492, 703426, 789752, 613217, 851604, 1069597, 795757, 914766, 672891, 693172, 888365,
    852814, 803865, 884126, 659862, 903263, 815064, 768099, 679662, 958561, 548551, 831321, 750114, 202592],
  2500000: [924, 1490887, 1090434, 964718, 1206299, 887897, 1699935, 1156814, 1137118, 1258691, 1072302, 1519188,
    1176819, 1444199, 1117309, 1225309, 1146863, 1252101, 1037896, 1054864, 1145141, 1616226, 1098736, 1048428,
    1590871, 1091345, 1159697, 1250577, 1310460, 1553924, 1349289, 1138838, 1253492, 1012677, 1341676, 1656341,
    1198908, 1433858, 1060093, 1096449, 1396589, 1333955, 1260934, 1403641, 1046983, 1454890, 1289836, 1209794,
    1076501, 1426811, 868286, 1287113, 1200617, 302901],
  4000000: [924, 2416910, 1843355, 1653157, 1972950, 1459895, 2669188, 1876179, 1893372, 2008969, 1782778, 2444862,
    1923382, 2372078, 1863698, 2009697, 1855300, 2109031, 1748604, 1757897, 1875333, 2701962, 1864879, 1778423,
    2541138, 1811714, 2022399, 2061003, 2085611, 2533624, 2198427, 1882321, 2073242, 1703203, 2181536, 2606006,
    1889296, 2282347, 1753044, 1816137, 2243628, 2119626, 2042939, 2274120, 1665178, 2353205, 2119856, 2000850,
    1729558, 2262912, 1416893, 2076356, 1943046, 494305]
};

codecsBitratesSegmentSizes[CODEC.VP9] = {
  245000: [440, 119643, 130025, 122887, 201022, 115800, 166479, 106270, 111746, 134501, 102169, 108651, 92062,
    113577, 125345, 104775, 110664, 111174, 136471, 128859, 104905, 137415, 100572, 108295, 117855, 140520, 112591,
    113638, 120403, 126204, 131914, 141556, 119456, 135279, 136535, 126158, 132525, 129251, 132363, 123556, 118823,
    122241, 130965, 142178, 138080, 120365, 137248, 126489, 109465, 108975, 95681, 107984, 108593, 29098],
  455000: [442, 222938, 213027, 234959, 325626, 208589, 299273, 189124, 205109, 237827, 178639, 201897, 171157,
    204489, 228001, 191283, 195713, 206366, 254196, 237295, 195796, 261862, 184253, 193250, 221210, 245879, 202898,
    199192, 209069, 222311, 230525, 243875, 215915, 228782, 236213, 220133, 229133, 227700, 231485, 216287, 203727,
    214096, 223911, 250452, 246043, 215685, 243477, 225016, 202006, 193607, 163228, 189837, 193165, 45386],
  700000: [442, 327677, 315694, 357330, 517870, 314571, 452513, 291233, 314894, 354951, 265920, 308857, 272808,
    308357, 331312, 291536, 295900, 344910, 386984, 367803, 304908, 391555, 288133, 291362, 338692, 368113, 310521,
    300676, 312026, 339605, 347476, 362564, 325609, 335003, 349502, 328631, 343175, 338529, 345817, 324375, 300179,
    320009, 337199, 369074, 360507, 317389, 364967, 338702, 299862, 299341, 244961, 284072, 287140, 63947],
  1050000: [442, 476458, 473453, 652782, 736397, 463140, 668288, 434248, 476794, 524526, 388351, 470294, 413792,
    461564, 485990, 439825, 440408, 542314, 643592, 547713, 452311, 606759, 433917, 434717, 525194, 535782, 449487,
    443572, 452216, 517640, 513844, 532307, 483556, 486591, 513535, 476283, 503105, 492273, 500846, 460151, 433635,
    461844, 489987, 531574, 515541, 469910, 537171, 498330, 446222, 444879, 355181, 414628, 418861, 90163],
  2100000: [442, 903622, 917842, 1304078, 1288689, 879329, 1203243, 876315, 930455, 981160, 744480, 950641, 828995,
    883380, 911141, 851820, 856651, 1018995, 1256495, 1062134, 855697, 1129240, 858931, 863175, 1047752, 1019431,
    879568, 838419, 874705, 999856, 979344, 983664, 939060, 923877, 976476, 893350, 940804, 927017, 921113, 849230,
    843813, 868352, 904029, 1007405, 938815, 894182, 982138, 949356, 844910, 866916, 660069, 788141, 809083, 164661],
  3500000: [442, 1512901, 1518018, 2232452, 2130331, 1423411, 1834527, 1440524, 1493164, 1589811, 1259860, 1546983,
    1397489, 1428195, 1479790, 1418872, 1411412, 1695840, 2044546, 1746900, 1403320, 1812447, 1371872, 1437356,
    1697970, 1692173, 1453350, 1522154, 1446145, 1660231, 1588767, 1622637, 1525219, 1520442, 1619223, 1481907,
    1528597, 1499127, 1477361, 1366667, 1373722, 1365987, 1462877, 1626673, 1493801, 1463247, 1586528, 1540985,
    1399810, 1387095, 1066380, 1303958, 1342897, 274383],
  5600000: [442, 2298665, 2238418, 3388525, 2712584, 2125306, 2893068, 2144689, 2270523, 2379809, 1968185, 2279806,
    2023154, 2132467, 2164165, 2073247, 2116630, 2764279, 2851513, 2588868, 2052341, 2716382, 2060971, 2149269,
    2480760, 2513511, 2173112, 2240926, 2171836, 2464379, 2330199, 2317756, 2312982, 2234308, 2339547, 2248213,
    2305505, 2279541, 2144888, 2018794, 2072517, 2116303, 2148806, 2435264, 2193982, 2224301, 2277408, 2250821,
    2102236, 2141614, 1558510, 2017002, 2010365, 409727]
};

var SEGMENT_SIZE_SECONDS = 4;

var compareCodecSegmentsBytes = 0;
var selectedCodecSegmentBytes = 0;

var currentSegmentDownloaded = 0;
var currentSegmentDisplayed = 0;
var segmentData = [];

var MAX_SEGMENT_VIEW_COUNT = 10;

var chart = null;

var currentTime = 0;

var updateRequestData = function (selectedRequestData, compareRequestedData, savingsPercentage, costReduction) {

  if (!Number.isNaN(selectedRequestData)) {
    document.getElementById('selected-codec-request-data').innerHTML = selectedRequestData;
  }

  if (!Number.isNaN(compareRequestedData)) {
    document.getElementById('compare-codec-request-data').innerHTML = compareRequestedData;
  }

  if (!Number.isNaN(savingsPercentage)) {
    document.getElementById('savings-percentage').innerHTML = savingsPercentage;
  }

  if (!Number.isNaN(costReduction)) {
    document.getElementById('cost-reduction').innerHTML = costReduction;
  }
};

var bytesToMegabytes = function (bytes) {
  return bytes / 1024 / 1024;
};

var bytesToGigabytes = function (bytes) {
  return bytesToMegabytes(bytes) / 1024;
};

var roundToTwo = function (number) {
  return Math.round(number * 100) / 100;
};

var updateBandwidthData = function () {
  var playbackData = player.getPlaybackVideoData();
  var playbackBitrate = playbackData.bitrate;

  if (!playbackBitrate) {
    return;
  }

  var bitrateIndex = playbackData.width + '_' + playbackData.height;

  var bitrateMapping = mappingCodecBitrates[selectedCodec][playbackBitrate];
  if (bitrateMapping) {
    bitrateIndex += '_' + mappingCodecBitrates[selectedCodec][playbackBitrate];
  }

  var compareBitrate = compareBitrates[bitrateIndex];

  var compareCodecBitratesSegmentSizes = codecsBitratesSegmentSizes[COMPARE_CODEC];
  var compareCodecSegmentSizes = compareCodecBitratesSegmentSizes[compareBitrate];
  var compareCodecSegmentSize = compareCodecSegmentSizes[currentSegmentDownloaded];

  var selectedCodecBitratesSegmentSizes = codecsBitratesSegmentSizes[selectedCodec];
  var playbackCodecSegmentSizes = selectedCodecBitratesSegmentSizes[playbackBitrate];
  var playbackCodecSegmentSize = playbackCodecSegmentSizes[currentSegmentDownloaded];

  compareCodecSegmentsBytes += compareCodecSegmentSize;
  selectedCodecSegmentBytes += playbackCodecSegmentSize;

  segmentData.push({
    compareCodecSegmentSize: compareCodecSegmentSize,
    playbackCodecSegmentSize: playbackCodecSegmentSize,
    compareCodecSegmentsBytes: compareCodecSegmentsBytes,
    selectedCodecSegmentBytes: selectedCodecSegmentBytes
  });

  currentSegmentDownloaded++;
};

var shiftSegments = function () {
  var labels = chart.data.labels;
  var datasets = chart.data.datasets;

  var isDatasetFilled = Math.max(datasets[0].data.length, datasets[1].data.length) === MAX_SEGMENT_VIEW_COUNT;

  var start = timeToDigit(labels[0]);
  var end = timeToDigit(labels[labels.length - 1]);

  var currentRangeMidPoint = start + ((end - start) / 2);
  var currentTimeWithinRange = currentTime >= start;
  var allowedToShift = !isDatasetFilled || (currentTimeWithinRange && currentTime >= currentRangeMidPoint);

  if (!allowedToShift || segmentData.length === 0 || !chart.data.datasets[0] || player.hasEnded()) {
    return;
  }

  var segment = segmentData.shift();

  var compareCodecSegmentSize = segment.compareCodecSegmentSize;
  var playbackCodecSegmentSize = segment.playbackCodecSegmentSize;
  var compareCodecSegmentsBytes = segment.compareCodecSegmentsBytes;
  var selectedCodecSegmentBytes = segment.selectedCodecSegmentBytes;

  var compareCodecBitrate = roundToTwo((compareCodecSegmentSize / SEGMENT_SIZE_SECONDS / 1e3) * 8);
  var playbackCodecBitrate = roundToTwo((playbackCodecSegmentSize / SEGMENT_SIZE_SECONDS / 1e3) * 8);

  if (Number.isNaN(compareCodecBitrate)) {
    compareCodecBitrate = 0;
  }

  if (Number.isNaN(playbackCodecBitrate)) {
    playbackCodecBitrate = 0;
  }

  datasets[0].data.push(Math.round(compareCodecBitrate));
  datasets[1].data.push(Math.round(playbackCodecBitrate));

  while (datasets[0].data.length > MAX_SEGMENT_VIEW_COUNT) {
    labels.shift();
    datasets[0].data.shift();
    datasets[1].data.shift();
    labels.push(digitToTime(timeToDigit(labels[labels.length - 1]) + SEGMENT_SIZE_SECONDS))
  }

  chart.update();

  var selectedRequestData = roundToTwo(bytesToMegabytes(selectedCodecSegmentBytes));
  var compareRequestedData = roundToTwo(bytesToMegabytes(compareCodecSegmentsBytes));
  var savingsPercentage = roundToTwo((1 - selectedCodecSegmentBytes / compareCodecSegmentsBytes) * 100);

  var costReduction = roundToTwo(bytesToGigabytes(compareCodecSegmentsBytes - selectedCodecSegmentBytes) * 1e6 * 0.025);

  updateRequestData(selectedRequestData, compareRequestedData, savingsPercentage, costReduction);

  currentSegmentDisplayed++;
};

var getCodecImage = function (selectedCodec) {
  switch (selectedCodec) {
    case CODEC.VP9:
      return '<span class="codec-image">VP9</span>';
    case CODEC.H265:
      return '<span class="codec-image">H265</span>';
    case CODEC.H264:
    default:
      return '<span class="codec-image">H264</span>';
  }
};

function getBrowserImage(selectedBrowser) {
  switch (selectedBrowser) {
    case BROWSER.CHROME:
      return '<i class="fa-brands fa-chrome" aria-hidden="true"></i>';
    case BROWSER.EDGE:
      return '<i class="fa-brands fa-edge" aria-hidden="true"></i>';
    case BROWSER.FIREFOX:
      return '<i class="fa-brands fa-firefox" aria-hidden="true"></i>';
    case BROWSER.IE:
      return '<i class="fa-brands fa-internet-explorer" aria-hidden="true"></i>';
    case BROWSER.OPERA:
      return '<i class="fa-brands fa-opera" aria-hidden="true"></i>';
    case BROWSER.SAFARI:
      return '<i class="fa-brands fa-safari" aria-hidden="true"></i>';
    case BROWSER.UNKNOWN:
    default:
      return '<i class="fa-solid fa-circle-question" aria-hidden="true"></i>';
  }
};

function isTypeSupported(mimeType)
{
  if ('MediaSource' in window && MediaSource.isTypeSupported(mimeType)) {
    return true;
  }
  return false;
}

function digitToTime(digit) {
  var minutes = Math.floor(digit / 60);
  var seconds = digit - (minutes * 60);
  return (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);
}

function timeToDigit(time) {
  var parts = time.split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

var setupChart = function () {
  Chart.defaults.global.responsive = true;
  Chart.defaults.global.animation = false;
  Chart.defaults.global.showTooltips = false;

  var options = {
    scaleBeginAtZero: true,
    scaleShowGridLines: true,
    scaleGridLineColor: "#F3F3F3",
    scaleGridLineWidth: 1,
    scaleShowHorizontcaleBeginAtZerolLines: true,
    scaleShowVerticalLines: true,
    bezierCurve: false,
    bezierCurveTension: 0.4,
    pointDot: true,
    pointDotRadius: 4,
    pointDotStrokeWidth: 1,
    pointHitDetectionRadius: 20,
    datasetStroke: true,
    datasetStrokeWidth: 2,
    datasetFill: true,
    scales: {
      yAxes: [{
        type: "user-defined"
      }]
    },
    elements: {
      point: {
        radius: 0
      }
    }
  };

  var colors = {
    blue: '#2c83b9',
    orange: '#ff931e',
    blueTint: 'rgba(179,223,241,0.5)',
    orangeTint: 'rgba(244,225,201,0.3)'
  };

  var data = {
    labels: [],
    datasets: [
      {
        label: COMPARE_CODEC,
        data: [],
        steppedLine: true,
        backgroundColor: colors.orangeTint,
        borderColor: colors.orange,
        pointBackgroundColor: colors.orange,
        borderWidth: 2
      },
      {
        label: selectedCodec,
        data: [],
        steppedLine: true,
        backgroundColor: colors.blueTint,
        borderColor: colors.blue,
        pointBackgroundColor: colors.blue,
        borderWidth: 2
      }
    ]
  };

  for (var count = 0; count < MAX_SEGMENT_VIEW_COUNT; count++) {
    data.labels.push(digitToTime(count * SEGMENT_SIZE_SECONDS));
  }

  var UserDefinedScaleDefaults = Chart.scaleService.getScaleDefaults("linear");
  var UserDefinedScale = Chart.scaleService.getScaleConstructor("linear").extend({
    buildTicks: function () {
      this.min = 0;
      this.max = 12000;
      var stepWidth = 2000;

      this.ticks = [];
      for (var tickValue = this.min; tickValue <= this.max; tickValue += stepWidth) {
        this.ticks.push(tickValue);
      }

      if (this.options.position == "left" || this.options.position == "right") {
        this.ticks.reverse();
      }

      if (this.options.ticks.reverse) {
        this.ticks.reverse();
        this.start = this.max;
        this.end = this.min;
      } else {
        this.start = this.min;
        this.end = this.max;
      }

      this.zeroLineIndex = this.ticks.indexOf(0);
    }
  });

  Chart.scaleService.registerScaleType("user-defined", UserDefinedScale, UserDefinedScaleDefaults);

  var originalLineDraw = Chart.controllers.line.prototype.draw;
  Chart.helpers.extend(Chart.controllers.line.prototype, {
    draw: function () {
      originalLineDraw.apply(this, arguments);

      if (!this._data || this._data.length === 0) {
        // no data available yet
        return;
      }

      // draw currentTime indicator
      var labels = this.chart.config.data.labels;
      var chartArea = this.chart.chartArea;
      var timeRange = timeToDigit(labels[labels.length - 1]) - timeToDigit(labels[0]);
      var timeInRange = currentTime - timeToDigit(labels[0]);
      var xRange = chartArea.right - chartArea.left;
      var x = Math.min(chartArea.left + xRange * (timeInRange / timeRange), chartArea.right);

      // draw line
      this.chart.chart.ctx.beginPath();
      this.chart.chart.ctx.moveTo(x, chartArea.top);
      this.chart.chart.ctx.strokeStyle = '#1fabe2';
      this.chart.chart.ctx.lineWidth = 2;
      this.chart.chart.ctx.shadowBlur = 0.5;
      this.chart.chart.ctx.lineTo(x, chartArea.bottom);
      this.chart.chart.ctx.stroke();
    }
  });

  chart = new Chart(document.getElementById('chart-container').getContext('2d'), {
    type: 'line',
    data: data,
    options: options
  });
};

var interval;

function setupInterval() {
  clearInterval(interval);
  interval = setInterval(function () {
    currentTime += 0.01;
    chart.draw();
  }, 10);
}

var multicodec = function () {
  var browser = getBrowser();

  var config = {
    key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
    analytics: {
      key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
      videoId: 'multi-codec-streaming'
    },
    adaptation: {
      desktop: {
        qualityThreshold: 0.5,
        disableDownloadCancelling: true
      },
      mobile: {
        qualityThreshold: 0.5,
        disableDownloadCancelling: true
      }
    },
    playback: {
      muted: true
    },
    events: {
      play: function () {
        setupInterval();
      },
      stallstarted: function () {
        clearInterval(interval);
      },
      stallended: function () {
        setupInterval();
      },
      paused: function () {
        clearInterval(interval);
      },
      playbackfinished: function () {
        clearInterval(interval);
      }
    }
  };

  var source = {
    dash: '//bitmovin-a.akamaihd.net/webpages/demos/content/multi-codec/h264/stream.mpd',
    poster: 'images/comparison.jpg'
  };

  if (browser === BROWSER.CHROME || browser === BROWSER.FIREFOX) {
    selectedCodec = CODEC.VP9;
    source.dash = '//bitmovin-a.akamaihd.net/webpages/demos/content/multi-codec/vp9/stream.mpd';
  } else if (browser === BROWSER.EDGE && isTypeSupported('video/mp4; codecs="hvc1"')) {
    selectedCodec = CODEC.H265;
    source.dash = '//bitmovin-a.akamaihd.net/webpages/demos/content/multi-codec/hevc/stream.mpd';
  } else if (browser === BROWSER.EDGE && !isTypeSupported('video/mp4; codecs="hvc1"')) {
    selectedCodec = CODEC.VP9;
    source.dash = '//bitmovin-a.akamaihd.net/webpages/demos/content/multi-codec/vp9/stream.mpd';
  } else if (browser === BROWSER.SAFARI) {
    selectedCodec = CODEC.H265;
    source.hls = '//bitmovin-a.akamaihd.net/webpages/demos/content/multi-codec/hevc/stream_fmp4.m3u8';
    document.getElementById('stats-panels-wrapper').style.display = 'none'; //hiding the performance box as we do not get this data from safari
  }

  var selectedCodecElements = document.getElementsByClassName('selected-codec');
  for (var i = 0; i < selectedCodecElements.length; i++) {
    selectedCodecElements[i].innerHTML = getCodecImage(selectedCodec);
  }

  document.getElementById('compare-codec').innerHTML = getCodecImage(COMPARE_CODEC);
  document.getElementById('detected-browser').innerHTML = getBrowserImage(browser);

  var playerContainer = document.getElementById('player-container');
  bitmovin.player.Player.addModule(bitmovin.analytics.PlayerModule);
  player = new bitmovin.player.Player(playerContainer, config);

  player.load(source).then(function () {
    player.preload();
    player.seek = function () {
    };
  });

  player.on(bitmovin.player.PlayerEvent.SegmentRequestFinished, function (segment) {
    if (segment.mimeType.indexOf('audio') >= 0) {
      return;
    }

    updateBandwidthData();
  });

  player.on(bitmovin.player.PlayerEvent.TimeChanged, function (event) {
    currentTime = event.time;
    shiftSegments();
  });

  setupChart();
};


$(document).ready(multicodec);
