export const enableDevToolsWarning = () => {
  let opened = false;

  const checkDevTools = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;

    if ((widthThreshold || heightThreshold) && !opened) {
      opened = true;

      console.log(
        "%c⚠️ Developer Tools Opened!",
        "color: red; font-size: 32px; font-weight: bold;"
      );

      console.log(
        "%cSensitive operations are protected and monitored.",
        "color: yellow; font-size: 18px;"
      );
    }
  };

  window.addEventListener("resize", checkDevTools);
  setInterval(checkDevTools, 500);
};
