// ===================================================================
// 🏠 الشاشة الرئيسية
// ===================================================================

import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/api_response.dart';
import '../widgets/status_card.dart';
import 'citizen_screen.dart';
import 'enterprise_screen.dart';
import 'collaborate_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  SystemStatus? _status;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadStatus();
  }

  Future<void> _loadStatus() async {
    try {
      final status = await ApiService.getSystemStatus();
      setState(() {
        _status = status;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade900,
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.shield, color: Colors.amber),
            SizedBox(width: 8),
            Text(
              'Mirage-Tactical',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                letterSpacing: 1.5,
              ),
            ),
          ],
        ),
        backgroundColor: Colors.grey.shade900,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.amber),
            onPressed: _loadStatus,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? _buildError()
              : _buildBody(),
    );
  }

  Widget _buildError() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, color: Colors.red, size: 64),
          const SizedBox(height: 16),
          Text(
            '⚠️ $_error',
            style: const TextStyle(color: Colors.white70, fontSize: 16),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          CustomButton(
            label: 'إعادة المحاولة',
            onPressed: _loadStatus,
          ),
        ],
      ),
    );
  }

  Widget _buildBody() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // حالة النظام
          Text(
            '🛡️ حالة النظام',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: StatusCard(
                  title: 'المرحلة',
                  value: _status!.phase.toUpperCase(),
                  icon: Icons.timeline,
                  color: _status!.phase == 'enterprise'
                      ? Colors.purple
                      : Colors.green,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: StatusCard(
                  title: 'الحالة',
                  value: _status!.status,
                  icon: Icons.check_circle,
                  color: _status!.status == 'READY' ? Colors.green : Colors.orange,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // الوكلاء
          const Text(
            '🤖 الوكلاء المتاحون',
            style: TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: _status!.agents.map((agent) {
              return Chip(
                label: Text(
                  agent.replaceAll('_', ' ').toUpperCase(),
                  style: const TextStyle(color: Colors.black87),
                ),
                backgroundColor: Colors.amber.shade300,
                avatar: const Icon(Icons.smart_toy, size: 18),
              );
            }).toList(),
          ),
          const SizedBox(height: 24),

          // الميزات
          const Text(
            '⚡ الميزات المفعلة',
            style: TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: [
              ..._status!.citizenFeatures.entries.map((e) {
                if (e.value) {
                  return const Chip(
                    label: Text('👥 عامة الشعب'),
                    backgroundColor: Colors.green,
                    labelStyle: TextStyle(color: Colors.white),
                  );
                }
                return const SizedBox.shrink();
              }),
              ..._status!.enterpriseFeatures.entries.map((e) {
                if (e.value) {
                  return const Chip(
                    label: Text('🏛️ مؤسسات'),
                    backgroundColor: Colors.purple,
                    labelStyle: TextStyle(color: Colors.white),
                  );
                }
                return const SizedBox.shrink();
              }),
            ],
          ),
          const SizedBox(height: 30),

          // أزرار التنقل
          Row(
            children: [
              Expanded(
                child: CustomButton(
                  label: '👤 عامة الشعب',
                  color: Colors.green.shade700,
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const CitizenScreen(),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: CustomButton(
                  label: '🏛️ مؤسسات',
                  color: Colors.purple.shade700,
                  onPressed: () {
                    if (_status!.phase == 'enterprise') {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const EnterpriseScreen(),
                        ),
                      );
                    } else {
                      _showPhaseDialog();
                    }
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          CustomButton(
            label: '🤝 تعاون الوكلاء',
            color: Colors.blue.shade700,
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const CollaborateScreen(),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  void _showPhaseDialog() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: Colors.grey.shade800,
        title: const Text(
          '⚠️ ميزات المؤسسات غير مفعلة',
          style: TextStyle(color: Colors.white),
        ),
        content: const Text(
          'لتفعيل ميزات المؤسسات، قم بتعيين متغير البيئة:\n'
          'MIRAGE_PHASE=enterprise\n\n'
          'ثم أعد تشغيل السيرفر.',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('حسناً', style: TextStyle(color: Colors.amber)),
          ),
        ],
      ),
    );
  }
}
