// ===================================================================
// 🔗 خدمة الاتصال بـ FastAPI
// ===================================================================

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/api_response.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:8080'; // غيّر حسب نشرك

  // ================================================================
  // 📌 نقاط النهاية العامة
  // ================================================================

  static Future<SystemStatus> getSystemStatus() async {
    final response = await http.get(Uri.parse('$baseUrl/'));
    if (response.statusCode == 200) {
      return SystemStatus.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load system status');
    }
  }

  static Future<List<dynamic>> getAgents() async {
    final response = await http.get(Uri.parse('$baseUrl/system/agents'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body)['agents'];
    } else {
      throw Exception('Failed to load agents');
    }
  }

  // ================================================================
  // 📌 نقاط نهاية الوكلاء
  // ================================================================

  static Future<AgentExecutionResponse> executeAgent(
    String request, {
    String? agent,
  }) async {
    final body = AgentExecutionRequest(request: request, agent: agent);
    final response = await http.post(
      Uri.parse('$baseUrl/agent/execute'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body.toJson()),
    );

    if (response.statusCode == 200) {
      return AgentExecutionResponse.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Agent execution failed: ${response.body}');
    }
  }

  static Future<AgentExecutionResponse> collaborateAgents(String request) async {
    final body = {'request': request};
    final response = await http.post(
      Uri.parse('$baseUrl/agent/collaborate'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );

    if (response.statusCode == 200) {
      return AgentExecutionResponse.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Collaboration failed: ${response.body}');
    }
  }

  // ================================================================
  // 📌 نقاط نهاية المؤسسات (تتطلب JWT)
  // ================================================================

  static Future<String> registerEnterprise(
    String name,
    String sector,
    String isolatedIp,
    String token,
  ) async {
    final body = EnterpriseRegisterRequest(
      name: name,
      sector: sector,
      isolatedIp: isolatedIp,
    );
    final response = await http.post(
      Uri.parse('$baseUrl/enterprise/register'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(body.toJson()),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body)['client_id'];
    } else {
      throw Exception('Registration failed: ${response.body}');
    }
  }

  static Future<TOTPResponse> generateTOTP(
    String clientId,
    String userId,
    String token,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/enterprise/totp/generate?client_id=$clientId&user_id=$userId'),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      return TOTPResponse.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('TOTP generation failed: ${response.body}');
    }
  }

  static Future<bool> verifyTOTP(
    String clientId,
    String userId,
    String totpToken,
    String jwtToken,
  ) async {
    final response = await http.post(
      Uri.parse(
        '$baseUrl/enterprise/totp/verify?client_id=$clientId&user_id=$userId&token=$totpToken',
      ),
      headers: {'Authorization': 'Bearer $jwtToken'},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body)['valid'] ?? false;
    } else {
      throw Exception('TOTP verification failed: ${response.body}');
    }
  }

  static Future<void> registerFIDO2(
    String clientId,
    String publicKey,
    String token,
  ) async {
    final response = await http.post(
      Uri.parse(
        '$baseUrl/enterprise/fido2/register?client_id=$clientId&public_key=$publicKey',
      ),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode != 200) {
      throw Exception('FIDO2 registration failed: ${response.body}');
    }
  }

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
      throw Exception('Monitoring failed: ${response.body}');
    }
  }
}
