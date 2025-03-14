// 天文计算工具模块
// 用于计算太阳系行星的真实位置

// 天文单位（AU）到千米的转换
const AU_TO_KM = 149597870.7;

// 行星轨道参数（J2000历元）
const orbitalElements = {
    mercury: {
        a: 0.38709927,      // 半长轴（AU）
        e: 0.20563593,      // 偏心率
        i: 7.00497902,      // 轨道倾角（度）
        L: 252.25032350,    // 平均经度（度）
        perihelion: 77.45779628,  // 近日点经度（度）
        node: 48.33076593,  // 升交点经度（度）
        period: 87.969      // 轨道周期（天）
    },
    venus: {
        a: 0.72333566,
        e: 0.00677672,
        i: 3.39467605,
        L: 181.97909950,
        perihelion: 131.60246718,
        node: 76.67984255,
        period: 224.701
    },
    earth: {
        a: 1.00000261,
        e: 0.01671123,
        i: 0.00001531,
        L: 100.46457166,
        perihelion: 102.93768193,
        node: 0.0,
        period: 365.256
    },
    mars: {
        a: 1.52371034,
        e: 0.09339410,
        i: 1.84969142,
        L: 355.45332744,
        perihelion: 336.04084219,
        node: 49.55953891,
        period: 686.980
    },
    jupiter: {
        a: 5.20288700,
        e: 0.04838624,
        i: 1.30439695,
        L: 34.39644051,
        perihelion: 14.72847983,
        node: 100.47390909,
        period: 4332.589
    },
    saturn: {
        a: 9.53667594,
        e: 0.05386179,
        i: 2.48599187,
        L: 49.95424423,
        perihelion: 92.59887831,
        node: 113.66242448,
        period: 10759.22
    },
    uranus: {
        a: 19.18916464,
        e: 0.04725744,
        i: 0.77263783,
        L: 313.23810451,
        perihelion: 170.95427630,
        node: 74.01692503,
        period: 30688.5
    },
    neptune: {
        a: 30.06992276,
        e: 0.00859048,
        i: 1.77004347,
        L: 304.88003451,
        perihelion: 44.96476227,
        node: 131.78422574,
        period: 60182
    }
};

// 将角度转换为弧度
function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

// 将弧度转换为角度
function toDegrees(radians) {
    return radians * 180 / Math.PI;
}

// 将角度标准化到0-360度范围内
function normalizeAngle(angle) {
    return angle - 360 * Math.floor(angle / 360);
}

// 计算J2000历元以来的天数
function getDaysSinceJ2000(date = new Date()) {
    // J2000历元是2000年1月1日12:00 UTC
    const J2000 = new Date('2000-01-01T12:00:00Z');
    const millisecondsSinceJ2000 = date.getTime() - J2000.getTime();
    return millisecondsSinceJ2000 / (1000 * 60 * 60 * 24);
}

// 计算开普勒方程（迭代求解）
function solveKeplerEquation(meanAnomaly, eccentricity) {
    // 将平近点角标准化到0-360度
    meanAnomaly = normalizeAngle(meanAnomaly);
    // 转换为弧度
    const M = toRadians(meanAnomaly);
    
    // 初始猜测值
    let E = M;
    
    // 迭代求解（通常5-10次迭代就能达到足够精度）
    for (let i = 0; i < 10; i++) {
        const delta = E - eccentricity * Math.sin(E) - M;
        E = E - delta / (1 - eccentricity * Math.cos(E));
    }
    
    // 转换回角度
    return toDegrees(E);
}

// 计算行星在轨道上的位置
function calculatePlanetPosition(planetName, date = new Date()) {
    // 获取行星轨道参数
    const planet = orbitalElements[planetName];
    if (!planet) {
        throw new Error(`未知行星: ${planetName}`);
    }
    
    // 计算J2000历元以来的天数
    const daysSinceJ2000 = getDaysSinceJ2000(date);
    
    // 计算平近点角（单位：度）
    // M = L - ω，其中L是平均经度，ω是近日点经度
    const meanAnomaly = normalizeAngle(planet.L - planet.perihelion + (360 / planet.period) * daysSinceJ2000);
    
    // 求解开普勒方程，得到偏近点角E
    const eccentricAnomaly = solveKeplerEquation(meanAnomaly, planet.e);
    
    // 计算真近点角（单位：弧度）
    const E = toRadians(eccentricAnomaly);
    const xv = Math.cos(E) - planet.e;
    const yv = Math.sqrt(1 - planet.e * planet.e) * Math.sin(E);
    const v = toDegrees(Math.atan2(yv, xv));
    
    // 计算日心距离（单位：AU）
    const r = planet.a * (1 - planet.e * Math.cos(E));
    
    // 计算日心坐标（轨道平面内）
    // 真近点角 + 近日点经度 = 真经度
    const trueAnomalyRad = toRadians(v);
    const perihelionRad = toRadians(planet.perihelion);
    const nodeRad = toRadians(planet.node);
    const inclinationRad = toRadians(planet.i);
    
    // 计算在轨道平面内的位置
    const xOrbit = r * Math.cos(trueAnomalyRad + perihelionRad - nodeRad);
    const yOrbit = r * Math.sin(trueAnomalyRad + perihelionRad - nodeRad);
    
    // 考虑轨道倾角，转换到黄道平面
    const x = xOrbit * Math.cos(nodeRad) - yOrbit * Math.cos(inclinationRad) * Math.sin(nodeRad);
    const y = xOrbit * Math.sin(nodeRad) + yOrbit * Math.cos(inclinationRad) * Math.cos(nodeRad);
    const z = yOrbit * Math.sin(inclinationRad);
    
    // 返回行星位置信息
    return {
        x, y, z,  // 日心直角坐标（AU）
        r,        // 日心距离（AU）
        v,        // 真近点角（度）
        angle: normalizeAngle(v + planet.perihelion)  // 轨道角度（度）
    };
}

// 计算所有行星的位置
function calculateAllPlanetPositions(date = new Date()) {
    const positions = {};
    
    for (const planetName in orbitalElements) {
        positions[planetName] = calculatePlanetPosition(planetName, date);
    }
    
    return positions;
}

// 导出函数
export {
    calculatePlanetPosition,
    calculateAllPlanetPositions,
    getDaysSinceJ2000,
    AU_TO_KM
};