// ===================================================================
// 👤 شاشة عامة الشعب
// ===================================================================

import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/api_response.dart';
import '../widgets/custom_button.dart';

class CitizenScreen extends StatefulWidget {
  const CitizenScreen({super.key});

  @override
  State<CitizenScreen> createState() => _CitizenScreenState();
}

class _CitizenScreenState extends State<CitizenScreen> {
  final _descriptionController = TextEditingController();
  final _requestController = TextEditingController();
  String _result = '';
  bool _isLoading = false;

  Future<void> _reportScam() async {
    if (_descriptionController.text.trim().isEmpty) {
      setState(() => _result = '⚠️ الرجاء كتابة وصف للرسالة');
      return;
    }

    setState(() => _isLoading = true);
    try {
      final response = await ApiService.executeAgent(
        _descriptionController.text.trim(),
        agent: 'security',
      );
      setState(() {
        _result = '🛡️ تحليل الأمن:\n'
            '• مستوى التهديد: ${response.threatLevel ?? 'غير محدد'}\n'
            '• التوصيات: ${response.recommendations?.join('\n') ?? 'لا توجد'}\n'
            '• الوكيل: ${response.agent} (${response.llmUsed})';
      });
    } catch (e) {
      setState(() => _result = '❌ خطأ: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _getSecurityTips() async {
    setState(() => _isLoading = true);
    try {
      final response = await ApiService.executeAgent(
        'أعطني نصائح أمنية للمستخدمين العاديين',
        agent: 'citizen_support',
      );
      setState(() {
        _result = '📚 نصائح أمنية:\n${response.response ?? 'لا توجد نصائح'}';
      });
    } catch (e) {
      setState(() => _result = '❌ خطأ: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade900,
      appBar: AppBar(
        title: const Text('👤 عامة الشعب'),
        backgroundColor: Colors.grey.shade900,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.amber),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                '📢 الإبلاغ عن احتيال',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _descriptionController,
                maxLines: 4,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'اكتب وصفاً للرسالة أو الرابط المشبوه...',
                  hintStyle: const TextStyle(color: Colors.grey),
                  filled: true,
                  fillColor: Colors.grey.shade800,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              CustomButton(
                label: '🔍 تحليل التهديد',
                onPressed: _reportScam,
                isLoading: _isLoading,
                color: Colors.red.shade700,
              ),
              const SizedBox(height: 24),

              const Text(
                '📚 نصائح أمنية',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              CustomButton(
                label: '💡 احصل على نصائح',
                onPressed: _getSecurityTips,
                isLoading: _isLoading,
                color: Colors.green.shade700,
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
                    border: Border.all(color: Colors.amber.shade300.withOpacity(0.3)),
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
