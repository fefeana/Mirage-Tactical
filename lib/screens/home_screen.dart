import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/vpn_provider.dart';
import '../providers/settings_provider.dart';
import '../widgets/custom_button.dart';
import '../widgets/samurai_armor.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final vpnProvider = Provider.of<VpnProvider>(context);
    final settingsProvider = Provider.of<SettingsProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('🛡️ ميراج التكتيكي'),
        actions: [
          IconButton(
            icon: Icon(settingsProvider.darkMode ? Icons.light_mode : Icons.dark_mode),
            onPressed: settingsProvider.toggleDarkMode,
          ),
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => Navigator.pushNamed(context, '/settings'),
          ),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              settingsProvider.darkMode ? Colors.blueGrey.shade900 : Colors.blue.shade50,
              settingsProvider.darkMode ? Colors.black : Colors.white,
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // الشعار والأدرع
              const SamuraiArmor(armorType: 'legendary', size: 80),
              const SizedBox(height: 10),
              const Text(
                'ميراج التكتيكي',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 5),
              Text(
                'VPN سريع وآمن',
                style: TextStyle(
                  fontSize: 16,
                  color: settingsProvider.darkMode ? Colors.white60 : Colors.black54,
                ),
              ),

              const SizedBox(height: 40),

              // حالة الاتصال
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                decoration: BoxDecoration(
                  color: (vpnProvider.isConnected ? Colors.green : Colors.red).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: vpnProvider.isConnected ? Colors.green : Colors.red,
                    width: 2,
                  ),
                ),
                child: Column(
                  children: [
                    Text(
                      vpnProvider.isConnected ? '✅ متصل' : '⛔ غير متصل',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: vpnProvider.isConnected ? Colors.green : Colors.red,
                      ),
                    ),
                    if (vpnProvider.isConnected) ...[
                      const SizedBox(height: 5),
                      Text(
                        'الخادم: ${vpnProvider.currentServer ?? 'غير محدد'}',
                        style: TextStyle(
                          fontSize: 14,
                          color: settingsProvider.darkMode ? Colors.white60 : Colors.black54,
                        ),
                      ),
                      Text(
                        'المنطقة: ${vpnProvider.currentRegion ?? 'غير محدد'}',
                        style: TextStyle(
                          fontSize: 14,
                          color: settingsProvider.darkMode ? Colors.white60 : Colors.black54,
                        ),
                      ),
                    ],
                  ],
                ),
              ),

              const SizedBox(height: 40),

              // زر الاتصال الرئيسي
              CustomButton(
                text: vpnProvider.isConnected ? 'قطع الاتصال' : 'اتصال',
                onPressed: vpnProvider.toggle,
                color: vpnProvider.isConnected ? Colors.red : Colors.green,
                width: 200,
                height: 60,
              ),

              const SizedBox(height: 20),

              // أزرار التنقل السريع
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildNavButton(
                    context,
                    icon: Icons.dashboard,
                    label: 'لوحة التحكم',
                    route: '/dashboard',
                  ),
                  const SizedBox(width: 15),
                  _buildNavButton(
                    context,
                    icon: Icons.download,
                    label: 'التحميلات',
                    route: '/downloads',
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavButton(BuildContext context, {
    required IconData icon,
    required String label,
    required String route,
  }) {
    return InkWell(
      onTap: () => Navigator.pushNamed(context, route),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(icon, color: Colors.blue, size: 28),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(fontSize: 12, color: Colors.white70),
            ),
          ],
        ),
      ),
    );
  }
}
