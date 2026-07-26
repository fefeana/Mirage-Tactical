import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_remote_config/firebase_remote_config.dart';
import 'package:universal_platform/universal_platform.dart';
import 'providers/vpn_provider.dart';
import 'providers/settings_provider.dart';
import 'screens/home_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/settings_screen.dart';
import 'screens/download_screen.dart';
import 'utils/theme.dart';
import 'services/analytics_service.dart';
import 'ai/ai_engine.dart';

/// تحديد المنصة الحالية
bool get isAndroid => UniversalPlatform.isAndroid;
bool get isWeb => UniversalPlatform.isWeb;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // تهيئة Firebase
  await Firebase.initializeApp();
  
  // تهيئة Remote Config
  await FirebaseRemoteConfig.instance.fetchAndActivate();
  
  // تهيئة الخدمات
  await AnalyticsService().initialize();
  await AIEngine().initialize();
  
  runApp(const MirageTacticalApp());
}

class MirageTacticalApp extends StatelessWidget {
  const MirageTacticalApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => VpnProvider()..init()),
        ChangeNotifierProvider(create: (_) => SettingsProvider()..loadSettings()),
      ],
      child: Consumer<SettingsProvider>(
        builder: (context, settingsProvider, child) {
          return MaterialApp(
            title: 'ميراج التكتيكي',
            theme: AppTheme.getTheme(settingsProvider.darkMode),
            darkTheme: AppTheme.darkTheme,
            themeMode: settingsProvider.darkMode ? ThemeMode.dark : ThemeMode.light,
            debugShowCheckedModeBanner: false,
            initialRoute: '/',
            routes: {
              '/': (context) => const HomeScreen(),
              '/dashboard': (context) => const DashboardScreen(),
              '/settings': (context) => const SettingsScreen(),
              '/downloads': (context) => const DownloadScreen(),
            },
          );
        },
      ),
    );
  }
}
