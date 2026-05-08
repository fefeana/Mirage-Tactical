# إصدار CMake المطلوب
cmake_minimum_required(VERSION 3.22.1)

# اسم المكتبة 
project("mirage_security")

# إضافة ملف الـ C++ الذي كتبناه سابقاً وتحديد مساره
add_library(
        mirage_security
        SHARED
        src/main/cpp/native-lib.cpp
)

# البحث عن مكتبات الأندرويد الأساسية (مثل السجلات)
find_library(
        log-lib
        log
)

# ربط المكتبة مع مكتبات النظام
target_link_libraries(
        mirage_security
        ${log-lib}
)
