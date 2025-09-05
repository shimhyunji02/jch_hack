// 데이터 시각화를 위한 JavaScript 파일
// CSV 파싱 및 Chart.js를 이용한 차트 생성

// CSV 파싱 함수
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = lines[i].split(',');
            const row = {};
            headers.forEach((header, index) => {
                row[header.trim()] = values[index] ? values[index].trim() : '';
            });
            data.push(row);
        }
    }
    return data;
}

// CSV 파일 로드 함수(비동기 로드)
async function loadCSVData() {
    try {
        const response = await fetch('data/final_data.csv');
        const csvText = await response.text();
        const data = parseCSV(csvText);
        return data;
    } catch (error) {
        console.error('CSV 파일 로드 실패:', error);
        return [];
    }
}

// 연령대별 인구 분포 데이터 처리
function getAgeDistributionData(data) {
    const ageGroups = {};
    
    data.forEach(row => {
        const age = row['연령'];
        const population = parseInt(row['인구수_계']) || 0;
        
        if (age && age !== '0' && !age.includes('세')) {
            if (!ageGroups[age]) {
                ageGroups[age] = 0;
            }
            ageGroups[age] += population;
        }
    });
    
    return {
        labels: Object.keys(ageGroups),
        data: Object.values(ageGroups)
    };
}

// 행정동별 총인구수 데이터 처리
function getDistrictPopulationData(data) {
    const districts = {};
    
    data.forEach(row => {
        const district = row['행정동'];
        const totalPopulation = parseInt(row['총인구수']) || 0;
        
        if (district && totalPopulation > 0) {
            if (!districts[district]) {
                districts[district] = 0;
            }
            districts[district] = Math.max(districts[district], totalPopulation);
        }
    });
    
    // 상위 10개 행정동만 표시
    const sortedDistricts = Object.entries(districts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    
    return {
        labels: sortedDistricts.map(([district]) => district),
        data: sortedDistricts.map(([,population]) => population)
    };
}

// 고령인구비율 데이터 처리
function getElderlyRatioData(data) {
    const monthlyData = {};
    
    data.forEach(row => {
        const month = row['월'];
        const ratio = parseFloat(row['고령인구비율']) || 0;
        
        if (month && ratio > 0) {
            if (!monthlyData[month]) {
                monthlyData[month] = [];
            }
            monthlyData[month].push(ratio);
        }
    });
    
    // 월별 평균 고령인구비율 계산
    const avgRatios = {};
    Object.keys(monthlyData).forEach(month => {
        const ratios = monthlyData[month];
        avgRatios[month] = ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
    });
    
    return {
        labels: Object.keys(avgRatios).sort((a, b) => a - b),
        data: Object.keys(avgRatios).sort((a, b) => a - b).map(month => avgRatios[month])
    };
}

// 성별 인구 분포 데이터 처리
function getGenderDistributionData(data) {
    let totalMale = 0;
    let totalFemale = 0;
    
    data.forEach(row => {
        const male = parseInt(row['인구수_남']) || 0;
        const female = parseInt(row['인구수_여']) || 0;
        totalMale += male;
        totalFemale += female;
    });
    
    return {
        labels: ['남성', '여성'],
        data: [totalMale, totalFemale]
    };
}

// 복지시설 밀도 데이터 처리
function getWelfareFacilityData(data) {
    const facilities = {};
    
    data.forEach(row => {
        const district = row['행정동'];
        const density = parseFloat(row['복지시설밀도']) || 0;
        
        if (district && density > 0) {
            if (!facilities[district]) {
                facilities[district] = 0;
            }
            facilities[district] = Math.max(facilities[district], density);
        }
    });
    
    // 상위 8개 행정동만 표시
    const sortedFacilities = Object.entries(facilities)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8);
    
    return {
        labels: sortedFacilities.map(([district]) => district),
        data: sortedFacilities.map(([,density]) => density)
    };
}

// 파이 차트 생성 함수
function createPieChart(canvasId, data, title) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.data,
                backgroundColor: [
                    '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e',
                    '#e74a3b', '#858796', '#5a5c69', '#f8f9fc'
                ],
                hoverBackgroundColor: [
                    '#2e59d9', '#17a673', '#2c9faf', '#dda20a',
                    '#c0392b', '#6c757d', '#4a4b52', '#d1d3e2'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: title
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// 막대 차트 생성 함수
function createBarChart(canvasId, data, title) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: '인구수',
                data: data.data,
                backgroundColor: '#4e73df',
                borderColor: '#2e59d9',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: title
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 라인 차트 생성 함수
function createLineChart(canvasId, data, title) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: '고령인구비율',
                data: data.data,
                borderColor: '#e74a3b',
                backgroundColor: 'rgba(231, 74, 59, 0.1)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: title
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 도넛 차트 생성 함수
function createDoughnutChart(canvasId, data, title) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.data,
                backgroundColor: [
                    '#4e73df', '#1cc88a'
                ],
                hoverBackgroundColor: [
                    '#2e59d9', '#17a673'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: title
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// 대시보드 차트 초기화
async function initializeDashboardCharts() {
    const data = await loadCSVData();
    if (data.length === 0) return;
    
    // 연령대별 인구 분포 파이 차트
    const ageData = getAgeDistributionData(data);
    createPieChart('myPieChart', ageData, '연령대별 인구 분포');
    
    // 행정동별 총인구수 막대 차트
    const districtData = getDistrictPopulationData(data);
    createBarChart('myBarChart', districtData, '행정동별 총인구수 (상위 10개)');
    
    // 고령인구비율 추이 라인 차트
    const elderlyData = getElderlyRatioData(data);
    createLineChart('myAreaChart', elderlyData, '월별 고령인구비율 추이');
}

// 차트 페이지 차트 초기화
async function initializeChartsPage() {
    const data = await loadCSVData();
    if (data.length === 0) return;
    
    // 성별 인구 분포 도넛 차트
    const genderData = getGenderDistributionData(data);
    createDoughnutChart('myPieChart', genderData, '성별 인구 분포');
    
    // 복지시설 밀도 막대 차트
    const facilityData = getWelfareFacilityData(data);
    createBarChart('myBarChart', facilityData, '행정동별 복지시설 밀도 (상위 8개)');
    
    // 고령인구비율 추이 라인 차트
    const elderlyData = getElderlyRatioData(data);
    createLineChart('myAreaChart', elderlyData, '월별 고령인구비율 추이');
}

// 페이지 로드 시 자동 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 현재 페이지에 따라 적절한 차트 초기화
    if (document.getElementById('myPieChart') && document.getElementById('myAreaChart')) {
        // 대시보드 페이지
        initializeDashboardCharts();
    } else if (document.getElementById('myAreaChart') && document.getElementById('myBarChart')) {
        // 차트 페이지
        initializeChartsPage();
    }
});
