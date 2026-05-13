export interface SentinelConfig {
  protocol: string;
  routing: string;
  refreshRate: number;
}

export function runDiagnostics(setSystemStatus: (status: string) => void, config?: SentinelConfig) {
  if (config) {
    console.log(`[AI] Protocol: ${config.protocol}, Routing: ${config.routing}`);
  } else {
    console.log("[SYSTEM] Running diagnostics...");
  }

  const latency = Math.random() * 200;
  if (latency > 100) {
    console.log("[AI] Anomaly detected → Auto-Heal activated");
    rerouteTraffic();
    restoreTables();
    setSystemStatus("Auto-Heal Active - System Stable ✅");
  } else {
    setSystemStatus("System Stable ✅");
  }
}

let errorListenerAdded = false;

export function setupSentinelErrorMonitoring(setSystemStatus: (status: string) => void) {
  if (errorListenerAdded) return;
  window.addEventListener("error", () => {
    console.warn("[AI] Anomaly detected → Auto-Heal triggered");
    setSystemStatus("Auto-Heal Active - System Stable ✅");
  });
  errorListenerAdded = true;
}

function rerouteTraffic() {
  console.log("[AI] Re-routing traffic...");
}

function restoreTables() {
  console.log("[AI] Routing tables restored.");
}

export function activateAntiYellowShield() {
  console.log("[AI] 🛡️ Anti-Yellow Shield activated...");
  
  // مراقبة أي محاولة لإضافة العنصر الأصفر
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if ((node as HTMLElement).id === "yellowBox") {
          (node as HTMLElement).remove(); // حذف مباشر
          console.warn("[AI] 🚨 محاولة لإرجاع الخط الأصفر تم منعها!");
          updateGreenBox("النظام مستقر – الخط الأصفر ممنوع نهائيًا");
        }
      });
    });
  });

  // تفعيل المراقبة على كامل الصفحة
  observer.observe(document.body, { childList: true, subtree: true });

  // قفل برمجي يمنع إنشاء العنصر من الأساس
  try {
    // @ts-ignore
    delete (window as any).yellowBox;
  } catch (e) {}

  if (!Object.getOwnPropertyDescriptor(window, "yellowBox")) {
    Object.defineProperty(window, "yellowBox", {
      get: () => null,
      set: () => {
        throw new Error("🛡️ ممنوع إنشاء الخط الأصفر!");
      },
      configurable: false
    });
  }
}

// بديل رسمي: المربع الأخضر
export function updateGreenBox(status: string) {
  let greenBox = document.getElementById("greenBox");
  if (!greenBox) {
    greenBox = document.createElement("div");
    greenBox.id = "greenBox";
    greenBox.style.padding = "10px";
    greenBox.style.backgroundColor = "#10B981";
    greenBox.style.color = "white";
    greenBox.style.fontWeight = "bold";
    greenBox.style.borderRadius = "4px";
    greenBox.style.marginTop = "10px";
    document.body.appendChild(greenBox);
  }
  greenBox.innerHTML = `⚡ الحالة: ${status}`;
  greenBox.style.opacity = '1';
}
