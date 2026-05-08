package com.mirage.vpn.core.network

import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class ModernGitHubRepository(private val service: GitHubModernService) {

    suspend fun uploadProjectFile(
        token: String,
        owner: String,
        repo: String,
        remotePath: String,
        fileBytes: ByteArray
    ): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                // نستخدم MediaType للملفات الثنائية
                val requestBody = fileBytes.toRequestBody(
                    "application/octet-stream".toMediaTypeOrNull(),
                    0,
                    fileBytes.size
                )

                val response = service.uploadBinaryFile(
                    token = "Bearer $token",
                    owner = owner,
                    repo = repo,
                    path = remotePath,
                    body = requestBody
                )

                response.isSuccessful
            } catch (e: Exception) {
                false
            }
        }
    }
}
