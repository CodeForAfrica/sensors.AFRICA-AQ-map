<template lang="jade">
.map
</template>
<script>
import leaflet from 'leaflet';
import hash from 'leaflet-hash';
import 'leaflet/dist/leaflet.css';
import './hexbin-layer';

import api from './feinstaub-api';

import querystring from 'querystring';

import config from 'config';
import places from './places';
import zooms from './zooms';
import _ from 'lodash';

export default {
  mounted() {
    const query = querystring.parse(window.location.search.substring(1));
    if (query.center) {
      // Coordinates are passed by query
      // /?center={lat},{lng}&zoom={zoom}
      const center = query.center.split(',').map((coord) => parseFloat(coord));
      config.center = center;
      if (query.zoom) {
        config.zoom = parseInt(query.zoom);
      }
    } else if (location.hash) {
      // Coordinates are passed by hash path
      // /#{zoom}/{lat}/{lng}
      var hashParams = location.hash.split('/');
      config.center = [hashParams[1], hashParams[2]];
      config.zoom = hashParams[0].substring(1);
    } else {
      // Visited city or country subdomain
      // https://{ city or country }.map.aq.sensors.africa
      //
      // Currenlty will not work
      // NOT SUPPORTED
      //
      const hostname = location.hostname;
      const hostnameParts = hostname.split('.');
      if (hostnameParts.length === 4) {
        const place = hostnameParts[0].toLowerCase();
        if (typeof places[place] !== 'undefined' && places[place] !== null) {
          config.center = places[place];
          config.zoom = 11;
        }
        if (typeof zooms[place] !== 'undefined' && zooms[place] !== null) {
          config.zoom = zooms[place];
        }
      }
    }

    const map = leaflet.map(this.$el, {
      center: config.center,
      zoom: config.zoom,
    });

    // Check if embedded and disable zoom
    if (window != window.top) {
      map.scrollWheelZoom.disable();
    }

    // leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    leaflet
      .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 13,
        // continuousWorld: false,
        // noWrap: true
      })
      .addTo(map);

    const options = {
      mouseover: () => {},
      mouseout: () => {},
      click: (data) => {
        this.$emit('cell-selected', data);
        document.getElementById('cell-info').style.display = '';
        let row_counter = document.getElementsByClassName('cell_info_images');
        for (var i = 0; i < row_counter.length; i++) {
          row_counter[i].style.display = 'none';
        }
        row_counter = document.getElementsByClassName('graph_on');
        for (var i = 0; i < row_counter.length; i++) {
          row_counter[i].style.display = '';
        }
        row_counter = document.getElementsByClassName('graph_off');
        for (var i = 0; i < row_counter.length; i++) {
          row_counter[i].style.display = 'none';
        }
      },
    };

    this.hexLayer = new leaflet.HexbinLayer(options).addTo(map);

    // Leaflet-hash lets you to add dynamic URL hashes to web pages with Leaflet maps.
    // You can easily link users to specific map views.
    this.hash = new L.hash(map);

    // Remove the hexlayer to on reload so that the position is updated
    // map.setView or map.panTo called in Hash does not seem to update hexLayer
    const refresh = _.debounce(() => {
      map.removeLayer(this.hexLayer);
      this.hexLayer.data([]);
      this.hexLayer.addTo(map);
      this.hexLayer.data(this.data);
    }, 200); // hash has a default throttle of 100 ms

    map.on('dragend', () => {
      map.dragged = true; // don't reload when dragged
    });

    map.on('moveend zoomend', () => {
      if (map.dragged) {
        return (map.dragged = false);
      }

      refresh();
    });

    this.data = [];
    api.getAllSensors().then((data) => {
      this.data = data;
      refresh();
    });
  },
};
</script>
<style lang="stylus"></style>
