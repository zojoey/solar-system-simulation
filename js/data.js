// 太阳系行星数据
const planetsData = {
    sun: {
        name: "太阳",
        radius: 696340, // 半径（千米）
        mass: 1.989e30, // 质量（千克）
        distance: 0, // 距离太阳（天文单位）
        orbitalPeriod: 0, // 公转周期（地球日）
        rotationPeriod: 25.38, // 自转周期（地球日）
        color: "#FFA500", // 橙黄色
        texture: "textures/sun.jpg",
        description: "太阳是太阳系的中心天体，占据了太阳系总质量的99.86%。它是一颗G型主序星，通过核聚变产生能量，为太阳系提供光和热。",
        facts: [
            { label: "类型", value: "G型主序星" },
            { label: "年龄", value: "约46亿年" },
            { label: "表面温度", value: "5,500°C" },
            { label: "核心温度", value: "1,500万°C" },
            { label: "直径", value: "1,392,684千米" },
            { label: "引力", value: "274 m/s²" },
            { label: "逃逸速度", value: "617.7 km/s" }
        ],
        scale: 5, // 显示比例
        sceneScale: 0.5 // 在详情场景中的比例
    },
    mercury: {
        name: "水星",
        radius: 2439.7,
        mass: 3.301e23,
        distance: 0.387,
        orbitalPeriod: 88,
        rotationPeriod: 58.646,
        color: "#9E9E9E", // 灰褐色
        texture: "textures/mercury.jpg",
        description: "水星是太阳系中最小且最靠近太阳的行星，没有卫星。它的表面布满陨石坑，类似月球。",
        facts: [
            { label: "类型", value: "岩质行星" },
            { label: "表面温度", value: "-173°C至427°C" },
            { label: "大气成分", value: "几乎没有大气" },
            { label: "直径", value: "4,879千米" },
            { label: "引力", value: "3.7 m/s²" },
            { label: "卫星数量", value: "0" }
        ],
        scale: 0.8,
        sceneScale: 0.8,
        orbitalSpeed: 47.87 // 公转速度（千米/秒）
    },
    venus: {
        name: "金星",
        radius: 6051.8,
        mass: 4.867e24,
        distance: 0.723,
        orbitalPeriod: 224.7,
        rotationPeriod: -243, // 负值表示逆向自转
        color: "#F5DEB3", // 淡黄色
        texture: "textures/venus.jpg",
        description: "金星是太阳系中第二颗行星，也是除了太阳和月亮外最亮的天体。它被称为地球的姊妹星，因为两者大小和质量相似。",
        facts: [
            { label: "类型", value: "岩质行星" },
            { label: "表面温度", value: "462°C" },
            { label: "大气成分", value: "二氧化碳(96.5%)" },
            { label: "直径", value: "12,104千米" },
            { label: "引力", value: "8.87 m/s²" },
            { label: "卫星数量", value: "0" }
        ],
        scale: 0.9,
        sceneScale: 0.9,
        orbitalSpeed: 35.02
    },
    earth: {
        name: "地球",
        radius: 6371,
        mass: 5.972e24,
        distance: 1,
        orbitalPeriod: 365.25,
        rotationPeriod: 1,
        color: "#1E88E5", // 蓝绿色
        texture: "textures/earth.jpg",
        description: "地球是太阳系中第三颗行星，也是目前已知唯一孕育生命的天体。它的表面有71%被水覆盖，拥有保护生命的大气层。",
        facts: [
            { label: "类型", value: "岩质行星" },
            { label: "表面温度", value: "-88°C至58°C" },
            { label: "大气成分", value: "氮气(78%), 氧气(21%)" },
            { label: "直径", value: "12,742千米" },
            { label: "引力", value: "9.8 m/s²" },
            { label: "卫星数量", value: "1 (月球)" }
        ],
        scale: 1,
        sceneScale: 1,
        orbitalSpeed: 29.78
    },
    mars: {
        name: "火星",
        radius: 3389.5,
        mass: 6.417e23,
        distance: 1.524,
        orbitalPeriod: 687,
        rotationPeriod: 1.03,
        color: "#D32F2F", // 红色
        texture: "textures/mars.jpg",
        description: "火星是太阳系中第四颗行星，被称为红色星球。它有稀薄的大气层，表面有火山、峡谷、沙漠和极地冰盖。",
        facts: [
            { label: "类型", value: "岩质行星" },
            { label: "表面温度", value: "-153°C至20°C" },
            { label: "大气成分", value: "二氧化碳(95.3%)" },
            { label: "直径", value: "6,779千米" },
            { label: "引力", value: "3.7 m/s²" },
            { label: "卫星数量", value: "2 (火卫一、火卫二)" }
        ],
        scale: 0.85,
        sceneScale: 0.85,
        orbitalSpeed: 24.13
    },
    jupiter: {
        name: "木星",
        radius: 69911,
        mass: 1.898e27,
        distance: 5.203,
        orbitalPeriod: 4333,
        rotationPeriod: 0.41,
        color: "#E8A64A", // 棕黄条纹色
        texture: "textures/jupiter.jpg",
        description: "木星是太阳系中最大的行星，质量是太阳系中其他行星总和的2.5倍。它是一个气态巨行星，主要由氢和氦组成。",
        facts: [
            { label: "类型", value: "气态巨行星" },
            { label: "表面温度", value: "-145°C" },
            { label: "大气成分", value: "氢(89.8%), 氦(10.2%)" },
            { label: "直径", value: "139,822千米" },
            { label: "引力", value: "23.1 m/s²" },
            { label: "卫星数量", value: "79+" }
        ],
        scale: 1.8,  // 调整比例，避免过大
        sceneScale: 0.3,
        orbitalSpeed: 13.07
    },
    saturn: {
        name: "土星",
        radius: 58232,
        mass: 5.683e26,
        distance: 9.537,
        orbitalPeriod: 10759,
        rotationPeriod: 0.45,
        color: "#F9E076", // 淡黄色
        texture: "textures/saturn.jpg",
        description: "土星是太阳系中第二大行星，以其壮观的环系统而闻名。它也是一个气态巨行星，密度比水还低。",
        facts: [
            { label: "类型", value: "气态巨行星" },
            { label: "表面温度", value: "-178°C" },
            { label: "大气成分", value: "氢(96.3%), 氦(3.25%)" },
            { label: "直径", value: "116,464千米" },
            { label: "引力", value: "9.0 m/s²" },
            { label: "卫星数量", value: "82+" },
            { label: "环系统直径", value: "约270,000千米" }
        ],
        scale: 1.6,  // 调整比例，避免过大
        sceneScale: 0.25,
        orbitalSpeed: 9.69,
        hasRings: true
    },
    uranus: {
        name: "天王星",
        radius: 25362,
        mass: 8.681e25,
        distance: 19.191,
        orbitalPeriod: 30688.5,
        rotationPeriod: -0.72, // 负值表示逆向自转
        color: "#4DD0E1", // 青蓝色
        texture: "textures/uranus.jpg",
        description: "天王星是太阳系中第七颗行星，也是第一颗通过望远镜发现的行星。它的自转轴几乎与公转平面垂直，像是侧躺着公转。",
        facts: [
            { label: "类型", value: "冰巨行星" },
            { label: "表面温度", value: "-224°C" },
            { label: "大气成分", value: "氢(83%), 氦(15%), 甲烷(2.3%)" },
            { label: "直径", value: "50,724千米" },
            { label: "引力", value: "8.7 m/s²" },
            { label: "卫星数量", value: "27" }
        ],
        scale: 1.4,  // 调整比例，避免过大
        sceneScale: 0.2,
        orbitalSpeed: 6.81,
        axialTilt: 97.77 // 自转轴倾角（度）
    },
    neptune: {
        name: "海王星",
        radius: 24622,
        mass: 1.024e26,
        distance: 30.069,
        orbitalPeriod: 60182,
        rotationPeriod: 0.67,
        color: "#1A237E", // 深蓝色
        texture: "textures/neptune.jpg",
        description: "海王星是太阳系中最远的行星，也是第一颗通过数学计算预测发现的行星。它是一个风暴活跃的冰巨行星。",
        facts: [
            { label: "类型", value: "冰巨行星" },
            { label: "表面温度", value: "-218°C" },
            { label: "大气成分", value: "氢(80%), 氦(19%), 甲烷(1.5%)" },
            { label: "直径", value: "49,244千米" },
            { label: "引力", value: "11.0 m/s²" },
            { label: "卫星数量", value: "14" },
            { label: "最强风速", value: "2,100 km/h" }
        ],
        scale: 1.3,  // 调整比例，避免过大
        sceneScale: 0.2,
        orbitalSpeed: 5.43
    }
};

// 引力常数 (G)
const G = 6.67430e-11; // N·m²/kg²

// 天文单位 (AU) 转换为米
const AU = 149597870700; // 米

// 导出数据
export { planetsData, G, AU };