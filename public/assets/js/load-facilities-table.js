// DataTables에 CSV 로드하여 렌더링

function parseCSV(text) {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => {
        // 쉼표가 포함된 필드가 있을 수 있어 간단히 처리 (따옴표 제거)
        // 실제 환경에서는 Papaparse 같은 라이브러리를 권장
        const cols = [];
        let cur = '', inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') { inQuotes = !inQuotes; continue; }
            if (ch === ',' && !inQuotes) { cols.push(cur); cur = ''; continue; }
            cur += ch;
        }
        cols.push(cur);
        const obj = {};
        headers.forEach((h, idx) => obj[h] = (cols[idx] || '').trim());
        return obj;
    });
    return { headers, rows };
}

async function loadFacilities() {
    const tableEl = document.getElementById('dataTable');
    if (!tableEl) return;
    try {
        const res = await fetch('../data/노인복지시설데이터.csv');
        const text = await res.text();
        const { rows } = parseCSV(text);
        const data = rows.map(r => [
            r['유형'] || '',
            r['시설명'] || '',
            r['소재지'] || '',
            r['정원'] || '',
            r['급여 종류'] || '',
            r['행정동'] || ''
        ]);

        $('#dataTable').DataTable({
            data,
            columns: [
                { title: '유형' },
                { title: '시설명' },
                { title: '소재지' },
                { title: '정원' },
                { title: '급여 종류' },
                { title: '행정동' }
            ],
            order: [[1, 'asc']],
            pageLength: 25,
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.13.5/i18n/ko.json'
            }
        });
    } catch (e) {
        console.error('Failed to load facilities CSV:', e);
    }
}

document.addEventListener('DOMContentLoaded', loadFacilities);


