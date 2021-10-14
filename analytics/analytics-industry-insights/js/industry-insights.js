var countriesChart = {};
var mapChart = {};
const INDUSTRY_INSIGHT_MEDIAN_STARTUP_TIME_URL = 'https://storage.googleapis.com/bitmovin-frontend-cdn-origin/frontend/demos/analytics/median_video_startup_time_test.json'
const INDUSTRY_INSIGHT_ERROR_PERCENTAGE_URL = 'https://storage.googleapis.com/bitmovin-frontend-cdn-origin/frontend/demos/analytics/error_percentage_test.json'
const INDUSTRY_INSIGHT_REBUFFER_PERCENTAGE_URL = 'https://storage.googleapis.com/bitmovin-frontend-cdn-origin/frontend/demos/analytics/rebuffer_percentage_test.json'

$(function () {
    reset();

    $(document).on('change', '#available-industry-insight-metrics', function () {
        reset();
        if (this.value === 'medianStartupTime') {
            showMedianStartupTimeChart();
        }
        if (this.value === 'errorPercentage') {
            showErrorPercentageChart();
        }
        if (this.value === 'rebufferPercentage') {
            showRebufferPercentageChart();
        }
    });

    showMedianStartupTimeChart();
});

function getIndustryInsightsData(url, callbackFunction) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            callbackFunction(JSON.parse(xhr.responseText));
        }
    };

    xhr.send();
}

function showMedianStartupTimeChart() {
       // todo check real ranges
    const dataClasses = [
        {
            from: 10
        },
        {
            from: 7.5,
            to: 10
        },
        {
            from: 6,
            to: 7.5
        },
        {
            from: 4.5,
            to: 6
        },
        {
            from: 3,
            to: 4.5
        },
        {
            from: 1.5,
            to: 3
        },
        {
            to: 1.5
        }];
    $('#metricLegend').html('Median video startup time (s)');
    $('#legend_max_value').html('10');
    $('#startupTimeContent').show();
    $('#errorPercentageContent').hide();
    $('#rebufferPercentageContent').hide();

    getIndustryInsightsData(INDUSTRY_INSIGHT_MEDIAN_STARTUP_TIME_URL, (response) => {
        const data = response.map((res, i) => ({
            code: res.countryCode.toUpperCase(),
            value: (parseFloat(res.value) / 1000).toFixed(2),
            name: res.countryCode,
        }));

      
        drawChart(data, 'Median video startup time', 'Seconds', 's', dataClasses);
    });
}

function showErrorPercentageChart() {
    // todo check real ranges
    const dataClasses = [
        {
            from: 2.8
        },
        {
            from: 2.0,
            to: 2.4
        },
        {
            from: 1.6,
            to: 2.0
        },
        {
            from: 1.2,
            to: 1.6
        },
        {
            from: 0.8,
            to: 1.2
        },
        {
            from: 0.4,
            to: 0.8
        },
        {
            to: 0.4
        }];
        $('#startupTimeContent').hide();
        $('#errorPercentageContent').show();
        $('#rebufferPercentageContent').hide();
        $('#metricLegend').html('Error percentage (%)');
        $('#legend_max_value').html('3');
    getIndustryInsightsData(INDUSTRY_INSIGHT_ERROR_PERCENTAGE_URL, (response) => {
        const data = response.map((res, i) => ({
            code: res.countryCode.toUpperCase(),
            value: parseFloat(res.value).toFixed(2),
            name: res.countryCode,
        }));

        drawChart(data, 'Error Percentage', 'Percentage', '%', dataClasses);
    });
}

function showRebufferPercentageChart() {
       // todo check real ranges
    const dataClasses = [
        {
            from: 2.8
        },
        {
            from: 2.0,
            to: 2.4
        },
        {
            from: 1.6,
            to: 2.0
        },
        {
            from: 1.2,
            to: 1.6
        },
        {
            from: 0.8,
            to: 1.2
        },
        {
            from: 0.4,
            to: 0.8
        },
        {
            to: 0.4
        }];

        $('#startupTimeContent').hide();
        $('#errorPercentageContent').hide();
        $('#rebufferPercentageContent').show();
        $('#metricLegend').html('Rebuffer percentage (%)');
        $('#legend_max_value').html('3');
    getIndustryInsightsData(INDUSTRY_INSIGHT_REBUFFER_PERCENTAGE_URL, (response) => {
        const data = response.map((res, i) => ({
            code: res.countryCode.toUpperCase(),
            value: parseFloat(res.value).toFixed(2),
            name: res.countryCode
        }));
        drawChart(data, 'Rebuffer Percentage', 'Percentage', '%', dataClasses);
    })
}

function drawChart(data, metric, unit, unitAbb, dataClasses) {

    Highcharts.wrap(Highcharts.Point.prototype, 'select', function (proceed) {
        proceed.apply(this, Array.prototype.slice.call(arguments, 1));
        var points = mapChart.getSelectedPoints();

        if (points.length === 0) {
            reset();
        }
        else if (points.length === 1) {
            if (!$.isEmptyObject(countriesChart)) {
                countriesChart = countriesChart.destroy();
            }
            setValues(points[0], metric, unit);
            $('#info').show();
            $('#instructions').show();
            $('#additionalData').show();
            $('#chartTitle').hide();
        } else {
            $('#info').hide();
            $('#chartTitle').show();
            var categories = $.map(points, function (n, i) {
                return [n.name];
            });
            var seriesData = $.map(points, function (n, i) {
                return [{ "name": n.name, "data": [parseFloat(n.value)] }];
            });

            compareCharts(categories, seriesData, metric, unit, unitAbb);
        }

    });

    mapChart = Highcharts
        .mapChart('container', {
            title: {
                text: ''
            },
            chart: {
                map: map,
            },

            colors: ['rgba(0, 107, 255, 1)',
                'rgba(0, 107, 255, 0.8)',
                'rgba(0, 107, 255, 0.6)',
                'rgba(0, 107, 255, 0.4)',
                'rgba(0, 107, 255, 0.2)',
                'rgba(0, 107, 255, 0.05)'
            ],

            mapNavigation: {
                enabled: true
            },

            legend: {
                enabled: false
            },
            tooltip: {
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#CBE0ED',
                borderRadius: 16,
                useHTML: true,
                pointFormat: '<div> <b> {point.name}:</b> {point.value} ' + unitAbb + ' <br/>' +
                    '<small>(click for details) </small></div>'
            },
            colorAxis: [{
                maxColor: 'rgba(0, 107, 255, 1)',
                minColor: 'rgba(0, 107, 255, 0.2)',
                dataClasses: dataClasses
            }],
            series: [{
                data: data,
                allowPointSelect: true,
                joinBy: ['iso-a2', 'code'],
                animation: true,
                name: metric,
                states: {
                    hover: {
                        color: '#43C878'
                    }
                },
                colorAxis: 0,

                nullColor: '#DCDFE4',

                shadow: false
            }],
            credits: {
                enabled: false
            },
        });
}

function compareCharts(categories, series, metric, unit, unitAbb) {

    if ($.isEmptyObject(countriesChart)) {

        countriesChart = Highcharts.chart('country-chart', {
            chart: {
                type: 'column'
            },
            title: {
                text: ''
            },
            xAxis: {
                categories: categories,
                labels: {
                    enabled: false
                }
            },
            colors: ['#1278E1',
                '#3dd9bb',
                '#f3d236',
                '#d2347f',
                '#ad5536',
                '#2f66f2',
                '#bd37d1',
                '#32e0bf',
                '#670CE8',
                '#FF0000',
                '#E8900C',
                '#9A0DFF',
                '#100CE8',
                '#E8B00C',
                '#0DFF1A'],
            yAxis: {
                min: 0,
                title: {
                    text: unit
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">' + metric + '</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                    '<td style="padding:0"><b>{point.y:.1f} ' + unitAbb + '</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: series,
            credits: {
                enabled: false
            },
        });
    }
    else {
        countriesChart.categories = categories;
        $.each(series, function (i) {
            if (countriesChart.series[i]) {
                countriesChart.series[i].update({
                    name: this.name,
                    data: this.data,
                }, false);
            } else {
                countriesChart.addSeries({
                    name: this.name,
                    data: this.data,
                }, false);
            }
        });
        while (countriesChart.series.length > series.length) {
            countriesChart.series[countriesChart.series.length - 1].remove(false);
        }
        countriesChart.redraw();
    }
}


function setValues(point, metric, unit) {
    $('#info #flag').attr('class', 'flag ' + point.properties["hc-key"]);
    $('#country').html(point.name);
    $('#metricName').html(metric);
    $('#metricValue').html(point.value + ' ' + unit);
    $('#intructions').show();
}

function reset() {
    $('#additionalData').hide();

    if (!$.isEmptyObject(countriesChart)) {
        countriesChart = countriesChart.destroy();
    }
}
