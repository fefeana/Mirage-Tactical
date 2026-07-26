import 'package:flutter/material.dart';

class VpnProvider extends ChangeNotifier {
  bool _isConnected = false;
  String? _currentServer;
  String? _currentRegion;

  bool get isConnected => _isConnected;
  String? get currentServer => _currentServer;
  String? get currentRegion => _currentRegion;

  void connect({String? region, String? server}) {
    _isConnected = true;
    _currentRegion = region ?? 'riyadh';
    _currentServer = server ?? 'mcp-riyadh.mirage-vpn.com';
    notifyListeners();
  }

  void disconnect() {
    _isConnected = false;
    _currentServer = null;
    _currentRegion = null;
    notifyListeners();
  }

  void toggle() {
    if (_isConnected) {
      disconnect();
    } else {
      connect();
    }
  }
}
