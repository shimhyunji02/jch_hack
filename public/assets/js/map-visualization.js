// Leaflet 기반 지도 시각화 스크립트

// GeoJSON 로드 유틸
async function loadGeoJSON(path) {
    try {
        const res = await fetch(path);
        if (!res.ok) throw new Error('Failed to load ' + path);
        return await res.json();
    } catch (e) {
        console.error('[GeoJSON] Load error:', path, e);
        return null;
    }
}

// 스타일 유틸
function createStyle(options) {
    const defaults = { color: '#4e73df', weight: 1, fillColor: '#4e73df', fillOpacity: 0.08 };
    return Object.assign({}, defaults, options || {});
}

// 그리드 스타일 (1km / 500m 등)
function gridStyle(feature) {
    return createStyle({ color: '#36b9cc', weight: 1, fillColor: '#36b9cc', fillOpacity: 0.05 });
}

// 시 경계 스타일
function boundaryStyle(feature) {
    return createStyle({ color: '#e74a3b', weight: 2, fillOpacity: 0 });
}

// 툴팁(팝업) 내용 생성
function featurePopup(feature) {
    const props = feature && feature.properties ? feature.properties : {};
    const keys = Object.keys(props);
    if (keys.length === 0) return 'No properties';
    const list = keys.slice(0, 10).map(k => `<div><strong>${k}</strong>: ${props[k]}</div>`).join('');
    return `<div>${list}${keys.length > 10 ? '<div>...</div>' : ''}</div>`;
}

// 지도 초기화
async function initializeMapVisualization() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // 기본 지도
    const map = L.map('map', { preferCanvas: true });

    // 베이스 타일 (OSM)
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // GeoJSON 로드
    const [boundary1km, grid1km, boundary] = await Promise.all([
        loadGeoJSON('data/chuncheon_boundary_1km.geojson'),
        loadGeoJSON('data/chuncheon_grid_1km.geojson'),
        loadGeoJSON('data/chuncheon_boundary.geojson')
    ]);

    // 레이어 구성
    const layers = {};

    if (boundary) {
        layers['Boundary'] = L.geoJSON(boundary, {
            style: boundaryStyle,
            onEachFeature: (f, l) => l.bindPopup(featurePopup(f))
        }).addTo(map);
    }

    if (boundary1km) {
        layers['Boundary (1km)'] = L.geoJSON(boundary1km, {
            style: boundaryStyle,
            onEachFeature: (f, l) => l.bindPopup(featurePopup(f))
        }).addTo(map);
    }

    if (grid1km) {
        layers['Grid (1km)'] = L.geoJSON(grid1km, {
            style: gridStyle,
            onEachFeature: (f, l) => l.bindPopup(featurePopup(f))
        }).addTo(map);
    }

    // 범위 맞추기
    const group = L.featureGroup(Object.values(layers));
    try {
        map.fitBounds(group.getBounds().pad(0.05));
    } catch (e) {
        map.setView([37.88, 127.73], 11); // 춘천 근처 대략 좌표 (fallback)
    }

    // 레이어 제어
    L.control.layers({ OSM: osm }, layers, { collapsed: false }).addTo(map);
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof L !== 'undefined') {
        initializeMapVisualization();
    }
});


