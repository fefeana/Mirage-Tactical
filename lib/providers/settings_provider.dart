import 'package:flutter/material.dart';

class SettingsProvider extends ChangeNotifier {
  bool darkMode = false;
  void toggleDarkMode() { darkMode = !darkMode; notifyListeners(); }
}
