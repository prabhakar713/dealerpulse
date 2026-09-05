export const THEME_STORAGE_KEY = "dp-theme";

export const THEME_BOOTSTRAP = `(function(){try{var k="${THEME_STORAGE_KEY}";var s=localStorage.getItem(k);var sys=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";var t=s==="light"||s==="dark"?s:sys;document.documentElement.setAttribute("data-theme",t);document.documentElement.style.colorScheme=t;}catch(e){}})();`;
