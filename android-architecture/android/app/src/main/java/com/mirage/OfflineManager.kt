// android/app/src/main/java/com/mirage/OfflineManager.kt
package com.mirage

import android.content.Context
import androidx.room.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import org.json.JSONObject

@Entity(tableName = "cached_state")
data class CachedState(
    @PrimaryKey
    val key: String,
    val value: String,
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "pending_commands")
data class PendingCommand(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val command: String,
    val payload: String,
    val timestamp: Long = System.currentTimeMillis()
)

@Dao
interface CacheDao {
    @Insert
    suspend fun insertState(state: CachedState)
    
    @Query("SELECT * FROM cached_state WHERE key = :key")
    suspend fun getState(key: String): CachedState?
    
    @Query("SELECT * FROM cached_state")
    suspend fun getAllStates(): List<CachedState>
    
    @Insert
    suspend fun insertCommand(command: PendingCommand)
    
    @Query("SELECT * FROM pending_commands ORDER BY timestamp ASC")
    suspend fun getAllPendingCommands(): List<PendingCommand>
    
    @Query("DELETE FROM pending_commands WHERE id = :id")
    suspend fun deleteCommand(id: Long)
    
    @Query("DELETE FROM pending_commands")
    suspend fun clearPendingCommands()
    
    @Query("DELETE FROM cached_state")
    suspend fun clearCache()
}

@Database(
    entities = [CachedState::class, PendingCommand::class],
    version = 1,
    exportSchema = false
)
abstract class OfflineDatabase : RoomDatabase() {
    abstract fun cacheDao(): CacheDao
}

class OfflineManager(private val context: Context) {
    companion object {
        private const val DB_NAME = "albarq_offline.db"
    }

    private val database = Room.databaseBuilder(
        context,
        OfflineDatabase::class.java,
        DB_NAME
    ).build()

    private val dao = database.cacheDao()

    private val _isOnline = MutableStateFlow(true)
    val isOnline: StateFlow<Boolean> = _isOnline

    fun setOnlineStatus(online: Boolean) {
        _isOnline.value = online
        if (online) {
            // عند عودة الاتصال، أرسل الأوامر المعلقة
        }
    }

    suspend fun cacheState(key: String, value: String) {
        dao.insertState(CachedState(key, value))
    }

    suspend fun getCachedState(key: String): String? {
        return dao.getState(key)?.value
    }

    suspend fun getAllCachedStates(): Map<String, String> {
        return dao.getAllStates().associate { it.key to it.value }
    }

    suspend fun cacheCommand(command: String, payload: Map<String, Any>) {
        val jsonPayload = JSONObject(payload).toString()
        dao.insertCommand(PendingCommand(command = command, payload = jsonPayload))
    }

    suspend fun clearCache() {
        dao.clearCache()
        dao.clearPendingCommands()
    }

    suspend fun getStats(): OfflineStats {
        val states = dao.getAllStates()
        val commands = dao.getAllPendingCommands()
        return OfflineStats(
            cachedStates = states.size,
            pendingCommands = commands.size,
            isOnline = _isOnline.value
        )
    }
}

data class OfflineStats(
    val cachedStates: Int,
    val pendingCommands: Int,
    val isOnline: Boolean
)
