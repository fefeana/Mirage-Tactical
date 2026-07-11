// lib/core/security/temp_token.dart
import 'dart:convert';
import 'dart:math';
import 'package:shared_preferences/shared_preferences.dart';

class TempToken {
  static final TempToken _instance = TempToken._internal();
  factory TempToken() => _instance;
  TempToken._internal();

  String? _currentToken;
  DateTime? _expiryDate;

  // 🔑 توليد مفتاح (صلاحية 15 دقيقة) + طباعة تلقائية
  String generate({int expiryMinutes = 15}) {
    final random = Random.secure();
    final bytes = List<int>.generate(24, (_) => random.nextInt(256));
    final token = base64UrlEncode(bytes).substring(0, 32);

    _currentToken = token;
    _expiryDate = DateTime.now().add(Duration(minutes: expiryMinutes));
    _save(token, expiryMinutes);

    print('🔑 المفتاح المؤقت: $token');
    print('⏰ ينتهي بعد: $expiryMinutes دقيقة');

    return token;
  }

  // 💾 حفظ
  Future<void> _save(String token, int expiryMinutes) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('temp_token', token);
    await prefs.setInt('temp_expiry', expiryMinutes);
    await prefs.setString('temp_created', DateTime.now().toIso8601String());
  }

  // 🔍 التحقق
  Future<bool> isValid(String token) async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString('temp_token');
    final created = prefs.getString('temp_created');
    final expiry = prefs.getInt('temp_expiry') ?? 15;

    if (saved != token || created == null) return false;

    final createdDate = DateTime.parse(created);
    final expiryDate = createdDate.add(Duration(minutes: expiry));

    return DateTime.now().isBefore(expiryDate);
  }

  // 🗑️ إلغاء
  Future<void> revoke() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('temp_token');
    await prefs.remove('temp_expiry');
    await prefs.remove('temp_created');
    _currentToken = null;
    _expiryDate = null;
    print('🗑️ تم إلغاء المفتاح');
  }

  // 📋 جلب المفتاح النشط
  Future<String> getActive() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('temp_token') ?? '';
  }

  // 📊 الحالة
  String getStatus() {
    if (_currentToken == null) return '❌ لا يوجد مفتاح';
    if (_expiryDate == null) return '❌ تاريخ غير معروف';
    
    final remaining = _expiryDate!.difference(DateTime.now());
    if (remaining.isNegative) return '⏰ انتهى المفتاح';
    
    return '✅ نشط (${remaining.inMinutes} دقيقة متبقية)';
  }
}
