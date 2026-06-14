package com.buckflo.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.Intent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetData")
public class WidgetDataPlugin extends Plugin {

    @PluginMethod
    public void setWidgetData(PluginCall call) {
        String data = call.getString("data", "{}");

        SharedPreferences sharedPref = getContext().getSharedPreferences("BuckfloWidgetPrefs", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString("widget_data", data);
        editor.apply();

        // Broadcast an update to BuckfloWidgetProvider
        Intent intent = new Intent(getContext(), BuckfloWidgetProvider.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        int[] ids = AppWidgetManager.getInstance(getContext())
                .getAppWidgetIds(new ComponentName(getContext(), BuckfloWidgetProvider.class));
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        getContext().sendBroadcast(intent);
        
        // Broadcast an update to StreakWidgetProvider
        Intent streakIntent = new Intent(getContext(), StreakWidgetProvider.class);
        streakIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        int[] streakIds = AppWidgetManager.getInstance(getContext())
                .getAppWidgetIds(new ComponentName(getContext(), StreakWidgetProvider.class));
        streakIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, streakIds);
        getContext().sendBroadcast(streakIntent);

        call.resolve();
    }

    @PluginMethod
    public void checkIntent(PluginCall call) {
        Intent intent = getActivity().getIntent();
        String action = intent.getStringExtra("widget_action");
        String category = intent.getStringExtra("widget_category");
        if (action != null) {
            // Clear it so it doesn't trigger again on rotation
            intent.removeExtra("widget_action");
            if (category != null) intent.removeExtra("widget_category");
            
            JSObject ret = new JSObject();
            ret.put("action", action);
            if (category != null) ret.put("category", category);
            call.resolve(ret);
        } else {
            call.resolve(new JSObject());
        }
    }
}
