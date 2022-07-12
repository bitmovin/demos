$(function() {

  /**
   * https://stackoverflow.com/questions/17369098/simplest-way-of-getting-the-number-of-decimals-in-a-number-in-javascript
   * @param n {number}
   * @returns {number}
   */
  function countDecimals(n) {
    if (Math.floor(n.valueOf()) === n.valueOf()) {
      return 0;
    }
    return n.toString().split('.')[1].length || 0;
  }

  /**
   * https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary
   * @param n {number}
   * @param decimalPlaces {number}
   * @returns {number}
   */
  function roundDecimals(n, decimalPlaces) {
    var diff = Math.pow(10, decimalPlaces);
    return Math.round((n.valueOf() + Number.EPSILON) * diff) / diff;
  }

  /**
   * Generic handler that sets 'is-invalid' class to input, if value is NaN or <0
   * @param onInputValue
   * @returns {function(value : Number | NaN): (undefined)}
   */
  function inputEventHandler(onInputValue) {
    return function(e) {
      var inputEl = $(this);
      inputEl.removeClass('is-invalid');

      var numberValue = Number(e.target.value);
      if (isNaN(numberValue) || numberValue < 0
        || countDecimals(numberValue) > 2) {
        inputEl.addClass('is-invalid');
        onInputValue(NaN);
        return;
      }

      onInputValue(numberValue);
    };
  }

  (function initAv1Form() {
    // form values for calculation
    let encodingCostPerMinute = 0.02;
    let ingressCostPerGb = 0.00;
    let egressCostPerGb = 0.04;

    let numberOfStreamsUhd = 2;
    let numberOfStreamsHd = 3;
    let numberOfStreamsSd = 4;

    const multiplierStreamUhd = 4;
    const multiplierStreamHd = 2;
    const multiplierStreamSd = 1;
    const multiplierTechPerTitle = 1.1;
    const multiplierTech3Pass = 2; // Multipass
    const multiplierCodecAv1 = 10;

    // streams/renditions
    const improvementsAv1H264 = 0.5; // 50%
    const improvementsAv1H265 = 0.7; // 30%
    const mbpsH264Uhd = 12;
    const mbpsH264Hd = 5;
    const mbpsH264Sd = 1;
    const uhdRenditionGbPerMinH264 = (mbpsH264Uhd * 60) / (8 * 1000); // GB (8 * 1000) per min (60 seconds)
    const uhdRenditionGbPerMinH265 = uhdRenditionGbPerMinH264 * improvementsAv1H264 / improvementsAv1H265;
    const uhdRenditionGbPerMinAv1 = uhdRenditionGbPerMinH264 * improvementsAv1H264;
    
    // result elements
    const av1H264Element = $('#av1-h264');
    const av1H265Element = $('#av1-h265');

    const calculateBreakEvenPoints = () => {
      // stream composition
      const multiplierStreamComposition = numberOfStreamsUhd * multiplierStreamUhd
        + numberOfStreamsHd * multiplierStreamHd
        + numberOfStreamsSd * multiplierStreamSd;
      const encodingCostPerMinuteAv1 = encodingCostPerMinute * multiplierStreamComposition
        * multiplierTech3Pass * multiplierTechPerTitle * multiplierCodecAv1;

      // all stream bandwidth
      const multiplierStreamCompositionMbps = numberOfStreamsUhd * mbpsH264Uhd
        + numberOfStreamsHd * mbpsH264Hd
        + numberOfStreamsSd * mbpsH264Sd;
      const allRenditionsGbPerMinH264 = (multiplierStreamCompositionMbps * 60) / (8 * 1000); // GB (8 * 1000) per min (60 seconds)
      const allRenditionsGbPerMinAv1 = allRenditionsGbPerMinH264 * improvementsAv1H264;
      
      // final result
      const av1H264BreakEven = (encodingCostPerMinuteAv1 + allRenditionsGbPerMinAv1 * ingressCostPerGb)
        / (egressCostPerGb * (uhdRenditionGbPerMinH264 - uhdRenditionGbPerMinAv1));
      const av1H265BreakEven = (encodingCostPerMinuteAv1 + allRenditionsGbPerMinAv1 * ingressCostPerGb)
        / (egressCostPerGb * (uhdRenditionGbPerMinH265 - uhdRenditionGbPerMinAv1));

      if (isNaN(av1H264BreakEven) || isNaN(av1H265BreakEven)) {
        av1H264Element.text('--');
        av1H265Element.text('--');
      } else  {
        av1H264Element.text(`${roundDecimals(av1H264BreakEven, 0)} views`);
        av1H265Element.text(`${roundDecimals(av1H265BreakEven, 0)} views`);
      }
    }

    // disable submit event
    const formElement = $('#av1-form');
    formElement.on('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
    });

    // handle input fields
    $('input#encodingCostPerMinute', formElement).val(encodingCostPerMinute)
      .on('input', inputEventHandler((value) => {
        encodingCostPerMinute = value;
        calculateBreakEvenPoints();
      }));
    
    $('input#ingressCostPerGb', formElement).val(ingressCostPerGb)
      .on('input', inputEventHandler((value) => {
        ingressCostPerGb = value;
        calculateBreakEvenPoints();
      }));
    
    $('input#egressCostPerGb', formElement).val(egressCostPerGb)
      .on('input', inputEventHandler((value) => {
        egressCostPerGb = value;
        calculateBreakEvenPoints();
      }));

    $('input#numberOfStreamsUhd', formElement).val(numberOfStreamsUhd)
      .on('input', inputEventHandler((value) => {
        numberOfStreamsUhd = value;
        calculateBreakEvenPoints();
      }));

    $('input#numberOfStreamsHd', formElement).val(numberOfStreamsHd)
      .on('input', inputEventHandler((value) => {
        numberOfStreamsHd = value;
        calculateBreakEvenPoints();
      }));

    $('input#numberOfStreamsSd', formElement).val(numberOfStreamsSd)
      .on('input', inputEventHandler((value) => {
        numberOfStreamsSd = value;
        calculateBreakEvenPoints();
      }));

    calculateBreakEvenPoints();
  })();

});
