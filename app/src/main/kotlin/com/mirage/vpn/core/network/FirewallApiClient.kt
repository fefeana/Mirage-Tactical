package com.mirage.vpn.core.network

import com.mirage.vpn.core.SecurityProvider
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

// المرحلة الثالثة: سحب الـ API Key من الجدار الناري والتسليح (Network Blueprint)
object FirewallApiClient {

    // 1. نبني مسار آمن للـ Http
    private val authInterceptor = Interceptor { chain ->
        // استخدام المفتاح المشتت والمجمع لحظياً من طبقة الـ C++  
        val tacticalHeader = SecurityProvider.getTacticalAuthHeader() 
        val newRequest = chain.request().newBuilder()
            .addHeader("Authorization", tacticalHeader)
            .build()
        chain.proceed(newRequest)
    }

    private val httpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .build()

    // 2. نقوم بضبط إعدادات الـ Retrofit ليتصل بالجدار الناري الخاص بك
    val apiService: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl("https://firewall.mirage-os.tech") // الجدار الناري
            .client(httpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
}
