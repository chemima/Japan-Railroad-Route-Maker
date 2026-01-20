const fs = require('fs');
const topojson = require('topojson');

console.log("📍 Snapping stations to NEAREST VERTEX...");

// 1. 데이터 파일 경로
const railroadPath = 'dist/data/railroad.json';
const stationPath = 'dist/data/station.json';
const configPath = 'scripts/station-over-line.txt';

// 2. 파일 읽기
try {
  if (!fs.existsSync(railroadPath) || !fs.existsSync(stationPath) || !fs.existsSync(configPath)) {
    throw new Error("필요한 파일(railroad.json, station.json, station-over-line.txt)을 찾을 수 없습니다.");
  }
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

const railroadData = JSON.parse(fs.readFileSync(railroadPath, 'utf8'));
const stationData = JSON.parse(fs.readFileSync(stationPath, 'utf8'));
const configLines = fs.readFileSync(configPath, 'utf8').split('\n');

// 3. TopoJSON -> GeoJSON 변환 (계산용)
const railroads = topojson.feature(railroadData, railroadData.objects.railroads);
// 역은 TopoJSON 객체를 직접 수정하여 저장할 예정

// 4. 거리 계산 함수 (제곱 거리, 비교용)
function getDistSq(p1, p2) {
  return (p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2;
}

let currentLineIndices = [];
let fixedCount = 0;

// 5. 분석 및 수정 시작
configLines.forEach(line => {
  line = line.trim();
  if (!line) return;

  // 5-1. 노선 정보 헤더 파싱 [노선명 / 회사 / 인덱스...]
  if (line.startsWith('[')) {
    const content = line.slice(1, -1);
    const parts = content.split(' / ');
    if (parts.length >= 3) {
      currentLineIndices = parts[2].split(',').map(idx => parseInt(idx.trim(), 10));
    }
  } 
  // 5-2. <false>인 역 찾기
  else if (line.includes('<false>')) {
    const match = line.match(/^(.*?) \[(\d+)\]/); // "역이름 [ID]" 추출
    if (match) {
      const stationName = match[1];
      const stationIdx = parseInt(match[2], 10);
      
      // station.json의 실제 형상(Geometry) 가져오기
      const stationGeo = stationData.objects.stations.geometries[stationIdx];
      
      if (stationGeo && currentLineIndices.length > 0) {
        let bestVertex = null;
        let minDistSq = Infinity;

        // 해당 노선의 모든 선로 조각(Feature)을 순회
        currentLineIndices.forEach(rIdx => {
          const feature = railroads.features[rIdx];
          if (!feature) return;
          
          // 선로의 모든 점(Vertex)을 하나씩 검사
          const coords = feature.geometry.coordinates;
          
          if (feature.geometry.type === 'LineString') {
            for (let i = 0; i < coords.length; i++) {
              const vertex = coords[i];
              const d = getDistSq(stationGeo.coordinates, vertex);
              
              // 가장 가까운 점 갱신
              if (d < minDistSq) {
                minDistSq = d;
                bestVertex = vertex;
              }
            }
          }
          // (MultiLineString인 경우도 필요하면 여기에 추가)
        });

        // 5-3. 좌표 수정 (가장 가까운 Vertex로 이동)
        if (bestVertex) {
          // 원래 좌표 (로그용)
          const original = stationGeo.coordinates;
          
          //좌표 덮어쓰기
          stationGeo.coordinates = bestVertex;
          fixedCount++;
          
          console.log(`✅ Fixed: ${stationName} -> 선로 점(${bestVertex[0].toFixed(5)}, ${bestVertex[1].toFixed(5)})으로 이동`);
        } else {
          console.warn(`⚠️ Warning: ${stationName} 근처에서 선로 점을 찾지 못했습니다.`);
        }
      }
    }
  }
});

// 6. 결과 파일 저장
fs.writeFileSync(stationPath, JSON.stringify(stationData));
console.log(`\n🎉 완료! 총 ${fixedCount}개의 역을 가장 가까운 선로 꼭짓점(Vertex)으로 이동시켰습니다.`);