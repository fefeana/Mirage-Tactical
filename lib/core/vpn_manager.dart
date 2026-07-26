import 'dart:async';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:grpc/grpc.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

/// مدير VPN الرئيسي في تطبيق ميراج
/// يتعامل مع الاتصال بالخادم، إدارة المفاتيح المؤقتة، وحالة الشبكة
class MirageVpnManager {
  // ============================================================
  // 1. القنوات والمراجع
  // ============================================================
  static const MethodChannel _platform = MethodChannel('com.mirage.vpn');
  
  late ClientChannel _grpcChannel;
  String? _currentSessionId;
  String? _currentTempKey;
  String? _currentRegion;
  Timer? _keyRefreshTimer;
  final Connectivity _connectivity = Connectivity();

  // ============================================================
  // 2. الحالة العامة
  // ============================================================
  bool get isConnected => _currentSessionId != null;
  String? get currentRegion => _currentRegion;
  String? get sessionId => _currentSessionId;

  // ============================================================
  // 3. التهيئة
  // ============================================================
  Future<void> init() async {
    // مراقبة حالة الشبكة
    _connectivity.onConnectivityChanged.listen((List<ConnectivityResult> results) {
      _handleNetworkChange(results.first);
    });
    
    // قراءة البوابة الافتراضية من الإعدادات
    final gateway = await _getConfig('mcp_gateway_default') ?? 'mcp-riyadh.mirage-vpn.com';
    _grpcChannel = ClientChannel(
      gateway,
      port: 443,
      options: const ChannelOptions(
        credentials: ChannelCredentials.secure(),
        codec: GzipCodec(),
      ),
    );
    print('✅ VpnManager: جاهز للاتصال بـ $gateway');
  }

  // ============================================================
  // 4. الاتصال بالخادم وطلب مفتاح مؤقت
  // ============================================================
  Future<Map<String, dynamic>> connect({String? region}) async {
    try {
      // أ. تحديد المنطقة (أو استخدام الافتراضية)
      final targetRegion = region ?? await _getConfig('default_region') ?? 'riyadh';
      
      // ب. جلب معرف الجهاز
      final prefs = await SharedPreferences.getInstance();
      String deviceId = prefs.getString('device_id') ?? 
          'mirage_${DateTime.now().millisecondsSinceEpoch}';
      await prefs.setString('device_id', deviceId);

      // ج. طلب مفتاح مؤقت من الخادم (محاكاة إلى حين ربط الـ proto)
      //    في الواقع، هنا يتم استدعاء gRPC الحقيقي
      _currentSessionId = 'session_${DateTime.now().millisecondsSinceEpoch}';
      _currentTempKey = 'temp_${_currentSessionId!.substring(0, 8)}';
      _currentRegion = targetRegion;

      // د. تفعيل الـ VPN عبر الـ Native (Android)
      final nativeResult = await _platform.invokeMethod('connectVpn', {
        'server': targetRegion,
        'sessionId': _currentSessionId,
        'tempKey': _currentTempKey,
      });

      // هـ. بدء مؤقت لتجديد المفتاح قبل انتهاء صلاحيته
      _startKeyRefreshTimer();

      return {
        'status': 'success',
        'session_id': _currentSessionId,
        'temp_key': _currentTempKey,
        'region': targetRegion,
        'expiry': DateTime.now().add(const Duration(minutes: 5)).toIso8601String(),
        'native_status': nativeResult,
      };
    } catch (e) {
      return {'status': 'error', 'message': 'فشل الاتصال: $e'};
    }
  }

  // ============================================================
  // 5. قطع الاتصال وإلغاء المفتاح
  // ============================================================
  Future<void> disconnect() async {
    try {
      // إلغاء المؤقت
      _keyRefreshTimer?.cancel();
      
      // إلغاء المفتاح عبر الخادم (طلب gRPC)
      // إيقاف خدمة VPN عبر MethodChannel
      await _platform.invokeMethod('disconnectVpn');
      
      _currentSessionId = null;
      _currentTempKey = null;
      _currentRegion = null;
      print('❌ VpnManager: تم قطع الاتصال وإتلاف المفتاح.');
    } catch (e) {
      print('⚠️ VpnManager: خطأ أثناء قطع الاتصال: $e');
    }
  }

  // ============================================================
  // 6. تجديد المفتاح المؤقت (خلفية)
  // ============================================================
  void _startKeyRefreshTimer() {
    _keyRefreshTimer?.cancel();
    _keyRefreshTimer = Timer.periodic(
      const Duration(minutes: 4), // قبل دقيقة من انتهاء الصلاحية
      (timer) async {
        if (isConnected) {
          print('🔄 VpnManager: تجديد المفتاح المؤقت...');
          // هنا يتم طلب مفتاح جديد من الخادم
          // وتحديثه في الـ Native عبر MethodChannel
        }
      },
    );
  }

  // ============================================================
  // 7. معالجة تغيير الشبكة (الكابلات البديلة)
  // ============================================================
  Future<void> _handleNetworkChange(ConnectivityResult result) async {
    if (result == ConnectivityResult.none) {
      print('🌍 VpnManager: انقطاع النت - تفعيل الكابل البحري/الساتل');
      // تفعيل وضع الطوارئ (Satellite/Submarine)
      await _platform.invokeMethod('activateFallbackMode');
    } else if (isConnected) {
      print('🌍 VpnManager: عودة النت - استعادة الاتصال الطبيعي');
      // إعادة الاتصال بالخادم الأساسي
      await _platform.invokeMethod('deactivateFallbackMode');
    }
  }

  // ============================================================
  // 8. قراءة الإعدادات من remote_config_defaults.xml
  // ============================================================
  Future<String?> _getConfig(String key) async {
    try {
      final String value = await _platform.invokeMethod('getConfig', {'key': key});
      return value;
    } catch (e) {
      print('⚠️ VpnManager: فشل قراءة الإعداد $key - $e');
      return null;
    }
  }
}
