// ===================================================================
// 🤝 شاشة تعاون الوكلاء
// ===================================================================

import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../widgets/custom_button.dart';

class CollaborateScreen extends StatefulWidget {
  const CollaborateScreen({super.key});

  @override
  State<CollaborateScreen> createState() => _CollaborateScreenState();
}

class _CollaborateScreenState extends State<CollaborateScreen> {
  final _taskController = TextEditingController();
  String _result = '';
  bool _isLoading = false;

  Future<void> _collaborate() async {
    if (_taskController.text.trim().isEmpty) {
      setState(() => _result = '⚠️ الرجاء كتابة المهمة');
      return;
    }

    setState(() => _isLoading = true);
    try {
      final response = await ApiService.collaborateAgents(
        _taskController.text.trim(),
      );
      setState(() {
        _result = '🤝 نتيجة التعاون:\n'
            '📋 الخطة: ${response.plan ?? 'لا توجد خطة'}\n'
            '🛡️ الأمن: ${response.threatLevel ?? 'غير محدد'}\n'
            '📌 الحالة: ${response.status}';
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
        title: const Text('🤝 تعاون الوكلاء'),
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
                '📌 صِف المهمة المعقدة التي تريد أن يتعاون فيها جميع الوكلاء:',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _taskController,
                maxLines: 6,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'مثلاً: "قم بتطوير نظام كشف احتيال جديد..."',
                  hintStyle: const TextStyle(color: Colors.grey),
                  filled: true,
                  fillColor: Colors.grey.shade800,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              CustomButton(
                label: '🚀 تشغيل التعاون',
                onPressed: _collaborate,
                isLoading: _isLoading,
                color: Colors.blue.shade700,
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
                    border: Border.all(color: Colors.blue.shade300.withOpacity(0.3)),
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
