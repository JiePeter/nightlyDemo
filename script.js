document.addEventListener("DOMContentLoaded", () => {
  // 主题切换功能
  const themeToggle = document.querySelector(".theme-toggle");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  const nightScene = document.querySelector(".night-scene");
  const nightSvg = document.querySelector(".night-scene svg");
  const dayScene = document.querySelector(".day-scene");
  const daySvg = document.querySelector(".day-scene svg");
  const dayPattern = document.querySelector("#dayPattern");
  const poemContainer = document.querySelector(".poem-container");
  
  // 白天背景持续移动的动画
  let dayAnimationFrame;
  let dayPatternPosition = 0;

  // 初始化主题（根据系统偏好）
  if (localStorage.getItem("theme")) {
    document.body.dataset.theme = localStorage.getItem("theme");
  } else if (prefersDarkScheme.matches) {
    document.body.dataset.theme = "dark";
  } else {
    document.body.dataset.theme = "light";
  }

  // 监听系统主题变化
  prefersDarkScheme.addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      // 只有用户没有手动设置主题时才跟随系统
      document.body.dataset.theme = e.matches ? "dark" : "light";
      
      // 切换主题时启动或停止背景持续移动
      updateBackgroundAnimation();
    }
  });

  // 主题切换事件
  themeToggle.addEventListener("click", toggleTheme);
  themeToggle.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleTheme();
    }
  });

  function toggleTheme() {
    const currentTheme = document.body.dataset.theme || "dark";
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.body.dataset.theme = newTheme;
    localStorage.setItem("theme", newTheme);

    // 添加切换动画
    document.body.classList.add("theme-transition");
    setTimeout(() => {
      document.body.classList.remove("theme-transition");
    }, 1200); // 与CSS中的过渡时间匹配
    
    // 切换主题时启动或停止背景持续移动
    updateBackgroundAnimation();
  }
  
  // 白天背景持续移动动画
  function animateDayBackground() {
    if (document.body.dataset.theme !== "light") return;
    
    dayPatternPosition -= 0.03;
    // 保持位置在合理范围内，避免数值过大
    if (dayPatternPosition <= -100) {
      dayPatternPosition = 0;
    }
    
    if (dayPattern) {
      dayPattern.setAttribute("x", `${dayPatternPosition}%`);
      dayPattern.setAttribute("y", `${dayPatternPosition * 0.5}%`);
    }
    
    dayAnimationFrame = requestAnimationFrame(animateDayBackground);
  }
  
  // 根据当前主题更新背景动画
  function updateBackgroundAnimation() {
    if (dayAnimationFrame) {
      cancelAnimationFrame(dayAnimationFrame);
      dayAnimationFrame = null;
    }
    
    if (document.body.dataset.theme === "light") {
      dayAnimationFrame = requestAnimationFrame(animateDayBackground);
    }
  }

  // 视差滚动效果
  // 仅在用户未设置减少动效时启用视差
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousemove", handleMouseMove);
    
    // 启动白天背景持续移动
    updateBackgroundAnimation();
  }

  function handleScroll() {
    const scrollPosition = window.scrollY;
    // 判断当前主题
    const isLightTheme = document.body.dataset.theme === "light";

    // 夜间模式的视差滚动效果
    if (!isLightTheme && nightSvg) {
      // 夜间模式 - 垂直位移和轻微缩放
      const scale = 1 + scrollPosition * 0.0005;
      const translateY = scrollPosition * 0.0075; // 减小位移量，更自然
      nightSvg.style.transform = `translateY(${translateY}px) scale(${scale})`;
    }
  }

  function handleMouseMove(e) {
    if (window.innerWidth <= 768) return; // 仅在大屏幕上应用

    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    // 计算移动距离 - 轻微效果
    const moveX = mouseX * -10;
    const moveY = mouseY * -10;

    // 判断当前主题
    const isLightTheme = document.body.dataset.theme === "light";

    // 应用鼠标跟随效果，只应用于夜间模式
    if (!isLightTheme && nightSvg) {
      // 夜间模式 - 配合滚动效果的鼠标跟随
      const currentTransform = nightSvg.style.transform || "";
      const hasScaleAndTranslate = currentTransform.includes("scale");

      if (hasScaleAndTranslate) {
        // 提取当前的translateY和scale值
        const translateMatch = currentTransform.match(/translateY\((.*?)px\)/);
        const scaleMatch = currentTransform.match(/scale\((.*?)\)/);

        if (translateMatch && scaleMatch) {
          const translateY = translateMatch[1];
          const scale = scaleMatch[1];
          // 减小鼠标影响，使动效更加细腻
          nightSvg.style.transform = `translateY(${translateY}px) scale(${scale}) translate(${
            moveX * 0.3
          }px, ${moveY * 0.3}px)`;
        }
      } else {
        nightSvg.style.transform = `translate(${moveX * 0.3}px, ${
          moveY * 0.3
        }px)`;
      }
    }
  }

  // 初始化页面时应用一次视差效果
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    handleScroll();
  }

  // 页面加载优化
  window.addEventListener("load", () => {
    document.body.classList.add("loaded");
  });
});
