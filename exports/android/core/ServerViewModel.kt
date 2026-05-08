package com.mirage.vpn.core

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch
// import com.google.firebase.firestore.FirebaseFirestore

class ServerViewModel : ViewModel() {

    // private val firestore = FirebaseFirestore.getInstance()
    private val security = MirageSecurity

    private val _allServers = MutableStateFlow<List<Server>>(emptyList())
    private val _protocolFilter = MutableStateFlow("ALL")
    private val _statusFilter = MutableStateFlow("ALL")

    private val _filteredServers = MutableStateFlow<List<Server>>(emptyList())
    val filteredServers: StateFlow<List<Server>> = _filteredServers
    val serverList: StateFlow<List<Server>> = _filteredServers

    init {
        fetchAndSecureServers()
        setupFilteringLogic()
    }

    private fun fetchAndSecureServers() {
        /*
        firestore.collection("servers")
            .addSnapshotListener { value, error ->
                if (error != null) return@addSnapshotListener
                
                val servers = value?.documents?.mapNotNull { doc ->
                    val server = doc.toObject(Server::class.java)
                    
                    // إجراء التشفير/فك التشفير لعنوان الـ IP
                    server?.copy(
                        ipAddress = try {
                            security.decrypt(server.ipAddress) // فك التشفير عند الجلب
                        } catch (e: Exception) {
                            "SECURED_NODE" // تمويه في حال فشل الفك
                        }
                    )
                } ?: emptyList()
                _allServers.value = servers
            }
        */
        // بيانات تجريبية (Mock Data)
        val mockServers = listOf(
            Server(id = "1", name = "Tokyo-1", ipAddress = security.encrypt("104.21.34.45"), region = "Japan", protocol = "HYSTERIA2", status = "ACTIVE", latency = 15),
            Server(id = "2", name = "USA-East", ipAddress = security.encrypt("172.64.12.11"), region = "USA", protocol = "VLESS", status = "ACTIVE", latency = 120),
            Server(id = "3", name = "Frankfurt", ipAddress = security.encrypt("192.168.1.1"), region = "Germany", protocol = "HYSTERIA2", status = "OFFLINE", latency = 45)
        )

        _allServers.value = mockServers.map { server ->
            server.copy(
                ipAddress = try {
                    security.decrypt(server.ipAddress)
                } catch (e: Exception) {
                    "SECURED_NODE"
                }
            )
        }
    }

    private fun setupFilteringLogic() {
        viewModelScope.launch {
            combine(_allServers, _protocolFilter, _statusFilter) { servers, protocol, status ->
                servers.filter { server ->
                    val matchesProtocol = protocol == "ALL" || server.protocol.uppercase() == protocol
                    val matchesStatus = status == "ALL" || server.status.uppercase() == status
                    matchesProtocol && matchesStatus
                }
            }.collect { filteredList ->
                _filteredServers.value = filteredList
            }
        }
    }

    fun applyFilter(filterTag: String) {
        when (filterTag.uppercase()) {
            "VLESS", "HYSTERIA2" -> {
                _protocolFilter.value = filterTag.uppercase()
                _statusFilter.value = "ALL"
            }
            "ACTIVE" -> {
                _statusFilter.value = "ACTIVE"
                _protocolFilter.value = "ALL"
            }
            "ALL" -> {
                _protocolFilter.value = "ALL"
                _statusFilter.value = "ALL"
            }
        }
    }
}
