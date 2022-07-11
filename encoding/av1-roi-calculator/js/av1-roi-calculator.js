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

  (function initAvodForm() {
    // form values for calculation
    var averageCPMValue = 60;
    var weeklyRecurringViewersValue = 30;
    var playsPerUniquePerWeekValue = 1.5;
    var adsPerPlayValue = 2;

    function calculateAvodCosts() {
      var avodCostsValue = averageCPMValue
        * (weeklyRecurringViewersValue / 100)
        * playsPerUniquePerWeekValue
        * adsPerPlayValue
        * 0.0232;

      var avodCostsEl = $('#avod-costs');
      if (isNaN(avodCostsValue)) {
        avodCostsEl.text('--');
        return;
      }

      var avodCostsRoundValue = roundDecimals(avodCostsValue, 3);
      avodCostsEl.text(avodCostsRoundValue + ' $');
      console.debug('avodCostsValue=%d, avodCostsRoundValue=%d',
        avodCostsValue, avodCostsRoundValue);
    }

    // disable submit event
    var avodFormEl = $('#avod-form');
    avodFormEl.on('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
    });

    var averageCPMInputEl = $('input#averageCPMInput', avodFormEl);
    averageCPMInputEl.val(averageCPMValue);
    averageCPMInputEl.prop('disabled', false);
    averageCPMInputEl.on('input', inputEventHandler(function(value) {
      averageCPMValue = value;
      calculateAvodCosts();
    }));

    var weeklyRecurringViewersInputEl = $('input#weeklyRecurringViewersInput',
      avodFormEl);
    weeklyRecurringViewersInputEl.val(weeklyRecurringViewersValue);
    weeklyRecurringViewersInputEl.prop('disabled', false);
    weeklyRecurringViewersInputEl.on('input',
      inputEventHandler(function(value) {
        weeklyRecurringViewersValue = value;
        calculateAvodCosts();
      }));

    var playsPerUniquePerWeekInputEl = $('input#playsPerUniquePerWeekInput',
      avodFormEl);
    playsPerUniquePerWeekInputEl.val(playsPerUniquePerWeekValue);
    playsPerUniquePerWeekInputEl.prop('disabled', false);
    playsPerUniquePerWeekInputEl.on('input', inputEventHandler(function(value) {
      playsPerUniquePerWeekValue = value;
      calculateAvodCosts();
    }));

    var adsPerPlayInputEl = $('input#adsPerPlayInput', avodFormEl);
    adsPerPlayInputEl.val(adsPerPlayValue);
    adsPerPlayInputEl.prop('disabled', false);
    adsPerPlayInputEl.on('input', inputEventHandler(function(value) {
      adsPerPlayValue = value;
      calculateAvodCosts();
    }));

    calculateAvodCosts();
  })();

  (function initSvodForm() {
    // for values for calculation
    var playsPerSubscriberValue = 150;
    var currentErrorPercentageValue = 6.6;
    var targetErrorDecreaseValue = 10;

    function calculateSvodRate() {
      var subscriptionPriceValue = 10;
      var averageRevenuePerUserValue = 10;
      var days = averageRevenuePerUserValue / 0.06 / subscriptionPriceValue * 30;
      var errorsPerDay = playsPerSubscriberValue * (currentErrorPercentageValue / 100) / 30;

      var svodRateValue = ((days * errorsPerDay) - (days * errorsPerDay * (1 - (targetErrorDecreaseValue / 100)))) * errorsPerDay / days * 100;

      var svodRateEl = $('#svod-rate');
      if (isNaN(svodRateValue)) {
        svodRateEl.text('--');
        return;
      }

      var svodRateRoundValue = roundDecimals(svodRateValue, 3);
      svodRateEl.text(svodRateRoundValue + ' %');
      console.debug('svodRateValue=%d, svodRateRoundValue=%d',
        svodRateValue, svodRateRoundValue);
    }

    // disable submit event
    var svodFormEl = $('#svod-form');
    svodFormEl.on('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
    });

    var playsPerSubscriberInputEl = $('input#playsPerSubscriberInput',
      svodFormEl);
    playsPerSubscriberInputEl.val(playsPerSubscriberValue);
    playsPerSubscriberInputEl.prop('disabled', false);
    playsPerSubscriberInputEl.on('input', inputEventHandler(function(value) {
      playsPerSubscriberValue = value;
      calculateSvodRate();
    }));

    var currentErrorPercentageInputEl = $('input#currentErrorPercentageInput',
      svodFormEl);
    currentErrorPercentageInputEl.val(currentErrorPercentageValue);
    currentErrorPercentageInputEl.prop('disabled', false);
    currentErrorPercentageInputEl.on('input',
      inputEventHandler(function(value) {
        currentErrorPercentageValue = value;
        calculateSvodRate();
      }));

    var targetErrorDecreaseInputEl = $('input#targetErrorDecreaseInput',
      svodFormEl);
    targetErrorDecreaseInputEl.val(targetErrorDecreaseValue);
    targetErrorDecreaseInputEl.prop('disabled', false);
    targetErrorDecreaseInputEl.on('input', inputEventHandler(function(value) {
      targetErrorDecreaseValue = value;
      calculateSvodRate();
    }));

    calculateSvodRate();
  })();

});
