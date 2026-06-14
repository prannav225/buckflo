package com.buckflo.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import org.json.JSONObject;

public class StreakWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_streak);

        // Load data from SharedPreferences
        SharedPreferences sharedPref = context.getSharedPreferences("BuckfloWidgetPrefs", Context.MODE_PRIVATE);
        String dataStr = sharedPref.getString("widget_data", "{}");

        try {
            JSONObject data = new JSONObject(dataStr);
            int streakCount = data.optInt("streakCount", 0);
            
            views.setTextViewText(R.id.widget_streak_count, String.valueOf(streakCount));
            
            if (streakCount == 0) {
                views.setImageViewResource(R.id.widget_streak_icon, R.drawable.ic_pixel_flame_inactive);
            } else {
                views.setImageViewResource(R.id.widget_streak_icon, R.drawable.ic_pixel_flame_active);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Tap anywhere to open app
        PendingIntent appIntent = PendingIntent.getActivity(context, 20, new Intent(context, MainActivity.class), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_streak_root, appIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
