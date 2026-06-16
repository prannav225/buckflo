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

        // Budget widget now uses the official adaptive sleek dark background
        views.setInt(R.id.widget_root, "setBackgroundResource", R.drawable.widget_background);

        float density = context.getResources().getDisplayMetrics().density;
        int ph, pv;

        // Dynamic Padding
        if (minHeight < 90) {
            ph = (int) (16 * density);
            pv = (int) (12 * density);
        } else {
            ph = (int) (context.getResources().getDimension(R.dimen.widget_padding_horizontal));
            pv = (int) (context.getResources().getDimension(R.dimen.widget_padding_vertical));
        }
        views.setViewPadding(R.id.widget_root, ph, pv, ph, pv);

        // Hide individual transaction rows by default
        views.setViewVisibility(R.id.widget_tx_1, View.GONE);
        views.setViewVisibility(R.id.widget_tx_2, View.GONE);
        views.setViewVisibility(R.id.widget_tx_3, View.GONE);
        views.setViewVisibility(R.id.widget_tx_4, View.GONE);
        views.setViewVisibility(R.id.widget_tx_5, View.GONE);
        views.setViewVisibility(R.id.widget_tx_6, View.GONE);

        // Load data from SharedPreferences
        SharedPreferences sharedPref = context.getSharedPreferences("BuckfloWidgetPrefs", Context.MODE_PRIVATE);
        String dataStr = sharedPref.getString("widget_data", "{}");

        try {
            JSONObject data = new JSONObject(dataStr);

            // Adaptive Currency
            String totalSpentFull = data.optString("totalSpentFull", "₹0");
            String totalSpentCompact = data.optString("totalSpentCompact", "₹0");
            String totalSpentMicro = data.optString("totalSpentMicro", "₹0");
            
            String totalSpent = totalSpentFull;

            // Determine which layout to show based on height
            if (minHeight < 90) {
                // COMPACT LAYOUT (1x1, 2x1)
                views.setViewVisibility(R.id.layout_compact, View.VISIBLE);
                views.setViewVisibility(R.id.layout_standard, View.GONE);
                
                // Shorten label to save horizontal space
                views.setTextViewText(R.id.widget_label_compact, "BALANCE");

                // For tiny width, use Micro string
                if (minWidth < 120) {
                    totalSpent = totalSpentMicro;
                } else if (totalSpentFull.length() > 8) {
                    totalSpent = totalSpentCompact;
                }

                views.setTextViewText(R.id.widget_total_spent_compact, totalSpent);

            } else {
                // STANDARD LAYOUT (2x2+)
                views.setViewVisibility(R.id.layout_compact, View.GONE);
                views.setViewVisibility(R.id.layout_standard, View.VISIBLE);

                if (minWidth < 180 && totalSpentFull.length() > 8) {
                    totalSpent = totalSpentCompact;
                }

                views.setTextViewText(R.id.widget_total_spent_standard, totalSpent);

                // Progress bar
                int spentPercent = Math.max(0, Math.min(100, data.optInt("spentPercent", 0)));
                views.setViewVisibility(R.id.widget_progress_normal, View.GONE);
                views.setViewVisibility(R.id.widget_progress_danger, View.GONE);
                if (spentPercent > 85) {
                    views.setViewVisibility(R.id.widget_progress_danger, View.VISIBLE);
                    views.setProgressBar(R.id.widget_progress_danger, 100, spentPercent, false);
                } else {
                    views.setViewVisibility(R.id.widget_progress_normal, View.VISIBLE);
                    views.setProgressBar(R.id.widget_progress_normal, 100, spentPercent, false);
                }

                // Recent transactions (Show only if minHeight >= 160)
                int maxTxs = 0;
                if (minHeight >= 160 && minHeight < 220) maxTxs = 3;
                else if (minHeight >= 220) maxTxs = 6;

                if (maxTxs > 0) {
                    views.setViewVisibility(R.id.widget_transactions_container, View.VISIBLE);
                    JSONArray txs = data.optJSONArray("recentTransactions");
                    if (txs != null) {
                        if (maxTxs > 0 && txs.length() > 0) { views.setViewVisibility(R.id.widget_tx_1, View.VISIBLE); views.setTextViewText(R.id.widget_tx_1, txs.getString(0)); }
                        if (maxTxs > 1 && txs.length() > 1) { views.setViewVisibility(R.id.widget_tx_2, View.VISIBLE); views.setTextViewText(R.id.widget_tx_2, txs.getString(1)); }
                        if (maxTxs > 2 && txs.length() > 2) { views.setViewVisibility(R.id.widget_tx_3, View.VISIBLE); views.setTextViewText(R.id.widget_tx_3, txs.getString(2)); }
                        if (maxTxs > 3 && txs.length() > 3) { views.setViewVisibility(R.id.widget_tx_4, View.VISIBLE); views.setTextViewText(R.id.widget_tx_4, txs.getString(3)); }
                        if (maxTxs > 4 && txs.length() > 4) { views.setViewVisibility(R.id.widget_tx_5, View.VISIBLE); views.setTextViewText(R.id.widget_tx_5, txs.getString(4)); }
                        if (maxTxs > 5 && txs.length() > 5) { views.setViewVisibility(R.id.widget_tx_6, View.VISIBLE); views.setTextViewText(R.id.widget_tx_6, txs.getString(5)); }
                    }
                } else {
                    views.setViewVisibility(R.id.widget_transactions_container, View.GONE);
                }
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
        
        // Assign intent to both possible FABs
        views.setOnClickPendingIntent(R.id.widget_add_btn_compact, pendingIntent);
        views.setOnClickPendingIntent(R.id.widget_add_btn_standard, pendingIntent);

        // Tap widget body to open app
        PendingIntent appIntent = PendingIntent.getActivity(context, 1,
                new Intent(context, MainActivity.class),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_root, appIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
