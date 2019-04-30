<template lang="jade">
#cell-info(v-if="cell")
	a(href='#' onclick='document.getElementById("cell-info").style.display="none";return false;' style='color:white') (close)
	p
		a(href='#' id='map-info-on' onclick='document.getElementById("map-info-on").style.display="none";document.getElementById("map-info-off").style.display="";document.getElementById("map-info").style.display=""; return false;' style='color:white') Show explanation
		a(href='#' id='map-info-off' onclick='document.getElementById("map-info-on").style.display="";document.getElementById("map-info-off").style.display="none";document.getElementById("map-info").style.display="none"; return false;' style='color:white; display:none;') Hide explanation
	div(id='map-info' style='display:none')
		p The tiles are currently colored according to the average of the PM10 values of all the sensors in the cell. See the scale on the bottom left.
		p The numbers in the first column correspond to the sensor IDs. The first line 'mean' contains the respective average values  of all sensors contained in the cell.
		p Please note: We show on the map the values of the last 5 minutes. The values published by the respective state authorities are given as a 24-hour average. This may cause the values on the chart to differ significantly from these 24-hour averages.
		p By clicking on the plus in front of the sensor ID 2 graphics can be displayed. The '24 h floating 'graph displays the 24-hour moving average for the last 7 days. For technical reasons, there is a gap of one day at the beginning, so the presentation actually shows 8 days, but the first one is empty. The second graphic 'Last 24 hours' shows the course of the day for the last 24 hours.
	h3 Sensors:  {{cell.length}}
	
	table
		tr
			th Sensor ID
			th PM10 µg/m³
			th PM2.5 µg/m³
			th Location
			th Last active date
		tr.mean
			td mean
			td {{mean.P1.toFixed(0)}}
			td {{mean.P2.toFixed(0)}}
			td
			td
		template(v-for="sensor in cell")
			tr
				td(style="text-align:left;")
					a(:id="'graph_'+sensor.o.id+'_on'" class="graph_on" onclick="var sensor=this.id.substring(0,this.id.length-3);document.getElementById(sensor).style.display='';document.getElementById(sensor+'_on').style.display='none';document.getElementById(sensor+'_off').style.display=''; document.getElementById('images_'+sensor.substr(6)).innerHTML='<iframe src=\"https://grafana.aq.sensors.africa/d-solo/vYpoziaiz/sensors-africa-single-sensor-view?orgId=1&var-sensor_id=' + sensor.substring(6) + '&panelId=2\" width=\"290\" height=\"200\" frameborder=\"0\"></iframe><br /><iframe src=\"https://grafana.aq.sensors.africa/d-solo/vYpoziaiz/sensors-africa-single-sensor-view?orgId=1&var-sensor_id=' + sensor.substring(6) + '&panelId=3\" width=\"290\" height=\"200\" frameborder=\"0\"></iframe><br /><br />'; return false;" href='#' style='color:white; text-decoration: none;') (+)&nbsp;{{sensor.o.id}}
					a(:id="'graph_'+sensor.o.id+'_off'" class="graph_off" onclick="var sensor=this.id.substring(0,this.id.length-4);document.getElementById(sensor).style.display='none';document.getElementById(sensor+'_on').style.display='';document.getElementById(sensor+'_off').style.display='none'; document.getElementById('images_'+sensor.substr(6)).innerHTML=''; return false;" href='#' style='color:white; text-decoration: none; display: none;') (-)&nbsp; {{sensor.o.id}}
				td {{sensor.o.data.P1.toFixed(0)}}
				td {{sensor.o.data.P2.toFixed(0)}}
				td {{sensor.o.location}}
				td {{sensor.o.date}}
			tr(:id = "'graph_'+sensor.o.id" style="display:none" class="cell_info_images")
				td(:id = "'images_'+sensor.o.id" colspan='6')
					br
</template>
<script>
import _ from "lodash";

export default {
  data() {
    return {
      location: (this.cell, o => o.o.location),
      date: (this.cell, o => o.o.date)
    };
  },
  props: {
    cell: Array
  },
  computed: {
    mean() {
      return {
        P1: _.meanBy(this.cell, o => o.o.data.P1),
        P2: _.meanBy(this.cell, o => o.o.data.P2)
      };
    }
  }
};
</script>
<style lang="stylus"></style>
