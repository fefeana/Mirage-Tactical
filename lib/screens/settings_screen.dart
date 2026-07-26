import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/settings_provider.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final settingsProvider = Provider.of<SettingsProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('⚙️ الإعدادات'),
        backgroundColor: Colors.blueGrey.shade900,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSectionTitle('🎨 المظهر'),
          SwitchListTile(
            title: const Text('الوضع المظلم'),
            subtitle: const Text('استخدام الألوان الداكنة'),
            value: settingsProvider.darkMode,
            onChanged: settingsProvider.setDarkMode,
            activeColor: Colors.blue,
          ),

          _buildSectionTitle('🌐 الاتصال'),
          ListTile(
            title: const Text('المنطقة الافتراضية'),
            subtitle: Text('الحالية: ${settingsProvider.defaultRegion}'),
            trailing: DropdownButton<String>(
              value: settingsProvider.defaultRegion,
              items: ['riyadh', 'tokyo', 'london', 'newyork', 'dubai']
                  .map((region) => DropdownMenuItem(
                        value: region,
                        child: Text(region),
                      ))
                  .toList(),
              onChanged: (value) {
                if (value != null) settingsProvider.setDefaultRegion(value);
              },
            ),
          ),

          _buildSectionTitle('🛡️ الأمان'),
          SwitchListTile(
            title: const Text('وضع الشبح'),
            subtitle: const Text('تمويه حركة المرور'),
            value: settingsProvider.stealthMode,
            onChanged: settingsProvider.setStealthMode,
            activeColor: Colors.blue,
          ),

          _buildSectionTitle('🔔 الإشعارات'),
          SwitchListTile(
            title: const Text('الإشعارات'),
            subtitle: const Text('إشعارات حالة الاتصال'),
            value: settingsProvider.notificationsEnabled,
            onChanged: (value) {},
            activeColor: Colors.blue,
          ),

          _buildSectionTitle('🌍 اللغة'),
          ListTile(
            title: const Text('اللغة'),
            trailing: DropdownButton<String>(
              value: settingsProvider.language,
              items: const [
                DropdownMenuItem(value: 'ar', child: Text('العربية')),
                DropdownMenuItem(value: 'en', child: Text('English')),
              ],
              onChanged: (value) {
                if (value != null) settingsProvider.setLanguage(value);
              },
            ),
          ),

          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blueGrey.shade700,
            ),
            child: const Text('العودة للرئيسية'),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: Colors.blue,
        ),
      ),
    );
  }
}
