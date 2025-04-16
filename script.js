document.addEventListener("DOMContentLoaded", () => {
  // DOM元素引用
  const themeSvg = document.querySelector(".theme-svg");
  const dayPattern = document.querySelector(".bg-rect");
  const poemContent = document.querySelector("#poem-content");
  const poemContainer = document.querySelector(".poem-container");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const swipeHint = document.querySelector(".swipe-hint");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  
  // 检测设备类型
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Locomotive Scroll实例
  let locomotiveScroll = null;
  
  // 初始化主题（根据系统偏好）
  function initTheme() {
    if (localStorage.getItem("theme")) {
      document.body.dataset.theme = localStorage.getItem("theme");
    } else if (prefersDarkScheme.matches) {
      document.body.dataset.theme = "dark";
    } else {
      document.body.dataset.theme = "light";
    }
  }
  
  // 主题切换函数
  function toggleTheme() {
    const currentTheme = document.body.dataset.theme || "dark";
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.body.dataset.theme = newTheme;
    localStorage.setItem("theme", newTheme);

    // 添加切换动画
    document.body.classList.add("theme-transition");
    setTimeout(() => {
      document.body.classList.remove("theme-transition");
    }, 1200);
    
    // 根据主题更新动画
    updateAnimations();
  }
  
  // 初始化诗句淡入淡出效果
  function initAnimationEffects() {
    if (poemContent) {
      // 监听诗句的交互，添加hover与淡入效果
      gsap.utils.toArray('.stanza').forEach((stanza, i) => {
        // 为每个stanza添加交互效果
        stanza.addEventListener('mouseenter', () => {
          gsap.to(stanza, { 
            y: -5, 
            duration: 0.3, 
            ease: "power1.out"
          });
        });
        
        stanza.addEventListener('mouseleave', () => {
          gsap.to(stanza, { 
            y: 0, 
            duration: 0.3, 
            ease: "power1.out"
          });
        });
      });
    }
  }
  
  // 初始化GSAP动画
  function initGSAPAnimations() {
    // 首次加载动画
    if (prefersReducedMotion.matches) return;
    
    // 使用GSAP为诗句添加淡入动画
    gsap.from(".stanza", {
      opacity: 0,
      y: 20,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out"
    });
    
    // 主题切换按钮出现动画（仅桌面端）
    if (!isMobile && themeToggleBtn) {
      gsap.from(".theme-toggle", {
        opacity: 0,
        y: -20,
        duration: 0.5,
        delay: 0.5,
        ease: "back.out(1.7)"
      });
    }
  }
  
  // 根据当前主题更新动画效果
  function updateAnimations() {
    // 添加背景流动效果
    if (themeSvg) {
      // 应用轻微的波浪效果
      gsap.to(themeSvg, {
        duration: 10,
        ease: "sine.inOut",
        y: 5,
        x: 3,
        repeat: -1,
        yoyo: true
      });
    }
  }
  
  // 创建视差滚动效果 - 基于滚动位置
  function initParallaxEffects() {
    if (prefersReducedMotion.matches) return;
    
    // 不再使用常规滚动视差，改为使用基于绝对滚动位置的效果
    if (!isMobile && typeof LocomotiveScroll !== 'undefined') {
      // 初始化Locomotive Scroll (仅桌面端)
      locomotiveScroll = new LocomotiveScroll({
        el: document.querySelector('[data-scroll-container]'),
        smooth: true,
        smartphone: { smooth: false },
        tablet: { smooth: false }
      });
      
      // 监听滚动事件
      locomotiveScroll.on('scroll', (obj) => {
        // 获取滚动位置
        const scrollPosition = obj.scroll.y;
        
        // 更新SVG图层位置 - 基于绝对滚动位置
        if (themeSvg) {
          // 根据滚动位置计算每个图层的变换
          document.querySelectorAll(".layer-1, .layer-2, .layer-3, .layer-4, .layer-5, .layer-6, .layer-7").forEach((layer, index) => {
            const layerDepth = (index + 1) * 0.03; // 不同图层有不同的视差深度
            const translateY = scrollPosition * layerDepth;
            
            // 直接设置transform属性，避免使用GSAP以获得更精确的位置控制
            layer.style.transform = `translateY(${translateY}px)`;
          });
        }
      });
      
      // 重新计算以确保平滑滚动正常工作
      window.addEventListener('resize', () => {
        if (locomotiveScroll) {
          locomotiveScroll.update();
        }
      });
    } else {
      // 移动端使用原生滚动
      window.addEventListener("scroll", () => {
        const scrollPosition = window.scrollY;
        
        // 更新背景视差效果 - 基于滚动位置而非滚动距离
        if (themeSvg) {
          document.querySelectorAll(".layer-1, .layer-2, .layer-3, .layer-4, .layer-5, .layer-6, .layer-7").forEach((layer, index) => {
            const layerDepth = (index + 1) * 0.03;
            const translateY = scrollPosition * layerDepth;
            
            // 直接设置transform属性
            layer.style.transform = `translateY(${translateY}px)`;
          });
        }
      });
    }
    
    // 鼠标移动视差效果 (仅桌面)
    if (!isMobile && window.innerWidth > 768) {
      document.addEventListener("mousemove", (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        if (themeSvg) {
          // 仅水平方向移动背景，避免与滚动效果冲突
          gsap.to(themeSvg, {
            x: (mouseX - 0.5) * -5,
            duration: 0.6,
            ease: "power1.out"
          });
        }
      });
    }
  }
  
  // 初始化手势和交互控制
  function initInteractions() {
    // 为桌面端添加主题切换按钮点击事件
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        // 添加按钮点击动画
        gsap.to(themeToggleBtn, {
          scale: 0.9,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          onComplete: toggleTheme
        });
      });
    }
    
    // 移动端手势交互 - 仅在移动设备上启用
    if (isMobile) {
      // 原生触摸事件实现手势识别
      let touchStartX = 0;
      let touchEndX = 0;
      
      // 触摸开始时记录位置
      document.body.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      
      // 触摸结束时计算滑动距离并触发相应行为
      document.body.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleGesture();
      }, { passive: true });
      
      // 处理手势
      function handleGesture() {
        // 设置最小滑动距离阈值
        const minSwipeDistance = 50;
        const swipeDistance = touchEndX - touchStartX;
        
        // 判断滑动方向和距离
        if (swipeDistance > minSwipeDistance) {
          // 向右滑动 - 切换到深色模式
          if (document.body.dataset.theme === "light") {
            toggleTheme();
          }
        } else if (swipeDistance < -minSwipeDistance) {
          // 向左滑动 - 切换到浅色模式
          if (document.body.dataset.theme === "dark") {
            toggleTheme();
          }
        }
      }
    }
    
    // 桌面端的键盘快捷键
    if (!isMobile) {
      document.addEventListener('keydown', (e) => {
        // 使用左右箭头切换主题
        if (e.key === 'ArrowLeft') {
          if (document.body.dataset.theme === "dark") {
            toggleTheme();
          }
        } else if (e.key === 'ArrowRight') {
          if (document.body.dataset.theme === "light") {
            toggleTheme();
          }
        }
      });
    }
  }
  
  // 初始化Alpine.js数据
  function initAlpineData() {
    // 这里使用Alpine.js来简化相应的DOM操作
    // Alpine通过x-data属性自动挂载数据和方法
    document.addEventListener('alpine:init', () => {
      Alpine.data('themeController', () => ({
        theme: localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light'),
        toggle() {
          toggleTheme();
          this.theme = document.body.dataset.theme;
        }
      }));
    });
  }
  
  // 监听系统主题变化
  function listenForSystemThemeChanges() {
    prefersDarkScheme.addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        document.body.dataset.theme = e.matches ? "dark" : "light";
        updateAnimations();
      }
    });
  }
  
  // 初始化所有功能
  function init() {
    initTheme();
    initAnimationEffects();
    initGSAPAnimations();
    initParallaxEffects();
    initInteractions(); // 修改为更通用的交互初始化函数
    initAlpineData();
    listenForSystemThemeChanges();
    updateAnimations();
    
    // 页面加载完成标记
    window.addEventListener("load", () => {
      document.body.classList.add("loaded");
    });
  }
  
  // 启动应用
  init();
});
