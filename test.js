const EARTH_RADIUS_M=6.371e6;const EARTH_RADIUS_MI=3958.8;function degToRad(degrees){return Math.PI/180*degrees;}
function objMap(obj,fn){return Object.fromEntries(Object.entries(obj).map(([k,v])=>[k,fn(v)]));}
function radToDeg(radians){return 180/Math.PI*radians;}
function distance(loc1,loc2){const loc1rad=objMap(loc1,degToRad);const loc2rad=objMap(loc2,degToRad);const dLat=degToRad(loc2.lat)-degToRad(loc1.lat);const dLon=degToRad(loc2.lon)-degToRad(loc1.lon);const a=Math.sin(dLat/2)*Math.sin(dLat/2)
+Math.cos(degToRad(loc1.lat))*Math.cos(degToRad(loc2.lat))*Math.sin(dLon/2)*Math.sin(dLon/2);const c=Math.atan2(Math.sqrt(a),Math.sqrt(1-a));return EARTH_RADIUS_MI*c;}