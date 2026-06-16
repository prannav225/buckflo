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
            updateAppWidget(context, appWidgetManager, appWidgetId, appWidgetManager.getAppWidgetOptions(appWidgetId));
        }
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, android.os.Bundle newOptions) {
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions);
        updateAppWidget(context, appWidgetManager, appWidgetId, newOptions);
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId, android.os.Bundle options) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_streak);
        
        int minHeight = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 40);
        int minWidth = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 40);
        float density = context.getResources().getDisplayMetrics().density;

        // Adaptive visibility based on widget height/width
        if (minHeight < 80) {
            // Micro: Just flame and numbers. Padding tightened.
            views.setViewPadding(R.id.widget_streak_root, (int)(16*density), (int)(12*density), (int)(16*density), (int)(12*density));
            views.setViewVisibility(R.id.widget_streak_heatmap_container, android.view.View.GONE);
        } else {
            // Full: Flame + numbers + Heatmap
            int ph = (int) context.getResources().getDimension(R.dimen.widget_padding_horizontal);
            int pv = (int) context.getResources().getDimension(R.dimen.widget_padding_vertical);
            views.setViewPadding(R.id.widget_streak_root, ph, pv, ph, pv);
            views.setViewVisibility(R.id.widget_streak_heatmap_container, android.view.View.VISIBLE);
            
            // If it's quite wide, we can optionally hide day labels to save vertical space if it's tight
            if (minHeight < 110) {
                views.setViewVisibility(R.id.widget_streak_day_labels, android.view.View.GONE);
            } else {
                views.setViewVisibility(R.id.widget_streak_day_labels, android.view.View.VISIBLE);
            }
        }

        // Streak widget uses the dark/surface card background (like Savings Wallet)
        views.setInt(R.id.widget_streak_root, "setBackgroundResource", R.drawable.widget_background);

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

            // Parse last7Days and last7DayNames for Pixel Heatmap
            org.json.JSONArray last7Days = data.optJSONArray("last7Days");
            org.json.JSONArray last7DayNames = data.optJSONArray("last7DayNames");
            
            if (last7Days != null && last7Days.length() >= 7) {
                int[] dayIds = {
                    R.id.widget_streak_day_1, R.id.widget_streak_day_2,
                    R.id.widget_streak_day_3, R.id.widget_streak_day_4,
                    R.id.widget_streak_day_5, R.id.widget_streak_day_6,
                    R.id.widget_streak_day_7
                };
                int[] labelIds = {
                    R.id.widget_streak_label_1, R.id.widget_streak_label_2,
                    R.id.widget_streak_label_3, R.id.widget_streak_label_4,
                    R.id.widget_streak_label_5, R.id.widget_streak_label_6,
                    R.id.widget_streak_label_7
                };
                
                for (int i = 0; i < 7; i++) {
                    boolean active = last7Days.optBoolean(i, false);
                    views.setImageViewResource(dayIds[i], active ? R.drawable.widget_pixel_active : R.drawable.widget_pixel_inactive);
                    
                    if (last7DayNames != null && last7DayNames.length() > i) {
                        views.setTextViewText(labelIds[i], last7DayNames.getString(i));
                    }
                }
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
