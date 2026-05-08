cmake_minimum_required(VERSION 3.22.1)

# تعريف مشروع النواة لميراچ
project("mirage_vpn")

# ==========================================
# 🛡️ THE MIRAGE CORE: JNI & XRAY BINDINGS
# ==========================================

# 1. تعريف مسار أو اسم مكتبة الـ Xray-core المترجمة (SO / Static)
# (يتم تحديدها بناءً على معمارية الجهاز مدعومة بـ arm64-v8a)
# set(XRAY_CORE_LIBRARY "path/to/libxray.so")

# 2. إنشاء مكتبة JNI الديناميكية (mirage_security)
# هذا الملف (native-lib.cpp) يحتوي على شيفرات فك التشفير في الـ C++
add_library(mirage_security SHARED native-lib.cpp)

# 3. جلب مكتبة تسجيل الأحداث الخاصة بالأندرويد
find_library(log-lib log)

# 4. ربط مكتبات Xray المشفرة بنظام الأندرويد
target_link_libraries(mirage_security
                      android
                      ${log-lib}
                      # بمجرد تجهيز مسار الـ Xray، قم بإزالة علامة الـ Hash أدناه
                      # ${XRAY_CORE_LIBRARY}
)

# تفعيل مستوى الحماية الأقصى للكود المترجم (Obfuscation & Optimization)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3 -fvisibility=hidden -fvisibility-inlines-hidden")
