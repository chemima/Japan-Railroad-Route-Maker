const fs = require('fs');
const topojson = require('topojson-client'); // 패키지명 주의 (없으면 npm install topojson-client)

console.log("📍 Finding the perfect point for Anamizu...");

const railroadData = JSON.parse(fs.readFileSync('dist/data/railroad.json', 'utf8'));
const stationData = JSON.parse(fs.readFileSync('dist/data/station.json', 'utf8'));

const railroads = topojson.feature(railroadData, railroadData.objects.railroads);
const stations = topojson.feature(stationData, stationData.objects.stations);

const anamizu = stations.features.find(s => s.properties.stationName === '穴水');
const nanaoLines = railroads.features.filter(r => r.properties.lineName === '七尾線' && r.properties.company === 'のと鉄道');

if (!anamizu || nanaoLines.length === 0) {
  console.error("데이터를 찾을 수 없습니다.");
  process.exit(1);
}

function getClosestPointOnSegment(p, a, b) {
  const atob = { x: b[0] - a[0], y: b[1] - a[1] };
  const atop = { x: p[0] - a[0], y: p[1] - a[1] };
  const len2 = atob.x * atob.x + atob.y * atob.y;
  let t = Math.min(1, Math.max(0, (atop.x * atob.x + atop.y * atob.y) / len2));
  return [ a[0] + atob.x * t, a[1] + atob.y * t ];
}

function getDistSq(p1, p2) {
  return (p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2;
}

let bestPoint = null;
let minDistSq = Infinity;

nanaoLines.forEach(line => {
  const coords = line.geometry.coordinates;
  if (line.geometry.type === 'LineString') {
    for (let i = 0; i < coords.length - 1; i++) {
      const p = getClosestPointOnSegment(anamizu.geometry.coordinates, coords[i], coords[i+1]);
      const d = getDistSq(anamizu.geometry.coordinates, p);
      if (d < minDistSq) {
        minDistSq = d;
        bestPoint = p;
      }
    }
  }
});

if (bestPoint) {
  console.log("\n 아나미즈역이 가야 할 좌표:");
  console.log(`경도(x): ${bestPoint[0]}`);
  console.log(`위도(y): ${bestPoint[1]}`);
} else {
  console.log("좌표를 찾지 못했습니다.");
}