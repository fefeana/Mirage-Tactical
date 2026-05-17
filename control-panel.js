// control-panel.js

let ws;
const proxies = [
  "wss://cloud.albarq.ai/socket",
  "wss://backup.albarq.ai/socket",
  "wss://reports.albarq.ai/socket"
];
let current = 0;

function connectServer() {
  const url = proxies[current];
  try {
    ws = new WebSocket(url);

    ws.onopen = () => {
      const status = document.getElementById("network-status");
      if (status) {
        status.innerText = "🌐 Connected via " + url;

        // وميض متكرر عند نجاح الاتصال
        status.classList.add("glow");
        setTimeout(() => status.classList.remove("glow"), 1500);
      }

      // تغيير خلفية الزر لإظهار التحول
      const btn = document.getElementById("btn-connect");
      if (btn) {
        btn.classList.add("switch");
        setTimeout(() => btn.classList.remove("switch"), 1500);
      }
    };

    ws.onclose = () => {
      current = (current + 1) % proxies.length;
      setTimeout(connectServer, 2000);
    };

    ws.onerror = () => ws.close();
  } catch (e) {
    // محاكاة وضع الاستوديو
    setTimeout(() => {
        const status = document.getElementById("network-status");
        if (status) {
            status.innerText = "🌐 Connected via " + url + " (Simulated)";
            status.classList.add("glow");
            setTimeout(() => status.classList.remove("glow"), 1500);
        }
        const btn = document.getElementById("btn-connect");
        if (btn) {
            btn.classList.add("switch");
            setTimeout(() => btn.classList.remove("switch"), 1500);
        }
    }, 500);
  }
}

function injectControlPanel() {
  if (document.querySelector(".control-panel")) return;

  const panel = document.createElement("div");
  panel.className = "control-panel";
  panel.style.marginTop = "15px";
  panel.style.padding = "10px";
  panel.style.background = "rgba(0,0,0,0.2)";
  panel.style.borderRadius = "8px";

  const btnConnect = document.createElement("button");
  btnConnect.textContent = "⚡ Connect";
  btnConnect.id = "btn-connect";
  btnConnect.onclick = connectServer;
  panel.appendChild(btnConnect);

  const status = document.createElement("div");
  status.id = "network-status";
  status.textContent = "🚫 Not Connected";
  status.style.marginTop = "10px";
  status.style.fontWeight = "bold";
  panel.appendChild(status);

  (document.getElementById("dashboard") || document.body).appendChild(panel);
}

window.addEventListener("load", injectControlPanel);

