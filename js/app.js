// 导入行星数据和天文计算工具
import { planetsData, G, AU } from './data.js';
import { calculateAllPlanetPositions } from './astronomy.js';

// 主应用类
class SolarSystemApp {
    constructor() {
        // 计算当前真实行星位置
        this.realPlanetPositions = calculateAllPlanetPositions(new Date());
        
        // 初始化场景
        this.initScene();
        
        // 初始化行星
        this.initPlanets();
        
        // 初始化事件监听
        this.initEventListeners();
        
        // 开始动画循环
        this.animate();
    }
    
    // 根据距离获取行星名称
    getPlanetKeyByDistance(distance) {
        // 遍历所有行星数据，找到距离最接近的行星
        let closestPlanet = null;
        let minDifference = Infinity;
        
        for (const [key, data] of Object.entries(planetsData)) {
            if (key === 'sun') continue; // 跳过太阳
            
            const diff = Math.abs(data.distance - distance);
            if (diff < minDifference) {
                minDifference = diff;
                closestPlanet = key;
            }
        }
        
        return closestPlanet;
    }
    
    // 初始化Three.js场景
    initScene() {
        // 创建场景
        this.scene = new THREE.Scene();
        
        // 创建相机
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 30, 50);
        this.camera.lookAt(0, 0, 0);
        
        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById('solar-system').appendChild(this.renderer.domElement);
        
        // 添加环境光和平行光
        const ambientLight = new THREE.AmbientLight(0x404040, 1);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 0, 0); // 从太阳位置发出
        this.scene.add(directionalLight);
        
        // 添加星空背景
        this.addStarBackground();
        
        // 添加轨道控制器
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // 窗口大小调整事件
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    // 添加星空背景
    addStarBackground() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.7,
            transparent: true
        });
        
        const starsVertices = [];
        for (let i = 0; i < 5000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starsVertices.push(x, y, z);
        }
        
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    }
    
    // 初始化行星
    initPlanets() {
        this.planets = {};
        this.orbits = {};
        
        // 创建太阳和行星
        for (const [key, planetData] of Object.entries(planetsData)) {
            // 创建行星
            const planet = this.createPlanet(key, planetData);
            this.planets[key] = planet;
            
            // 如果不是太阳，创建轨道
            if (key !== 'sun') {
                const orbit = this.createOrbit(planetData.distance);
                this.orbits[key] = orbit;
            }
        }
        
        // 设置行星初始位置为当前真实位置
        this.setInitialPlanetPositions();
    }
    
    // 设置行星初始真实位置
    setInitialPlanetPositions() {
        for (const [key, planet] of Object.entries(this.planets)) {
            if (key === 'sun') continue;
            
            const planetData = planet.userData.data;
            const orbitInfo = this.orbits[key];
            
            // 获取行星的真实位置数据
            const realPosition = this.realPlanetPositions[key];
            if (!realPosition) continue;
            
            // 使用行星的真实三维坐标
            // 计算在轨道平面上的投影角度
            const angle = Math.atan2(realPosition.z, realPosition.x);
            
            // 计算行星位置，保持轨道半径不变，但使用真实的角度
            const x = Math.cos(angle) * orbitInfo.radius;
            const z = Math.sin(angle) * orbitInfo.radius;
            
            // 计算轨道倾角影响的y坐标
            // 使用realPosition的y值的比例来确定在可视化中的高度
            // 缩放因子用于控制可视化效果中的轨道倾角
            const inclination = Math.sqrt(realPosition.x * realPosition.x + realPosition.z * realPosition.z) > 0.001 ?
                realPosition.y / Math.sqrt(realPosition.x * realPosition.x + realPosition.z * realPosition.z) : 0;
            const yScale = 0.2; // 控制轨道倾角的可视化效果
            const y = inclination * orbitInfo.radius * yScale;
            
            // 更新行星位置
            planet.position.set(x, y, z);
        }
    }
    
    // 创建行星
    createPlanet(key, planetData) {
        // 计算行星显示大小（使用真实比例，但添加缩放因子以便可视化）
        // 使用地球作为基准，其他行星按照与地球的真实直径比例进行缩放
        const earthRadius = planetsData.earth.radius;
        const radiusRatio = planetData.radius / earthRadius;
        // 应用一个基础大小和非线性缩放，保持可视化效果的同时体现真实比例
        // 增加最小显示半径，确保小行星也能被看到
        const minDisplayRadius = 0.8; // 增加最小显示半径，从0.6增加到0.8
        
        // 为内行星应用更大的缩放因子
        let scaleFactor = 0.5;
        if (key === 'mercury' || key === 'venus' || key === 'earth' || key === 'mars') {
            scaleFactor = 1.0; // 内行星使用更大的缩放因子，从0.8增加到1.0
        }
        
        // 对太阳应用特殊的缩放因子，使其相对更小一些
        if (key === 'sun') {
            scaleFactor = 0.4; // 减小太阳的显示尺寸
        }
        
        const displayRadius = Math.max(minDisplayRadius, scaleFactor * Math.pow(radiusRatio, 0.4) * planetData.scale);
        
        // 创建行星几何体
        const geometry = new THREE.SphereGeometry(displayRadius, 32, 32);
        
        // 加载纹理
        let material;
        
        // 创建纹理加载器
        const textureLoader = new THREE.TextureLoader();
        
        // 对于太阳，添加发光效果
        if (key === 'sun') {
            // 尝试加载纹理，如果失败则使用颜色
            try {
                const texture = textureLoader.load(planetData.texture);
                material = new THREE.MeshBasicMaterial({ 
                    map: texture,
                    color: planetData.color 
                });
            } catch (error) {
                console.error(`无法加载${key}的纹理:`, error);
                material = new THREE.MeshBasicMaterial({ color: planetData.color });
            }
        } else {
            // 尝试加载纹理，如果失败则使用颜色
            try {
                const texture = textureLoader.load(planetData.texture);
                material = new THREE.MeshStandardMaterial({ 
                    map: texture,
                    roughness: 0.7,
                    metalness: 0.3
                });
            } catch (error) {
                console.error(`无法加载${key}的纹理:`, error);
                material = new THREE.MeshStandardMaterial({ 
                    color: planetData.color,
                    roughness: 0.7,
                    metalness: 0.3
                });
            }
        }
        
        // 创建网格
        const planet = new THREE.Mesh(geometry, material);
        planet.userData = { key, data: planetData };
        
        // 添加到场景
        this.scene.add(planet);
        
        // 如果是土星，添加光环
        if (planetData.hasRings) {
            const rings = this.createSaturnRings(displayRadius);
            planet.add(rings);
        }
        
        return planet;
    }
    
    // 创建土星环
    createSaturnRings(planetRadius) {
        const innerRadius = planetRadius * 1.2;
        const outerRadius = planetRadius * 2;
        const thetaSegments = 64;
        
        const geometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xf8e8c0,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6
        });
        
        const rings = new THREE.Mesh(geometry, material);
        rings.rotation.x = Math.PI / 2;
        return rings;
    }
    
    // 创建轨道
    createOrbit(distance) {
        // 轨道半径（使用真实的天文单位比例，但添加适当的缩放以适应屏幕）
        // 使用地球轨道作为基准（1AU），其他行星按照真实距离比例进行缩放
        // 应用一个非线性缩放，使内行星可见的同时不让外行星距离过大
        // 增加最小轨道半径，确保内行星轨道可见
        const minOrbitRadius = 12; // 增加最小轨道半径，从8增加到12
        // 使用更合理的非线性映射，确保内行星轨道更加明显
        // 对于内行星(distance < 2)，使用线性映射；对于外行星，使用非线性映射
        const orbitRadius = distance < 2 ? 
            minOrbitRadius + distance * 12 : // 内行星使用线性映射，系数从8增加到12
            minOrbitRadius + 24 + Math.pow(distance - 2, 0.4) * 8; // 外行星使用非线性映射，基础值从16增加到24
        
        const geometry = new THREE.RingGeometry(orbitRadius, orbitRadius + 0.15, 128); // 增加轨道宽度，从0.1增加到0.15
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x888888, // 增加轨道颜色亮度，从0x666666改为0x888888
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6 // 增加轨道不透明度，从0.5增加到0.6
        });
        
        const orbit = new THREE.Mesh(geometry, material);
        
        // 根据行星名称获取对应的轨道倾角
        let inclination = 0;
        const planetKey = this.getPlanetKeyByDistance(distance);
        
        if (planetKey) {
            // 根据用户提供的轨道倾角数据设置倾角
            switch (planetKey) {
                case 'mercury': inclination = 7.0; break; // 水星：7.0°
                case 'venus': inclination = 3.4; break;   // 金星：3.4°
                case 'earth': inclination = 0.0; break;    // 地球：0°（黄道面以此为基准）
                case 'mars': inclination = 1.8; break;     // 火星：1.8°
                case 'jupiter': inclination = 1.3; break;  // 木星：1.3°
                case 'saturn': inclination = 2.5; break;   // 土星：2.5°
                case 'uranus': inclination = 0.8; break;   // 天王星：0.8°
                case 'neptune': inclination = 1.8; break;  // 海王星：1.8°
                default: inclination = 0.0;
            }
        }
        
        // 将轨道平面旋转到黄道平面（XZ平面）
        orbit.rotation.x = Math.PI / 2;
        
        // 根据轨道倾角旋转轨道
        // 将角度转换为弧度
        const inclinationRad = (inclination * Math.PI) / 180;
        
        // 创建一个组来包含轨道，以便可以独立旋转
        const orbitGroup = new THREE.Group();
        orbitGroup.add(orbit);
        
        // 绕X轴旋转轨道组，实现轨道倾角
        orbitGroup.rotation.x = inclinationRad;
        
        // 添加到场景
        this.scene.add(orbitGroup);
        
        return { mesh: orbitGroup, radius: orbitRadius, inclination: inclination };
    }
    
    // 更新行星位置
    updatePlanetPositions(time) {
        for (const [key, planet] of Object.entries(this.planets)) {
            if (key === 'sun') continue;
            
            const planetData = planet.userData.data;
            const orbitInfo = this.orbits[key];
            
            // 获取行星的真实位置数据（初始位置）
            const realPosition = this.realPlanetPositions[key];
            if (!realPosition) continue;
            
            // 计算行星在轨道上的位置
            // 使用时间和轨道周期来确定角度，增加运动速度系数
            const speedFactor = 3.0; // 增加运动速度，从2.0提高到3.0
            // 使用真实位置的初始角度作为起点
            const initialAngle = Math.atan2(realPosition.z, realPosition.x);
            const angle = (initialAngle + time * 0.001 * speedFactor * (1 / planetData.orbitalPeriod) * Math.PI * 2) % (Math.PI * 2);
            
            // 计算行星在轨道平面上的位置（XZ平面）
            const xOrbit = Math.cos(angle) * orbitInfo.radius;
            const zOrbit = Math.sin(angle) * orbitInfo.radius;
            
            // 考虑轨道倾角，将轨道平面上的坐标转换到世界坐标系
            // 使用轨道倾角计算行星的实际位置
            if (orbitInfo.inclination) {
                // 将角度转换为弧度
                const inclinationRad = (orbitInfo.inclination * Math.PI) / 180;
                
                // 计算考虑轨道倾角后的坐标
                // 这里使用简化的旋转矩阵，只考虑绕X轴的旋转（轨道倾角）
                const x = xOrbit;
                const y = zOrbit * Math.sin(inclinationRad);
                const z = zOrbit * Math.cos(inclinationRad);
                
                // 更新行星位置
                planet.position.set(x, y, z);
            } else {
                // 如果没有轨道倾角数据，使用原来的方法
                planet.position.set(xOrbit, 0, zOrbit);
            }
            
            // 更新行星自转 - 增加自转速度系数
            const rotationSpeed = planetData.rotationPeriod !== 0 ? 
                (1 / Math.abs(planetData.rotationPeriod)) * 0.05 * speedFactor : 0; // 从0.01增加到0.05
            
            planet.rotation.y += rotationSpeed * (planetData.rotationPeriod >= 0 ? 1 : -1);
            
            // 如果是天王星，应用特殊的轴倾斜
            if (key === 'uranus') {
                planet.rotation.z = planetData.axialTilt * (Math.PI / 180);
            }
        }
    }
    
    // 计算引力
    calculateGravity(mass1, mass2, distance) {
        // 牛顿引力公式: F = G * (m1 * m2) / r^2
        return G * (mass1 * mass2) / (distance * distance);
    }
    
    // 初始化事件监听器
    initEventListeners() {
        // 射线投射器用于检测点击的对象
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // 点击事件监听
        this.renderer.domElement.addEventListener('click', (event) => {
            // 计算鼠标位置
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // 更新射线投射器
            this.raycaster.setFromCamera(this.mouse, this.camera);
            
            // 获取与射线相交的对象
            const intersects = this.raycaster.intersectObjects(Object.values(this.planets));
            
            if (intersects.length > 0) {
                // 获取点击的行星
                const planet = intersects[0].object;
                this.showPlanetDetails(planet.userData.key);
            }
        });
        
        // 关闭按钮点击事件
        document.querySelector('.close-btn').addEventListener('click', () => {
            this.hidePlanetDetails();
        });
        
        // 点击空白处返回太阳系视图
        document.getElementById('planet-info').addEventListener('click', (event) => {
            if (event.target === document.getElementById('planet-info')) {
                this.hidePlanetDetails();
            }
        });
    }
    
    // 显示行星详情
    showPlanetDetails(planetKey) {
        const planetData = planetsData[planetKey];
        
        // 设置行星名称
        document.getElementById('planet-name').textContent = planetData.name;
        
        // 清空并填充行星数据
        const planetDataContainer = document.getElementById('planet-data');
        planetDataContainer.innerHTML = '';
        
        // 添加描述
        const descriptionItem = document.createElement('div');
        descriptionItem.className = 'data-item';
        descriptionItem.innerHTML = `
            <div class="data-label">描述</div>
            <div class="data-value">${planetData.description}</div>
        `;
        planetDataContainer.appendChild(descriptionItem);
        
        // 添加物理特性数据
        for (const fact of planetData.facts) {
            const factItem = document.createElement('div');
            factItem.className = 'data-item';
            factItem.innerHTML = `
                <div class="data-label">${fact.label}</div>
                <div class="data-value">${fact.value}</div>
            `;
            planetDataContainer.appendChild(factItem);
        }
        
        // 添加轨道数据
        if (planetKey !== 'sun') {
            const orbitItem = document.createElement('div');
            orbitItem.className = 'data-item';
            orbitItem.innerHTML = `
                <div class="data-label">距离太阳</div>
                <div class="data-value">${planetData.distance} AU (${(planetData.distance * AU / 1000000).toFixed(0)}百万千米)</div>
            `;
            planetDataContainer.appendChild(orbitItem);
            
            const periodItem = document.createElement('div');
            periodItem.className = 'data-item';
            periodItem.innerHTML = `
                <div class="data-label">公转周期</div>
                <div class="data-value">${planetData.orbitalPeriod} 地球日</div>
            `;
            planetDataContainer.appendChild(periodItem);
            
            // 计算与太阳的引力
            const sunMass = planetsData.sun.mass;
            const distance = planetData.distance * AU;
            const gravity = this.calculateGravity(sunMass, planetData.mass, distance);
            
            const gravityItem = document.createElement('div');
            gravityItem.className = 'data-item';
            gravityItem.innerHTML = `
                <div class="data-label">与太阳的引力</div>
                <div class="data-value">${gravity.toExponential(2)} 牛顿</div>
            `;
            planetDataContainer.appendChild(gravityItem);
        }
        
        // 创建行星3D模型
        this.createPlanetModel(planetKey);
        
        // 显示详情面板
        document.getElementById('planet-info').classList.remove('hidden');
    }
    
    // 创建行星3D模型（详情视图）
    createPlanetModel(planetKey) {
        const planetData = planetsData[planetKey];
        const container = document.getElementById('planet-model');
        
        // 清空容器
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        
        // 创建新的场景、相机和渲染器
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        
        // 添加环境光和平行光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);
        
        // 创建行星
        const displayRadius = Math.log(planetData.radius) * 0.2 * planetData.sceneScale;
        const geometry = new THREE.SphereGeometry(displayRadius, 32, 32);
        
        // 创建纹理加载器
        const textureLoader = new THREE.TextureLoader();
        
        let material;
        if (planetKey === 'sun') {
            // 尝试加载纹理，如果失败则使用颜色
            try {
                const texture = textureLoader.load(planetData.texture);
                material = new THREE.MeshBasicMaterial({ 
                    map: texture,
                    color: planetData.color 
                });
            } catch (error) {
                console.error(`无法加载${planetKey}的纹理:`, error);
                material = new THREE.MeshBasicMaterial({ color: planetData.color });
            }
        } else {
            // 尝试加载纹理，如果失败则使用颜色
            try {
                const texture = textureLoader.load(planetData.texture);
                material = new THREE.MeshStandardMaterial({ 
                    map: texture,
                    roughness: 0.7,
                    metalness: 0.3
                });
            } catch (error) {
                console.error(`无法加载${planetKey}的纹理:`, error);
                material = new THREE.MeshStandardMaterial({ 
                    color: planetData.color,
                    roughness: 0.7,
                    metalness: 0.3
                });
            }
        }
        
        const planetMesh = new THREE.Mesh(geometry, material);
        scene.add(planetMesh);
        
        // 如果是土星，添加光环
        if (planetData.hasRings) {
            const rings = this.createSaturnRings(displayRadius);
            planetMesh.add(rings);
        }
        
        // 设置相机位置
        camera.position.set(0, 0, displayRadius * 5);
        camera.lookAt(0, 0, 0);
        
        // 添加轨道控制器
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        
        // 动画函数
        const animate = () => {
            requestAnimationFrame(animate);
            
            // 旋转行星
            planetMesh.rotation.y += 0.01;
            
            // 更新控制器
            controls.update();
            
            // 渲染场景
            renderer.render(scene, camera);
        };
        
        // 开始动画
        animate();
    }
    
    // 隐藏行星详情
    hidePlanetDetails() {
        document.getElementById('planet-info').classList.add('hidden');
    }
    
    // 动画循环
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // 更新行星位置
        this.updatePlanetPositions(performance.now());
        
        // 更新控制器
        this.controls.update();
        
        // 渲染场景
        this.renderer.render(this.scene, this.camera);
    }
}

// 当页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 创建太阳系应用实例
    const app = new SolarSystemApp();
});