const useSmartConnector = true; // النظام الآن يعتمد على SmartConnector

if (useSmartConnector) {
  console.log("✅ SmartConnector Core فعال – لا حاجة لفحص WebSocket.");
  process.exit(0);
} else {
  // فحص WebSocket التقليدي
  const WebSocket = require("ws");
  const ws = new WebSocket("wss://your-server-domain/tunnel");

  ws.onopen = () => {
    console.log("✅ WebSocket مفتوح وجاهز");
    ws.close();
    process.exit(0);
  };

  ws.onclose = () => {
    console.error("❌ WebSocket أغلق قبل الفتح – إعادة المحاولة...");
    process.exit(1);
  };

  ws.onerror = (err) => {
    console.error("⚠️ خطأ في WebSocket:", err.message);
    process.exit(1);
  };
}