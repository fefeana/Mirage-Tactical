import 'dart:async';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:grpc/grpc.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:universal_platform/universal_platform.dart';
import '../models/vpn_model.dart';
import '../models/server_model.dart';
import '../network/submarine_cables.dart';
import '../network/terrestrial_cables.dart';
import '../network/satellite/manager.dart';

class VpnManager {
  static const MethodChannel _platform = MethodChannel('com.mirage.vpn');
  
  late ClientChannel _grpcChannel;
  String? _currentSessionId;
  String? _currentTempKey;
  String? _currentRegion;
  Timer? _keyRefreshTimer;
  Timer? _connectivityMonitor;
  final Connectivity _connectivity = Connectivity();

  List<ServerModel> _servers = [];
  VpnStatus _status = VpnStatus.disconnected;

  bool get isConnected => _currentSessionId != null;
  String? get currentRegion => _currentRegion;
  VpnStatus get status => _status;
  bool get isAndroid => UniversalPlatform.isAndroid;
  bool get isWeb => UniversalPlatform.isWeb;

  // ============================================================
  // 1. التهيئة
  // ============================================================
  Future<void> init() async {
    await _loadServers();
    
    _connectivity.onConnectivityChanged.listen((List<ConnectivityResult> results) {
      _handleNetworkChange(results.first);
    });

    final gateway = await _getOptimalGateway();
    _grpcChannel = ClientChannel(
      gateway,
      port: 443,
      options: const ChannelOptions(
        credentials: ChannelCredentials.secure(),
        codec: GzipCodec(),
      ),
    );
    print('✅ VpnManager: جاهز للاتصال بـ $gateway');
    
    _startConnectivityMonitor();
    _status = VpnStatus.initialized;
  }

  // ============================================================
  // 2. الاتصال بالخادم
  // ============================================================
  Future<Map<String, dynamic>> connect({String? region, String? serverId}) async {
    try {
      final targetRegion = region ?? await _getConfig('default_region') ?? 'riyadh';
      
      final prefs = await SharedPreferences.getInstance();
      String deviceId = prefs.getString('device_id') ?? 
          'mirage_${DateTime.now().millisecondsSinceEpoch}';
      await prefs.setString('device_id', deviceId);

      _currentSessionId = 'session_${DateTime.now().millisecondsSinceEpoch}';
      _currentTempKey = 'temp_${_currentSessionId!.substring(0, 8)}';
      _currentRegion = targetRegion;
      _status = VpnStatus.connecting;

      // ✅ إذا كان أندرويد، نستخدم MethodChannel
      if (isAndroid) {
        await _platform.invokeMethod('connectVpn', {
          'server': targetRegion,
          'sessionId': _currentSessionId,
          'tempKey': _currentTempKey,
          'serverId': serverId ?? _servers.firstOrNull?.id ?? 'auto',
        });
      } 
      // ✅ إذا كان ويب، نستخدم gRPC مباشرة
      else if (isWeb) {
        await _connectViaGrpc(targetRegion, _currentSessionId!, _currentTempKey!);
      }

      _startKeyRefreshTimer();
      _status = VpnStatus.connected;

      return {
        'status': 'success',
        'session_id': _currentSessionId,
        'temp_key': _currentTempKey,
        'region': targetRegion,
        'platform': isAndroid ? 'android' : 'web',
        'expiry': DateTime.now().add(const Duration(minutes: 5)).toIso8601String(),
      };
    } catch (e) {
      _status = VpnStatus.error;
      return {'status': 'error', 'message': 'فشل الاتصال: $e'};
    }
  }

  /// الاتصال عبر gRPC (للويب)
  Future<void> _connectViaGrpc(String region, String sessionId, String tempKey) async {
    // هنا يتم استدعاء gRPC للويب
    print('🌐 [Web] جاري الاتصال عبر gRPC بـ $region');
    // محاكاة: سيتم استبدالها بالاتصال الحقيقي
    await Future.delayed(const Duration(seconds: 1));
  }

  // ============================================================
  // 3. قطع الاتصال
  // ============================================================
  Future<void> disconnect() async {
    try {
      _keyRefreshTimer?.cancel();
      
      if (isAndroid) {
        await _platform.invokeMethod('disconnectVpn');
      } else if (isWeb) {
        await _disconnectViaGrpc();
      }
      
      _currentSessionId = null;
      _currentTempKey = null;
      _currentRegion = null;
      _status = VpnStatus.disconnected;
      print('❌ VpnManager: تم قطع الاتصال');
    } catch (e) {
      print('⚠️ VpnManager: خطأ أثناء قطع الاتصال: $e');
    }
  }

  Future<void> _disconnectViaGrpc() async {
    print('🌐 [Web] جاري قطع الاتصال عبر gRPC');
    await Future.delayed(const Duration(seconds: 1));
  }

  // ============================================================
  // 4. باقي الدوال (نفس ما سبق)
  // ============================================================
  // ... _loadServers, _handleNetworkChange, _getOptimalGateway, إلخ
}
