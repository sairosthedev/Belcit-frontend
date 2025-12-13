package com.belcit.trading;

import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.util.Log;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Sunmi Printer Plugin for Capacitor
 * Provides native printing access to Sunmi V2 Pro thermal printer
 */
@CapacitorPlugin(name = "SunmiPrinter")
public class SunmiPrinterPlugin extends Plugin {

    private static final String TAG = "SunmiPrinterPlugin";

    @PluginMethod
    public void printText(PluginCall call) {
        String text = call.getString("text", "");
        if (text.isEmpty()) {
            call.reject("Text is required");
            return;
        }

        try {
            // Use Sunmi Printer SDK
            // This will be injected into WebView via JavaScript interface
            Log.d(TAG, "Printing text: " + text.substring(0, Math.min(50, text.length())));
            
            // The actual printing will be handled by JavaScript interface
            // injected into WebView
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Print error", e);
            call.reject("Print failed: " + e.getMessage());
        }
    }

    /**
     * JavaScript interface for Sunmi printer
     * This will be available as window.SunmiPrinterNative in WebView
     */
    public static class SunmiPrinterJSInterface {
        @JavascriptInterface
        public void printText(String text) {
            Log.d(TAG, "JavaScript printText called: " + text.substring(0, Math.min(50, text.length())));
            // This will be implemented to call Sunmi SDK
            // For now, log it - actual implementation needs Sunmi SDK
        }
    }
}

