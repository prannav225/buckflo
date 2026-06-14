package com.buckflo.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

public class BuckfloWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId, appWidgetManager.getAppWidgetOptions(appWidgetId));
        }
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions);
        updateAppWidget(context, appWidgetManager, appWidgetId, newOptions);
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle options) {
        int minWidth = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 110);
        int minHeight = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 110);
        
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_layout);
        
        // Default to gone for tall widget sections
        views.setViewVisibility(R.id.widget_categories_container, View.GONE);
        views.setViewVisibility(R.id.widget_transactions_container, View.GONE);

        // Morph based on size
        if (minWidth > 160) {
            views.setViewVisibility(R.id.widget_categories_container, View.VISIBLE);
        }
        if (minHeight >= 100) {
            views.setViewVisibility(R.id.widget_transactions_container, View.VISIBLE);
        }

        // Load data from SharedPreferences
        SharedPreferences sharedPref = context.getSharedPreferences("BuckfloWidgetPrefs", Context.MODE_PRIVATE);
        String dataStr = sharedPref.getString("widget_data", "{}");

        try {
            JSONObject data = new JSONObject(dataStr);
            String totalSpent = data.optString("totalSpent", "₹0");
            views.setTextViewText(R.id.widget_total_spent, totalSpent);

            JSONArray categories = data.optJSONArray("topCategories");
            if (categories != null && categories.length() >= 2) {
                views.setTextViewText(R.id.widget_cat_1, categories.getString(0));
                views.setTextViewText(R.id.widget_cat_2, categories.getString(1));
            }

            JSONArray txs = data.optJSONArray("recentTransactions");
            if (txs != null) {
                if (txs.length() > 0) views.setTextViewText(R.id.widget_tx_1, txs.getString(0));
                if (txs.length() > 1) views.setTextViewText(R.id.widget_tx_2, txs.getString(1));
                if (txs.length() > 2) views.setTextViewText(R.id.widget_tx_3, txs.getString(2));
                if (txs.length() > 3) views.setTextViewText(R.id.widget_tx_4, txs.getString(3));
                if (txs.length() > 4) views.setTextViewText(R.id.widget_tx_5, txs.getString(4));
                if (txs.length() > 5) views.setTextViewText(R.id.widget_tx_6, txs.getString(5));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        // Set Deep Link Intent for the "+" button
        Intent launchIntent = new Intent(context, MainActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        launchIntent.putExtra("widget_action", "add_transaction");
        
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, launchIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_add_btn, pendingIntent);
        
        // Tap anywhere else to open app
        PendingIntent appIntent = PendingIntent.getActivity(context, 1, new Intent(context, MainActivity.class), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_root, appIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
