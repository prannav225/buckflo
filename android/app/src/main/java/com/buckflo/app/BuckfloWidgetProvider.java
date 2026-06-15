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

        // Budget widget now uses the official orange accent card background
        views.setInt(R.id.widget_root, "setBackgroundResource", R.drawable.widget_accent_card);

        float density = context.getResources().getDisplayMetrics().density;
        int ph, pv;

        // Dynamic adjustments based on widget height
        if (minHeight < 70) {
            // Micro mode (very short 1x* widgets)
            ph = (int) (12 * density);
            pv = (int) (4 * density);
            views.setViewPadding(R.id.widget_root, ph, pv, ph, pv);
            views.setTextViewTextSize(R.id.widget_total_spent, android.util.TypedValue.COMPLEX_UNIT_SP, 20);
            views.setViewVisibility(R.id.widget_header, View.VISIBLE); // Show header (add button) if possible
            views.setViewVisibility(R.id.widget_label, View.GONE); // Hide label text in micro to save space
            views.setViewVisibility(R.id.widget_spent_label, View.GONE);
            views.setViewVisibility(R.id.widget_progress_container, View.GONE);
        } else if (minHeight < 110) {
            // Compact mode (1x* or 2x1 widgets)
            ph = (int) (16 * density);
            pv = (int) (8 * density);
            views.setViewPadding(R.id.widget_root, ph, pv, ph, pv);
            views.setTextViewTextSize(R.id.widget_total_spent, android.util.TypedValue.COMPLEX_UNIT_SP, 24);
            views.setViewVisibility(R.id.widget_header, View.VISIBLE);
            views.setViewVisibility(R.id.widget_label, View.VISIBLE);
            views.setViewVisibility(R.id.widget_spent_label, View.VISIBLE);
            views.setViewVisibility(R.id.widget_progress_container, View.VISIBLE);
        } else {
            // Standard mode (2x2, 4x2 etc.)
            ph = (int) (context.getResources().getDimension(R.dimen.widget_padding_horizontal));
            pv = (int) (context.getResources().getDimension(R.dimen.widget_padding_vertical));
            views.setViewPadding(R.id.widget_root, ph, pv, ph, pv);
            views.setTextViewTextSize(R.id.widget_total_spent, android.util.TypedValue.COMPLEX_UNIT_SP, 28);
            views.setViewVisibility(R.id.widget_header, View.VISIBLE);
            views.setViewVisibility(R.id.widget_label, View.VISIBLE);
            views.setViewVisibility(R.id.widget_spent_label, View.VISIBLE);
            views.setViewVisibility(R.id.widget_progress_container, View.VISIBLE);
        }

        // Default to gone for sections only shown on larger sizes
        views.setViewVisibility(R.id.widget_categories_container, View.GONE);
        views.setViewVisibility(R.id.widget_transactions_container, View.GONE);
        views.setViewVisibility(R.id.widget_progress_fill, View.GONE);

        // Show categories on wide widgets or tall widgets
        if (minWidth > 160 || minHeight >= 110) {
            views.setViewVisibility(R.id.widget_categories_container, View.VISIBLE);
        }
        // Show recent transactions on tall widgets
        if (minHeight >= 160) {
            views.setViewVisibility(R.id.widget_transactions_container, View.VISIBLE);
        }

        // Load data from SharedPreferences
        SharedPreferences sharedPref = context.getSharedPreferences("BuckfloWidgetPrefs", Context.MODE_PRIVATE);
        String dataStr = sharedPref.getString("widget_data", "{}");

        try {
            JSONObject data = new JSONObject(dataStr);

            // Total spent
            String totalSpent = data.optString("totalSpent", "₹0");
            views.setTextViewText(R.id.widget_total_spent, totalSpent);

            // Top categories
            JSONArray categories = data.optJSONArray("topCategories");
            if (categories != null && categories.length() >= 1) {
                views.setTextViewText(R.id.widget_cat_1, categories.getString(0));
            }
            if (categories != null && categories.length() >= 2) {
                views.setTextViewText(R.id.widget_cat_2, categories.getString(1));
            }

            // Recent transactions
            JSONArray txs = data.optJSONArray("recentTransactions");
            if (txs != null) {
                if (txs.length() > 0) views.setTextViewText(R.id.widget_tx_1, txs.getString(0));
                if (txs.length() > 1) views.setTextViewText(R.id.widget_tx_2, txs.getString(1));
                if (txs.length() > 2) views.setTextViewText(R.id.widget_tx_3, txs.getString(2));
                if (txs.length() > 3) views.setTextViewText(R.id.widget_tx_4, txs.getString(3));
                if (txs.length() > 4) views.setTextViewText(R.id.widget_tx_5, txs.getString(4));
                if (txs.length() > 5) views.setTextViewText(R.id.widget_tx_6, txs.getString(5));
            }

            // Progress bar: show fill only when budget is set (spentPercent > 0)
            int spentPercent = Math.max(0, Math.min(100, data.optInt("spentPercent", 0)));
            if (spentPercent > 0) {
                views.setViewVisibility(R.id.widget_progress_fill, View.VISIBLE);
                // Pick danger vs normal fill
                int fillDrawable = spentPercent > 85
                        ? R.drawable.widget_progress_fill_danger
                        : R.drawable.widget_progress_fill;
                views.setImageViewResource(R.id.widget_progress_fill, fillDrawable);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        // "+" button: launch add transaction
        Intent launchIntent = new Intent(context, MainActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        launchIntent.putExtra("widget_action", "add_transaction");
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_add_btn, pendingIntent);

        // Tap widget body to open app
        PendingIntent appIntent = PendingIntent.getActivity(context, 1,
                new Intent(context, MainActivity.class),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_root, appIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
