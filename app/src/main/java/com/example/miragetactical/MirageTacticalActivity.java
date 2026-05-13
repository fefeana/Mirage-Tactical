package com.example.miragetactical;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class MirageTacticalActivity extends AppCompatActivity {

    private boolean systemConnected = false;
    private TextView statusText, protocolText, routingText;
    private Button connectButton;
    private ImageView lightningIcon;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_miragetactical);

        // ربط العناصر من XML
        statusText = findViewById(R.id.statusText);
        protocolText = findViewById(R.id.protocolText);
        routingText = findViewById(R.id.routingText);
        connectButton = findViewById(R.id.connectButton);
        lightningIcon = findViewById(R.id.lightningIcon);

        // زر الاتصال والفصل
        connectButton.setOnClickListener(v -> {
            if (!systemConnected) {
                activateSystem();
            } else {
                deactivateSystem();
            }
        });
    }

    private void activateSystem() {
        systemConnected = true;
        fadeText(statusText, "Mirage Sentinel: Active", Color.GREEN);
        fadeText(protocolText, "XTLS-Reality", Color.WHITE);
        fadeText(routingText, "ACTIVE", Color.WHITE);
        connectButton.setText("SYSTEM LIVE");
        connectButton.setBackgroundColor(Color.parseColor("#A020F0")); // بنفسجي مضيء
        showLightningEffect();
    }

    private void deactivateSystem() {
        systemConnected = false;
        fadeText(statusText, "Standby / Offline", Color.RED);
        fadeText(protocolText, "Standby", Color.WHITE);
        fadeText(routingText, "OFFLINE", Color.WHITE);
        connectButton.setText("ESTABLISH LINK");
        connectButton.setBackgroundColor(Color.parseColor("#4B0082")); // بنفسجي داكن
    }

    // دالة التلاشي الناعم للنصوص
    private void fadeText(TextView textView, String newText, int newColor) {
        textView.animate().alpha(0f).setDuration(400).withEndAction(() -> {
            textView.setText(newText);
            textView.setTextColor(newColor);
            textView.animate().alpha(1f).setDuration(400).start();
        }).start();
    }

    private void showLightningEffect() {
        lightningIcon.setVisibility(View.VISIBLE);
        lightningIcon.setColorFilter(Color.parseColor("#FFD700")); // ذهبي
        lightningIcon.animate().alpha(0f).setDuration(800).withEndAction(() -> lightningIcon.setVisibility(View.GONE));
    }
}
