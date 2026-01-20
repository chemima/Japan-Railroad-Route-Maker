const fs = require('fs');
const topojson = require('topojson');

console.log("* Snapping stations to railroad lines...");

// 1. 데이터 불러오기
const railroadData = JSON.parse(fs.readFileSync('dist/data/railroad.json', 'utf8'));
const stationData = JSON.parse(fs.readFileSync('dist/data/station.json', 'utf8'));

// 2. 계산을 위해 GeoJSON으로 변환 (TopoJSON -> GeoJSON)
const railroads = topojson.feature(railroadData, railroadData.objects.railroads);
// 역 좌표는 TopoJSON 객체를 직접 수정할 예정

// 3. 설정 파일(station-over-line.txt) 읽기
const configFile = fs.readFileSync('scripts/station-over-line.txt', 'utf8');
const lines = configFile.split('\n');

let currentLineIndices = [];
let snapCount = 0;

// 4. 가장 가까운 점 찾는 함수 (수학 공식)
function getClosestPointOnSegment(p, a, b) {
  const atob = { x: b[0] - a[0], y: b[1] - a[1] };
  const atop = { x: p[0] - a[0], y: p[1] - a[1] };
  const len2 = atob.x * atob.x + atob.y * atob.y;
  let dot = atop.x * atob.x + atop.y * atob.y;
  let t = Math.min(1, Math.max(0, dot / len2));
  return [ a[0] + atob.x * t, a[1] + atob.y * t ];
}

function getDistSq(a, b) {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
}

// 5. 파일 분석 및 좌표 수정
lines.forEach(line => {
  line = line.trim();
  if (!line) return;

  // 헤더 분석: [노선명 / 회사 / 인덱스들...]
  if (line.startsWith('[')) {
    const content = line.slice(1, -1); // 대괄호 제거
    const parts = content.split(' / ');
    if (parts.length >= 3) {
      currentLineIndices = parts[2].split(',').map(idx => parseInt(idx.trim(), 10));
    }
  } 
  // 역 정보 분석: 역이름 [인덱스] <true/false>
  else if (line.includes('<true>')) {
    const match = line.match(/\[(\d+)\]/);
    if (match) {
      const stationIdx = parseInt(match[1], 10);
      const stationGeo = stationData.objects.stations.geometries[stationIdx];
      
      if (stationGeo && currentLineIndices.length > 0) {
        let bestPoint = null;
        let minDistSq = Infinity;

        // 해당 노선의 모든 선로 조각(Segment)을 뒤져서 가장 가까운 곳 찾기
        currentLineIndices.forEach(rIdx => {
          const feature = railroads.features[rIdx];
          if (!feature) return;
          
          const coords = feature.geometry.coordinates;
          // LineString인 경우 (점들의 배열)
          if (feature.geometry.type === 'LineString') {
            for (let i = 0; i < coords.length - 1; i++) {
              const p = getClosestPointOnSegment(stationGeo.coordinates, coords[i], coords[i+1]);
              const d = getDistSq(stationGeo.coordinates, p);
              if (d < minDistSq) {
                minDistSq = d;
                bestPoint = p;
              }
            }
          }
          // MultiLineString인 경우 (배열의 배열) - 필요한 경우 추가 처리
        });

        // 좌표 수정!
        if (bestPoint) {
          stationGeo.coordinates = bestPoint;
          snapCount++;
        }
      }
    }
  }
});

// 6. 결과 저장
fs.writeFileSync('dist/data/station.json', JSON.stringify(stationData));
console.log(`* Done! ${snapCount} stations snapped to lines.`);