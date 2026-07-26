import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData getTheme(bool isDark) {
    return isDark ? ThemeData.dark() : ThemeData.light();
  }
  static ThemeData get darkTheme => ThemeData.dark();
  static ThemeData get lightTheme => ThemeData.light();
}
