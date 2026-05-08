-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# إخفاء أسماء الكلاسات الأمنية (Naming Obfuscation)
-repackageclasses ''
-keep class !com.mirage.vpn.core.MirageSecurity { *; }

-keep class com.mirage.vpn.core.MirageSecurity {
    public static *** encrypt(java.lang.String);
    public static *** decrypt(java.lang.String);
    public static *** validateApiKey(java.lang.String);
}
