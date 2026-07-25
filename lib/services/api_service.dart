import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:8080';

  // جلب حالة النظام
  static Future<Map<String, dynamic>> getSystemStatus() async {
    final response = await http.get(Uri.parse('$baseUrl/'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load system status');
    }
  }

  // تنفيذ وكيل (مثال)
  static Future<Map<String, dynamic>> executeAgent(String request, {String? agent}) async {
    final response = await http.post(
      Uri.parse('$baseUrl/agent/execute'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'request': request,
        'agent': agent,
      }),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Agent execution failed');
    }
  }

  // تسجيل مؤسسة (يتطلب JWT)
  static Future<String> registerEnterprise(
    String name,
    String sector,
    String isolatedIp,
    String token,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/enterprise/register'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'name': name,
        'sector': sector,
        'isolated_ip': isolatedIp,
      }),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body)['client_id'];
    } else {
      throw Exception('Registration failed');
    }
  }

  // توليد TOTP
  static Future<Map<String, dynamic>> generateTOTP(
    String clientId,
    String userId,
    String token,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/enterprise/totp/generate?client_id=$clientId&user_id=$userId'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('TOTP generation failed');
    }
  }

  // التحقق من TOTP
  static Future<bool> verifyTOTP(
    String clientId,
    String userId,
    String totpToken,
    String jwtToken,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/enterprise/totp/verify?client_id=$clientId&user_id=$userId&token=$totpToken'),
      headers: {'Authorization': 'Bearer $jwtToken'},
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body)['valid'] ?? false;
    } else {
      throw Exception('TOTP verification failed');
    }
  }

  // مراقبة المؤسسة
  static Future<Map<String, dynamic>> monitorEnterprise(
    String clientId,
    String token,
  ) async {
    final response = await http.get(
      Uri.parse('$baseUrl/enterprise/monitor/$clientId'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Monitoring failed');
    }
  }
}
