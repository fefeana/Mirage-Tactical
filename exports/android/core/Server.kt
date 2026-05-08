package com.mirage.vpn.core

data class Server(
    val id: String = "",
    val name: String = "",
    val ipAddress: String = "",
    val location: String = "",
    val region: String = "",
    val protocol: String = "",
    val latency: Int = 0,
    val isCurrent: Boolean = false,
    val status: String = "active"
)
