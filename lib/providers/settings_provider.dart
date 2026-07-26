import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SettingsProvider extends ChangeNotifier {
  bool _darkMode = false;
  String _language = 'ar';
  bool _stealthMode = true;
  bool _notificationsEnabled = true;
  String _defaultRegion = 'riyadh';
  int _maxRetries = 3;

  bool get darkMode => _darkMode;
  String get language => _language;
  bool get stealthMode => _stealthMode;
  bool get notificationsEnabled => _notificationsEnabled;
  String get defaultRegion => _defaultRegion;
  int get maxRetries => _maxRetries;

  Future<void> loadSettings() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _darkMode = prefs.getBool('dark_mode') ?? false;
      _language = prefs.getString('language') ?? 'ar';
      _stealthMode = prefs.getBool('stealth_mode') ?? true;
      _notificationsEnabled = prefs.getBool('notifications_enabled') ?? true;
      _defaultRegion = prefs.getString('default_region') ?? 'riyadh';
      _maxRetries = prefs.getInt('max_retries') ?? 3;
      notifyListeners();
    } catch (e) {
      print('⚠️ فشل تحميل الإعدادات: $e');
    }
  }

  Future<void> setDarkMode(bool value) async {
    _darkMode = value;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('dark_mode', value);
    notifyListeners();
  }

  Future<void> setLanguage(String value) async {
    _language = value;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('language', value);
    notifyListeners();
  }

  Future<void> setStealthMode(bool value) async {
    _stealthMode = value;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('stealth_mode', value);
    notifyListeners();
  }

  Future<void> setDefaultRegion(String value) async {
    _defaultRegion = value;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('default_region', value);
    notifyListeners();
  }

  Future<void> toggleDarkMode() async {
    await setDarkMode(!_darkMode);
  }
}
