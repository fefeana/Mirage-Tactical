package com.mirage.vpn.core.network

import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

interface GitHubModernService {
    // رفع الملف كـ Octet-Stream (الصيغة الحديثة للملفات الثنائية)
    @PUT("repos/{owner}/{repo}/contents/{path}")
    suspend fun uploadBinaryFile(
        @Header("Authorization") token: String,
        @Path("owner") owner: String,
        @Path("repo") repo: String,
        @Path("path") path: String,
        @Body body: RequestBody
    ): Response<Unit>
}
