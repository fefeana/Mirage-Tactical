// lib/core/security/temp_token.dart
import 'dart:convert';
import 'dart:math';

class TempToken {
  static final TempToken _instance = TempToken._internal();
  factory TempToken() => _instance;
  TempToken._internal();

  String? _currentToken;
  DateTime? _expiryDate;

  // 🔑 توليد مفتاح (صلاحية 30 دقيقة)
  String generate({int expiryMinutes = 30}) {
    final random = Random.secure();
    final bytes = List<int>.generate(24, (_) => random.nextInt(256));
    final token = base64UrlEncode(bytes).substring(0, 32);

    _currentToken = token;
    _expiryDate = DateTime.now().add(Duration(minutes: expiryMinutes));

    print('');
    print('═══════════════════════════════════════════════════════════');
    print('🔑 المفتاح المؤقت (TEMP TOKEN):');
    print('═══════════════════════════════════════════════════════════');
    print('📌 $token');
    print('═══════════════════════════════════════════════════════════');
    print('⏰ ينتهي بعد: $expiryMinutes دقيقة');
    print('📋 انسخ المفتاح وأرسله');
    print('═══════════════════════════════════════════════════════════');
    print('');

    return token;
  }
}

void main() {
  final token = TempToken().generate();
}
