// const URL = 'https://api.luftdaten.info/static/v2/data.dust.min.json'
// const URL = 'https://api.luftdaten.info/v1/filter/area=48.800000,9.200000,50'
// const URL = 'https://api.airquality.codeforafrica.org/v2/sensors/?type=PPD42NS,HPM,PMS1003,PMS3003,PMS5003,PMS6003,PMS7003,SDS021,SDS011'
import _ from 'lodash';
import 'whatwg-fetch';

const URL = process.env.API_URL;

const api = {
  fetchNow() {
    return fetch(URL).then(response => response.json());
  },
  // fetches from /now, ignores non-finedust sensors
  // /now returns data from last 5 minutes, so we group all data by sensorId
  // and compute a mean to get distinct values per sensor
  getAllSensors() {
    return api.fetchNow().then(json => {
      const cells = _.chain(json)
        .filter(node => node.node_moved === false)
        .map((value) => {
          const id = () => {
            const stat = value.stats.find(s => ['P1', 'P2'].indexOf(s.value_type) !== -1);
            return stat ? Number(stat.sensor_id) : undefined;
          };
          const lat = Number(value.location.latitude);
          const long = Number(value.location.longitude);
          const date = new Date(value.last_data_received_at);
          const P1 = value.stats.find(s => s.value_type === 'P1');
          const P2 = value.stats.find(s => s.value_type === 'P2');
          return {
            latitude: lat,
            longitude: long,
            date: date.toLocaleDateString(),
            id: id(),
            data: {
              P1: P1 ? P1.average : 0,
              P2: P2 ? P2.average : 0
            }
          };
        })
        .value();
      return Promise.resolve(cells);
    });
  }
};

export default api;
