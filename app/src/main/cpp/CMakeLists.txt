# =================================================================
# Mirage UFO - Advanced Native Build Configuration
# Project: miragevpn (Seniorita Edition)
# =================================================================

cmake_minimum_required(VERSION 3.22.1)

project("miragevpn")

# 1. إعداد محرك الـ TUN السيبراني (ناقل الومضات الأساسي)
# هذا الجزء المسؤول عن فتح القناة وربطها بالـ Backend
add_library(
        mirage-engine
        SHARED
        mirage-engine.cpp)

# 2. إعداد درع الحماية وتشفير الومضات
# المسؤول عن فك التمويه وتأمين الاتصال من الاختراق
add_library(
        mirage_security
        SHARED
        mirage_security.cpp)

# 3. تضمين مكاتب النظام الضرورية للعمل تحت الضغط
# ربط المحرك مع سجلات أندرويد لتعقب الومضات ومعالجتها
find_library(log-lib log)
find_library(android-lib android)

# 4. ربط المكونات (Linking) لضمان عدم انغلاق القناة
# تأكد من ربط المحرك بالمكتبات الأساسية لضمان استجابة سريعة
target_link_libraries(
        mirage-engine
        ${android-lib}
        ${log-lib}
        jnigraphics # لدعم العمليات الرسومية السريعة إذا لزم الأمر
)

# 5. ربط درع الحماية بمكتبات التشفير
target_link_libraries(
        mirage_security
        ${android-lib}
        ${log-lib}
)

# تحسين أداء البناء (Optimization Flags)
# لضمان أن ناقل الومضات يعمل بأقصى سرعة على Redmi Note 13 Pro+
set_target_properties(mirage-engine PROPERTIES COMPILE_FLAGS "-O3 -fvisibility=hidden")
set_target_properties(mirage_security PROPERTIES COMPILE_FLAGS "-O3 -fvisibility=hidden")

# =================================================================
# انتهى التعديل - الآن القناة جاهزة للاستقبال ⚡
# =================================================================