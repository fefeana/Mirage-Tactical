java
package com.yourproject.workflow;

public class DeploymentWorkflow {

    // مرحلة البناء
    public static void build() {
        System.out.println("🔧 بناء المشروع...");
        runCommand("./gradlew build");
    }

    // مرحلة الاختبار
    public static void test() {
        System.out.println("🧪 تشغيل الاختبارات...");
        runCommand("./gradlew test");
    }

    // نشر عبر Firebase
    public static void deployFirebase() {
        System.out.println("🚀 نشر التطبيق عبر Firebase...");
        runCommand("firebase deploy");
    }

    // نشر عبر Google Cloud
    public static void deployGoogleCloud() {
        System.out.println("☁️ نشر التطبيق عبر Google Cloud...");
        runCommand("gcloud app deploy");
    }

    // نشر عبر GitHub Actions
    public static void deployGitHubActions() {
        System.out.println("🐙 تشغيل GitHub Actions Workflow...");
        runCommand("curl -X POST -H \"Authorization: token YOURGITHUBTOKEN\" "
                 + "https://api.github.com/repos/USERNAME/REPO/actions/workflows/deploy.yml/dispatches "
                 + "-d '{\"ref\":\"main\"}'");
    }

    // أداة مساعدة لتشغيل أوامر النظام
    private static void runCommand(String command) {
        try {
            Process process = Runtime.getRuntime().exec(command);
            process.waitFor();
            System.out.println("✔️ الأمر اكتمل: " + command);
        } catch (Exception e) {
            System.out.println("❌ خطأ أثناء تنفيذ: " + command);
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        build();
        test();
        // اختاري الخدمة المناسبة وقت التنفيذ
        deployFirebase();
        // أو
        deployGoogleCloud();
        // أو
        deployGitHubActions();
        System.out.println("✨ Workflow اكتمل بنجاح!");
    }
}
