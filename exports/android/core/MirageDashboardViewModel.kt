package com.mirage.vpn.core

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
// import com.google.firebase.firestore.FirebaseFirestore

class MirageDashboardViewModel : ViewModel() {
    private val _currentServer = MutableStateFlow<Server?>(null)
    val currentServer: StateFlow<Server?> = _currentServer

    init {
        listenToActiveServer()
    }

    private fun listenToActiveServer() {
        /*
        val db = FirebaseFirestore.getInstance()
        // مراقبة السيرفر الذي يحمل علامة isCurrent = true
        db.collection("servers")
            .whereEqualTo("isCurrent", true)
            .addSnapshotListener { value, error ->
                if (error != null) return@addSnapshotListener
                
                if (value != null && !value.isEmpty) {
                    _currentServer.value = value.documents[0].toObject(Server::class.java)
                }
            }
        */
    }
}
