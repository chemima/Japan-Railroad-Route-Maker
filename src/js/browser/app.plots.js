const $ = require('umbrellajs');
const fragments = require('./fragments');

module.exports = function (App) {
  App.prototype.eventPlotDelete = function (e) {
    const $target = $(e.target).closest('.plot-item');
    const index = parseInt($target.attr('data-index'), 10);
    this.deletePlotItem(index);
  };

  App.prototype.eventPlotChangeColor = function (e) {
    const $target = $(e.target).closest('.plot-item');
    const index = parseInt($target.attr('data-index'), 10);

    const $existingPalette = $target.find('.mini-palette');
    if ($existingPalette.length > 0) {
      $existingPalette.remove();
      return;
    }

    const $palette = $('<div class="mini-palette">');

    const $input = $('<input type="text" class="mini-input" placeholder="#HEX">');
    $input.on('input', (evt) => {
      const val = evt.target.value;
      if (/^#?[0-9a-f]{6}$/i.test(val)) {
        const color = val.startsWith('#') ? val : '#' + val;
        this.changePlotColor(index, color);
      }
    });
    $palette.append($input);

    const colors = [
      '#ff0000', '#ef5350', '#ab47bc', '#303f9f', '#0000ff',
      '#1976d2', '#00ffff', '#00796b', '#388e3c', '#66bb6a',
      '#ffee58', '#f57c00', '#ffa726', '#a0a0a0', '#000000'
    ];

    colors.forEach(color => {
      const $swatch = $('<div class="mini-swatch">');
      $swatch.attr('style', 'background-color: ' + color);

      $swatch.on('click', () => {
        this.changePlotColor(index, color);
        // $palette.remove();
      });

      $palette.append($swatch);
    });

    $target.append($palette);
  };

  App.prototype.eventPlotChangeWidth = function (e) {
    const $target = $(e.target).closest('.plot-item');
    const index = parseInt($target.attr('data-index'), 10);

    const newWidth = parseInt(prompt('새로운 너비 (숫자)').trim());
    if (!newWidth) return;
    if (Number.isNaN(newWidth)) return;
    if (newWidth < 0 || newWidth > 0xffff) return;

    this.changePlotWidth(index, newWidth);
  };

  App.prototype.getPlotItem = function (index) {
    return $(`.plot-list .plot-item[data-index='${index}']`);
  };

  App.prototype.addPlotItem = function (
                                type, railroadHash, startHash, endHash,
                                color = '#000000', width = 1
                              ) {
    const route = this.JRP.getRoute(railroadHash, startHash, endHash);

    if (route === false) {
      alert('Unable to find a route');
      return;
    }

    let lineName;
    if (type === 'line') {
      const railroadFeatures = this.JRP.getRailroadFeatures(railroadHash);
      lineName = railroadFeatures[0].properties.lineName;
    }
    else if (type === 'series') {
      const series = this.JRP.seriesHashes.get(railroadHash);
      lineName = series.name;
    }

    const startName = this.JRP.getStationFeature(startHash).properties.stationName;
    const endName = this.JRP.getStationFeature(endHash).properties.stationName;

    const plotIndex = this.plots.length;
    const plot = {
      lineString: route,
      properties: {
        type: type,
        lineName: lineName,
        lineHash: railroadHash,
        startName: startName,
        startHash: startHash,
        endName: endName,
        endHash: endHash,
        color: color,
        width: width,
      },
      polyline: this.newGooglePolyline(route, color, width),
    };

    this.plots.push(plot);

    const $plotItem = fragments.plotItem(
      lineName, `${startName} → ${endName}`,
      color, width
    );

    $plotItem.attr('data-index', String(plotIndex));
    $plotItem.find('.action-delete').on('click', this.eventPlotDelete.bind(this));
    $plotItem.find('.action-color').on('click', this.eventPlotChangeColor.bind(this));
    $plotItem.find('.action-width').on('click', this.eventPlotChangeWidth.bind(this));

    $('.plot-list').append($plotItem);

    return plotIndex;
  }

  App.prototype.deletePlotItem = function (index) {
    this.getPlotItem(index).remove();
    for (let i = index + 1 ; i < this.plots.length ; i++)
      this.getPlotItem(i).attr('data-index', String(i - 1));

    this.plots[index].polyline.setMap(null);
    this.plots.splice(index, 1);
  };

  App.prototype.changePlotColor = function (index, newColor) {
    this.plots[index].polyline.set('strokeColor', newColor);
    this.plots[index].properties.color = newColor;
    this.getPlotItem(index).find('.action-color var').text(newColor);
  };

  App.prototype.changePlotWidth = function (index, newWidth) {
    this.plots[index].polyline.set('strokeWeight', newWidth);
    this.plots[index].properties.width = newWidth;
    this.getPlotItem(index).find('.action-width var').text(newWidth);
  };
};
