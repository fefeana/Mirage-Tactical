import 'package:flutter/material.dart';

class VpnProvider extends ChangeNotifier {
  bool isConnected = false;
  void connect() { isConnected = true; notifyListeners(); }
  void disconnect() { isConnected = false; notifyListeners(); }
}
