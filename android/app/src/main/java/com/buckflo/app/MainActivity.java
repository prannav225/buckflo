package com.buckflo.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Disable the native Android WebView scrollbars that ignore CSS
        this.bridge.getWebView().setVerticalScrollBarEnabled(false);
        this.bridge.getWebView().setHorizontalScrollBarEnabled(false);
    }
}
