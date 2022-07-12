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

    const multiplierStreamUHD = 4;
    const multiplierStreamHD = 2;
    const multiplierStreamSD = 1;
    const multiplierTechPerTitle = 1.1;
    const multiplierTech2Pass = 1.25;
    const multiplierTech3Pass = 2;
    const multiplierCodecH264 = 1;
    const multiplierCodecH265 = 2;
    const multiplierCodecAv1 = 10;

    const improvementsAv1H264 = 0.5; // 50%
    const improvementsAv1H265 = 0.7; // 30%

    const UhdRenditionGbPerMinH264 = 0.09;
    const UhdRenditionGbPerMinH265 = 0.06428571429;
    const UhdRenditionGbPerMinAv1 = 0.045;

    const av1H264Element = $('#av1-h264');
    const av1H265Element = $('#av1-h265');

    const calculateBreakEvenPoints = () => {

      const encodingCostPerMinuteAv1 = 7.92;

      const av1H264BreakEven = encodingCostPerMinuteAv1 / (egressCostPerGb * (UhdRenditionGbPerMinH264 - UhdRenditionGbPerMinAv1));
      const av1H265BreakEven = encodingCostPerMinuteAv1 / (egressCostPerGb * (UhdRenditionGbPerMinH265 - UhdRenditionGbPerMinAv1));

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
