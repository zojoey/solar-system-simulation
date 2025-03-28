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
            
            // 检查是否有椭圆轨道参数
            if (orbitInfo.a && orbitInfo.b) {
                // 使用椭圆方程计算行星位置
                const a = orbitInfo.a;
                const b = orbitInfo.b;
                
                // 计算行星在椭圆轨道上的位置
                const xOrbit = a * Math.cos(angle);
                const zOrbit = b * Math.sin(angle);
                
                // 考虑轨道倾角，将轨道平面上的坐标转换到世界坐标系
                if (orbitInfo.inclination) {
                    // 将角度转换为弧度
                    const inclinationRad = (orbitInfo.inclination * Math.PI) / 180;
                    
                    // 计算考虑轨道倾角后的坐标
                    const x = xOrbit;
                    const y = zOrbit * Math.sin(inclinationRad);
                    const z = zOrbit * Math.cos(inclinationRad);
                    
                    // 更新行星位置
                    planet.position.set(x, y, z);
                } else {
                    // 如果没有轨道倾角数据，使用原来的方法
                    planet.position.set(xOrbit, 0, zOrbit);
                }
            } else {
                // 如果没有椭圆轨道参数，使用圆形轨道
                const x = Math.cos(angle) * orbitInfo.radius;
                const z = Math.sin(angle) * orbitInfo.radius;
                
                // 计算轨道倾角影响的y坐标
                if (orbitInfo.inclination) {
                    // 将角度转换为弧度
                    const inclinationRad = (orbitInfo.inclination * Math.PI) / 180;
                    
                    // 计算考虑轨道倾角后的坐标
                    const y = z * Math.sin(inclinationRad);
                    const newZ = z * Math.cos(inclinationRad);
                    
                    // 更新行星位置
                    planet.position.set(x, y, newZ);
                } else {
                    // 如果没有轨道倾角数据，使用原来的方法
                    planet.position.set(x, 0, z);
                }
            }
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
        
        // 添加错误处理，防止纹理加载失败导致黑屏
        textureLoader.crossOrigin = 'anonymous';
        
        // 添加加载管理器
        const loadingManager = new THREE.LoadingManager();
        loadingManager.onError = function(url) {
            console.error('加载纹理失败:', url);
            // 使用相对路径重试
            if (url.startsWith('http')) {
                const relativePath = url.split('/').pop();
                console.log('尝试使用相对路径加载:', relativePath);
                return 'textures/' + relativePath;
            }
        };
        textureLoader.manager = loadingManager;
        
        // 对于太阳，添加发光效果
        if (key === 'sun') {
            // 预先创建基础材质，确保即使纹理加载失败也能显示
            material = new THREE.MeshBasicMaterial({ color: planetData.color });
            
            // 尝试加载纹理
            textureLoader.load(
                planetData.texture,
                // 成功回调
                (texture) => {
                    material.map = texture;
                    material.needsUpdate = true;
                },
                // 进度回调
                undefined,
                // 错误回调
                (error) => {
                    console.error(`无法加载${key}的纹理:`, error);
                    // 尝试使用相对路径重新加载
                    const relativePath = planetData.texture.split('/').pop();
                    if (relativePath) {
                        console.log(`尝试使用相对路径重新加载${key}的纹理:`, relativePath);
                        textureLoader.load(
                            `textures/${relativePath}`,
                            (texture) => {
                                material.map = texture;
                                material.needsUpdate = true;
                                console.log(`${key}的纹理使用相对路径加载成功`);
                            },
                            undefined,
                            (secondError) => {
                                console.error(`使用相对路径加载${key}的纹理仍然失败:`, secondError);
                            }
                        );
                    }
                }
            );
        } else {
            // 预先创建基础材质，确保即使纹理加载失败也能显示
            material = new THREE.MeshStandardMaterial({ 
                color: planetData.color,
                roughness: 0.7,
                metalness: 0.3
            });
            
            // 尝试加载纹理
            textureLoader.load(
                planetData.texture,
                // 成功回调
                (texture) => {
                    material.map = texture;
                    material.needsUpdate = true;
                },
                // 进度回调
                undefined,
                // 错误回调
                (error) => {
                    console.error(`无法加载${key}的纹理:`, error);
                    // 尝试使用相对路径重新加载
                    const relativePath = planetData.texture.split('/').pop();
                    if (relativePath) {
                        console.log(`尝试使用相对路径重新加载${key}的纹理:`, relativePath);
                        textureLoader.load(
                            `textures/${relativePath}`,
                            (texture) => {
                                material.map = texture;
                                material.needsUpdate = true;
                                console.log(`${key}的纹理使用相对路径加载成功`);
                            },
                            undefined,
                            (secondError) => {
                                console.error(`使用相对路径加载${key}的纹理仍然失败:`, secondError);
                            }
                        );
                    }
                }
            );
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
        
        // 设置行星的轴倾角
        if (key === 'uranus') {
            // 天王星的轴倾角接近90度
            planet.rotation.z = planetData.axialTilt ? (planetData.axialTilt * Math.PI / 180) : (97.77 * Math.PI / 180);
        } else if (key === 'venus' || key === 'uranus') {
            // 金星和天王星是逆向自转的行星
            planet.rotation.y = Math.PI; // 初始旋转180度
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
        
        // 获取行星名称
        const planetKey = this.getPlanetKeyByDistance(distance);
        
        // 创建椭圆轨道
        if (planetKey) {
            // 使用astronomy.js中的轨道参数创建椭圆轨道
            const segments = 128;
            const points = [];
            
            // 从astronomy.js获取轨道参数
            const orbitalElements = {
                mercury: { a: 0.38709927, e: 0.20563593, i: 7.00497902 },
                venus: { a: 0.72333566, e: 0.00677672, i: 3.39467605 },
                earth: { a: 1.00000261, e: 0.01671123, i: 0.00001531 },
                mars: { a: 1.52371034, e: 0.09339410, i: 1.84969142 },
                jupiter: { a: 5.20288700, e: 0.04838624, i: 1.30439695 },
                saturn: { a: 9.53667594, e: 0.05386179, i: 2.48599187 },
                uranus: { a: 19.18916464, e: 0.04725744, i: 0.77263783 },
                neptune: { a: 30.06992276, e: 0.00859048, i: 1.77004347 }
            };
            
            const orbitalElement = orbitalElements[planetKey];
            
            if (orbitalElement) {
                // 椭圆参数
                const a = orbitalElement.a; // 半长轴
                const e = orbitalElement.e; // 偏心率
                const inclination = orbitalElement.i; // 轨道倾角
                
                // 计算椭圆的半短轴
                const b = a * Math.sqrt(1 - e * e);
                
                // 缩放因子，与createOrbit中的缩放保持一致
                const scaleFactor = distance < 2 ? 
                    minOrbitRadius + distance * 12 : 
                    minOrbitRadius + 24 + Math.pow(distance - 2, 0.4) * 8;
                
                const scaledA = (a / orbitalElement.a) * scaleFactor;
                const scaledB = (b / orbitalElement.a) * scaleFactor;
                
                // 创建椭圆轨道点
                for (let i = 0; i <= segments; i++) {
                    const theta = (i / segments) * Math.PI * 2;
                    const xOrbit = scaledA * Math.cos(theta);
                    const zOrbit = scaledB * Math.sin(theta);
                    
                    // 考虑轨道倾角，将轨道平面上的坐标转换到世界坐标系
                    // 这与updatePlanetPositions中的计算方式保持一致
                    const inclinationRad = (inclination * Math.PI) / 180;
                    const x = xOrbit;
                    const y = zOrbit * Math.sin(inclinationRad);
                    const z = zOrbit * Math.cos(inclinationRad);
                    
                    points.push(new THREE.Vector3(x, y, z));
                }
                
                // 创建曲线和管道几何体
                const curve = new THREE.CatmullRomCurve3(points);
                const geometry = new THREE.TubeGeometry(curve, segments, 0.075, 8, true);
                
                const material = new THREE.MeshBasicMaterial({ 
                    color: 0x888888,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.6
                });
                
                const orbit = new THREE.Mesh(geometry, material);
                
                // 创建一个组来包含轨道
                const orbitGroup = new THREE.Group();
                orbitGroup.add(orbit);
                
                // 添加到场景
                this.scene.add(orbitGroup);
                
                // 注意：不再需要旋转轨道组，因为我们已经在创建轨道点时考虑了轨道倾角
                
                return { 
                    mesh: orbitGroup, 
                    radius: scaleFactor, // 使用缩放后的半长轴作为参考半径
                    inclination: inclination,
                    a: scaledA, // 保存缩放后的半长轴
                    b: scaledB, // 保存缩放后的半短轴
                    e: e // 保存偏心率
                };
            }
        }
        
        // 如果没有找到行星或轨道参数，创建圆形轨道作为后备
        // 使用点集和曲线创建轨道，与椭圆轨道处理方式保持一致
        const segments = 128;
        const points = [];
        
        // 创建圆形轨道点
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const x = orbitRadius * Math.cos(theta);
            const z = orbitRadius * Math.sin(theta);
            // 默认在XZ平面上
            points.push(new THREE.Vector3(x, 0, z));
        }
        
        // 创建曲线和管道几何体
        const curve = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.TubeGeometry(curve, segments, 0.075, 8, true);
        
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x888888,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6
        });
        
        const orbit = new THREE.Mesh(geometry, material);
        
        // 创建一个组来包含轨道
        const orbitGroup = new THREE.Group();
        orbitGroup.add(orbit);
        
        // 添加到场景
        this.scene.add(orbitGroup);
        
        return { mesh: orbitGroup, radius: orbitRadius, inclination: 0 };
    }
    
    // 更新行星位置
    updatePlanetPositions(time) {
        try {
            for (const [key, planet] of Object.entries(this.planets)) {
                // 如果是太阳，只更新自转
                if (key === 'sun') {
                    const sunData = planet.userData.data;
                    // 使用太阳的自转周期数据计算自转速度
                    const rotationSpeed = sunData.rotationPeriod !== 0 ? 
                        (1 / Math.abs(sunData.rotationPeriod)) * 0.05 * 3.0 : 0; // 使用与行星相同的速度系数
                    
                    // 更新太阳自转 - 确保旋转方向正确
                    planet.rotation.y += rotationSpeed * (sunData.rotationPeriod >= 0 ? 1 : -1);
                    continue;
                }
            
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
            
            // 检查是否有椭圆轨道参数
            if (orbitInfo.a && orbitInfo.b) {
                // 使用椭圆方程计算行星位置
                const a = orbitInfo.a;
                const b = orbitInfo.b;
                
                // 计算行星在椭圆轨道上的位置
                const xOrbit = a * Math.cos(angle);
                const zOrbit = b * Math.sin(angle);
                
                // 考虑轨道倾角，将轨道平面上的坐标转换到世界坐标系
                if (orbitInfo.inclination) {
                    // 将角度转换为弧度
                    const inclinationRad = (orbitInfo.inclination * Math.PI) / 180;
                    
                    // 计算考虑轨道倾角后的坐标
                    const x = xOrbit;
                    const y = zOrbit * Math.sin(inclinationRad);
                    const z = zOrbit * Math.cos(inclinationRad);
                    
                    // 更新行星位置
                    planet.position.set(x, y, z);
                } else {
                    // 如果没有轨道倾角数据，使用原来的方法
                    planet.position.set(xOrbit, 0, zOrbit);
                }
            } else {
                // 如果没有椭圆轨道参数，使用圆形轨道
                const xOrbit = Math.cos(angle) * orbitInfo.radius;
                const zOrbit = Math.sin(angle) * orbitInfo.radius;
                
                // 考虑轨道倾角，将轨道平面上的坐标转换到世界坐标系
                if (orbitInfo.inclination) {
                    // 将角度转换为弧度
                    const inclinationRad = (orbitInfo.inclination * Math.PI) / 180;
                    
                    // 计算考虑轨道倾角后的坐标
                    const x = xOrbit;
                    const y = zOrbit * Math.sin(inclinationRad);
                    const z = zOrbit * Math.cos(inclinationRad);
                    
                    // 更新行星位置
                    planet.position.set(x, y, z);
                } else {
                    // 如果没有轨道倾角数据，使用原来的方法
                    planet.position.set(xOrbit, 0, zOrbit);
                }
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
        } catch (error) {
            console.error('更新行星位置时发生错误:', error);
            // 即使出错也继续执行，防止整个应用崩溃
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
        
        // 添加错误处理，防止纹理加载失败导致黑屏
        textureLoader.crossOrigin = 'anonymous';
        
        // 添加加载管理器
        const loadingManager = new THREE.LoadingManager();
        loadingManager.onError = function(url) {
            console.error('加载纹理失败:', url);
            // 使用相对路径重试
            if (url.startsWith('http')) {
                const relativePath = url.split('/').pop();
                console.log('尝试使用相对路径加载:', relativePath);
                return 'textures/' + relativePath;
            }
        };
        textureLoader.manager = loadingManager;
        
        let material;
        if (planetKey === 'sun') {
            // 预先创建基础材质，确保即使纹理加载失败也能显示
            material = new THREE.MeshBasicMaterial({ color: planetData.color });
            
            // 尝试加载纹理
            textureLoader.load(
                planetData.texture,
                // 成功回调
                (texture) => {
                    material.map = texture;
                    material.needsUpdate = true;
                },
                // 进度回调
                undefined,
                // 错误回调
                (error) => {
                    console.error(`无法加载${planetKey}的纹理:`, error);
                }
            );
        } else {
            // 预先创建基础材质，确保即使纹理加载失败也能显示
            material = new THREE.MeshStandardMaterial({ 
                color: planetData.color,
                roughness: 0.7,
                metalness: 0.3
            });
            
            // 尝试加载纹理
            textureLoader.load(
                planetData.texture,
                // 成功回调
                (texture) => {
                    material.map = texture;
                    material.needsUpdate = true;
                },
                // 进度回调
                undefined,
                // 错误回调
                (error) => {
                    console.error(`无法加载${planetKey}的纹理:`, error);
                }
            );
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
        
        try {
            // 更新行星位置
            this.updatePlanetPositions(performance.now());
            
            // 更新控制器
            this.controls.update();
            
            // 渲染场景
            this.renderer.render(this.scene, this.camera);
        } catch (error) {
            console.error('动画循环中发生错误:', error);
            // 即使出错也继续请求下一帧，防止整个应用崩溃
            requestAnimationFrame(this.animate.bind(this));
        }
    }
}

// 当页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 创建太阳系应用实例
    const app = new SolarSystemApp();
});