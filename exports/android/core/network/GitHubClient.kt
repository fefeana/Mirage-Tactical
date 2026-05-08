package com.mirage.vpn.core.network

import retrofit2.Retrofit

object GitHubClient {
    private const val BASE_URL = "https://api.github.com/"

    val service: GitHubModernService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .build()
            .create(GitHubModernService::class.java)
    }

    val repository: ModernGitHubRepository by lazy {
        ModernGitHubRepository(service)
    }
}
