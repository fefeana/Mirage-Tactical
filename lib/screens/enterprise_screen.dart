// ===================================================================
// 🏛️ شاشة المؤسسات (تتطلب JWT)
// ===================================================================

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import '../widgets/custom_button.dart';

class EnterpriseScreen extends StatefulWidget {
  const EnterpriseScreen({super.key});

  @override
  State<EnterpriseScreen> createState() => _EnterpriseScreenState();
}

class _EnterpriseScreenState extends State<EnterpriseScreen> {
  // JWT Token (يُحفظ في SharedPreferences)
  String? _jwtToken;

  // حقول النماذج
  final _nameController = TextEditingController();
  final _sectorController = TextEditingController();
  final _ipController = TextEditingController();
  final _userIdController = TextEditingController();
  final _totpController = TextEditingController();
  final _clientIdController = TextEditingController();

  String _result = '';
  bool _isLoading = false;
  String? _clientId;

  @override
  void initState() {
    super.initState();
    _loadToken();
  }

  Future<void> _loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _jwtToken = prefs.getString('jwt_token');
    });
  }

  Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('jwt_token', token);
    setState(() => _jwtToken = token);
  }

  Future<void> _registerEnterprise() async {
    if (_nameController.text.isEmpty ||
        _sectorController.text.isEmpty ||
        _ipController.text.isEmpty) {
      setState(() => _result = '⚠️ الرجاء ملء جميع الحقول');
      return;
    }

    if (_jwtToken == null) {
      setState(() => _result = '⚠️ الرجاء إدخال JWT Token صالح');
      return;
    }

    setState(() => _isLoading = true);
    try {
      final clientId = await ApiService.registerEnterprise(
        _nameController.text.trim(),
        _sectorController.text.trim(),
        _ipController.text.trim(),
        _jwtToken!,
      );
      setState(() {
        _clientId = clientId;
        _result = '✅ تم تسجيل المؤسسة!\n'
            'الرمز: $_clientId\n'
            'الحالة: معزولة (ISOLATED)';
      });
    } catch (e) {
      setState(() => _result = '❌ فشل التسجيل: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _generateTOTP() async {
    if (_clientIdController.text.isEmpty || _userIdController.text.isEmpty) {
      setState(() => _result = '⚠️ الرجاء إدخال client_id و user_id');
      return;
    }
    if (_jwtToken == null) {
      setState(() => _result = '⚠️ الرجاء إدخال JWT Token صالح');
      return;
    }

    setState(() => _isLoading = true);
    try {
      final response = await ApiService.generateTOTP(
        _clientIdController.text.trim(),
        _userIdController.text.trim(),
        _jwtToken!,
      );
      setState(() {
        _result = '🔐 رمز TOTP:\n'
            'الرمز: ${response.token}\n'
            'ينتهي خلال: ${response.expiresIn} ثانية';
      });
    } catch (e) {
      setState(() => _result = '❌ فشل توليد TOTP: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _verifyTOTP() async {
    if (_clientIdController.text.isEmpty ||
        _userIdController.text.isEmpty ||
        _totpController.text.isEmpty) {
      setState(() => _result = '⚠️ الرجاء ملء جميع الحقول');
      return;
    }
    if (_jwtToken == null) {
      setState(() => _result = '⚠️ الرجاء إدخال JWT Token صالح');
      return;
    }

    setState(() => _isLoading = true);
    try {
      final valid = await ApiService.verifyTOTP(
        _clientIdController.text.trim(),
        _userIdController.text.trim(),
        _totpController.text.trim(),
        _jwtToken!,
      );
      setState(() {
        _result = valid
            ? '✅ TOTP صحيح! تم تدمير الرمز.'
            : '❌ TOTP غير صالح أو منتهي الصلاحية.';
      });
    } catch (e) {
      setState(() => _result = '❌ فشل التحقق: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _monitorEnterprise() async {
    if (_clientIdController.text.isEmpty) {
      setState(() => _result = '⚠️ الرجاء إدخال client_id');
      return;
    }
    if (_jwtToken == null) {
      setState(() => _result = '⚠️ الرجاء إدخال JWT Token صالح');
      return;
    }

    setState(() => _isLoading = true);
    try {
      final data = await ApiService.monitorEnterprise(
        _clientIdController.text.trim(),
        _jwtToken!,
      );
      setState(() {
        _result = '📊 حالة المؤسسة:\n'
            'الاسم: ${data['name']}\n'
            'القطاع: ${data['sector']}\n'
            'الحالة: ${data['status']}\n'
            'النزاهة: ${data['integrity']}\n'
            'Zero Trust: ${data['zero_trust']}';
      });
    } catch (e) {
      setState(() => _result = '❌ فشل المراقبة: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade900,
      appBar: AppBar(
        title: const Text('🏛️ المؤسسات'),
        backgroundColor: Colors.grey.shade900,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.amber),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: Icon(
              _jwtToken != null ? Icons.check_circle : Icons.cancel,
              color: _jwtToken != null ? Colors.green : Colors.red,
            ),
            onPressed: _loadToken,
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // JWT Token
              const Text(
                '🔑 JWT Token',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      style: const TextStyle(color: Colors.white),
                      initialValue: _jwtToken ?? '',
                      onChanged: (value) {
                        if (value.isNotEmpty) _saveToken(value);
                      },
                      decoration: InputDecoration(
                        hintText: 'أدخل JWT Token الخاص بك...',
                        hintStyle: const TextStyle(color: Colors.grey),
                        filled: true,
                        fillColor: Colors.grey.shade800,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: const Icon(Icons.save, color: Colors.amber),
                    onPressed: () {
                      if (_jwtToken != null && _jwtToken!.isNotEmpty) {
                        _saveToken(_jwtToken!);
                        setState(() => _result = '✅ تم حفظ التوكن');
                      }
                    },
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // تسجيل مؤسسة
              const Text(
                '📝 تسجيل مؤسسة',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _nameController,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        hintText: 'الاسم',
                        hintStyle: TextStyle(color: Colors.grey),
                        filled: true,
                        fillColor: Colors.grey,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _sectorController,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        hintText: 'القطاع (bank/government)',
                        hintStyle: TextStyle(color: Colors.grey),
                        filled: true,
                        fillColor: Colors.grey,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _ipController,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        hintText: 'IP المعزول',
                        hintStyle: TextStyle(color: Colors.grey),
                        filled: true,
                        fillColor: Colors.grey,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              CustomButton(
                label: 'تسجيل مؤسسة',
                onPressed: _registerEnterprise,
                isLoading: _isLoading,
                color: Colors.purple.shade700,
              ),
              const SizedBox(height: 24),

              // TOTP + التحقق + المراقبة
              const Text(
                '🔐 TOTP والمصادقة',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _clientIdController,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        hintText: 'Client ID',
                        hintStyle: TextStyle(color: Colors.grey),
                        filled: true,
                        fillColor: Colors.grey,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _userIdController,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        hintText: 'User ID',
                        hintStyle: TextStyle(color: Colors.grey),
                        filled: true,
                        fillColor: Colors.grey,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _totpController,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        hintText: 'رمز TOTP',
                        hintStyle: TextStyle(color: Colors.grey),
                        filled: true,
                        fillColor: Colors.grey,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: CustomButton(
                      label: 'توليد TOTP',
                      onPressed: _generateTOTP,
                      isLoading: _isLoading,
                      color: Colors.orange.shade700,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: CustomButton(
                      label: 'تحقق TOTP',
                      onPressed: _verifyTOTP,
                      isLoading: _isLoading,
                      color: Colors.blue.shade700,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: CustomButton(
                      label: 'مراقبة',
                      onPressed: _monitorEnterprise,
                      isLoading: _isLoading,
                      color: Colors.teal.shade700,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              if (_result.isNotEmpty) ...[
                const Divider(color: Colors.grey),
                const Text(
                  '📝 النتيجة:',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade800,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.purple.shade300.withOpacity(0.3)),
                  ),
                  child: Text(
                    _result,
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 15,
                      height: 1.6,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
