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

        // Dynamic padding and sizing
        if (minHeight < 70) {
            views.setViewPadding(R.id.widget_streak_root, (int)(12*density), (int)(8*density), (int)(12*density), (int)(8*density));
            views.setTextViewTextSize(R.id.widget_streak_count, android.util.TypedValue.COMPLEX_UNIT_SP, 24);
        } else {
            int ph = (int) context.getResources().getDimension(R.dimen.widget_padding_horizontal);
            int pv = (int) context.getResources().getDimension(R.dimen.widget_padding_vertical);
            views.setViewPadding(R.id.widget_streak_root, ph, pv, ph, pv);
            views.setTextViewTextSize(R.id.widget_streak_count, android.util.TypedValue.COMPLEX_UNIT_SP, 32);
        }
        
        // Show extra content on taller widgets
        if (minHeight >= 100) {
            views.setViewVisibility(R.id.widget_streak_extra_container, android.view.View.VISIBLE);
        } else {
            views.setViewVisibility(R.id.widget_streak_extra_container, android.view.View.GONE);
        }

        // Show weekly progress on large square widgets (2x2 or bigger)
        if (minHeight >= 100 && minWidth >= 110) {
            views.setViewVisibility(R.id.widget_streak_weekly_container, android.view.View.VISIBLE);
        } else {
            views.setViewVisibility(R.id.widget_streak_weekly_container, android.view.View.GONE);
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
                views.setTextViewText(R.id.widget_streak_message, "Start your journey today! Log an expense to begin your streak.");
                views.setTextViewText(R.id.widget_streak_dot, "○");
                views.setTextColor(R.id.widget_streak_dot, context.getColor(R.color.widget_text_label));
                // Remove glow in inactive state
                views.setInt(R.id.widget_streak_icon_container, "setBackgroundResource", R.drawable.widget_pill_bg);
            } else {
                views.setImageViewResource(R.id.widget_streak_icon, R.drawable.ic_pixel_flame_active);
                String msg = streakCount > 5 ? "You're on fire! " + streakCount + " days and counting." : "Great job! Keep the momentum going.";
                views.setTextViewText(R.id.widget_streak_message, msg);
                views.setTextViewText(R.id.widget_streak_dot, "●");
                views.setTextColor(R.id.widget_streak_dot, context.getColor(R.color.widget_success));
                
                // Add a glowing background to the fire icon when active
                views.setInt(R.id.widget_streak_icon_container, "setBackgroundResource", R.drawable.widget_accent_card);
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
