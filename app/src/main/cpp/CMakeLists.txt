# إعداد بناء مكاتب الـ C++ (Native Layer)

cmake_minimum_required(VERSION 3.22.1)

project("miragevpn")

# محرك الـ TUN السريع السيبراني المضاف حديثاً 
add_library(
        mirage-engine
        SHARED
        mirage-engine.cpp)

# درع الحماية الخاص بالتشفير والمفاتيح مموهة
add_library(
        mirage_security
        SHARED
        mirage_security.cpp)

target_link_libraries(
        mirage-engine
        android
        log)

target_link_libraries(
        mirage_security
        android
        log)
