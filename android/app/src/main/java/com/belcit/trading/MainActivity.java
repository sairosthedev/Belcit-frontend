package com.belcit.trading;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.JavascriptInterface;
import android.util.Log;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onStart() {
        super.onStart();
        
        // Inject Sunmi printer JavaScript interface after bridge is ready
        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebView webView = this.bridge.getWebView();
            
            // Add JavaScript interface for Sunmi printer
            webView.addJavascriptInterface(new SunmiPrinterJSInterface(), "SunmiPrinterNative");
            
            // Set WebViewClient to inject printer interface on page load
            webView.setWebViewClient(new WebViewClient() {
                @Override
                public void onPageFinished(WebView view, String url) {
                    super.onPageFinished(view, url);
                    injectSunmiPrinterInterface(view);
                }
            });
        }
    }

    /**
     * Inject Sunmi printer JavaScript interface into WebView
     * This makes native printer available to JavaScript
     */
    private void injectSunmiPrinterInterface(WebView webView) {
        try {
            // Inject JavaScript to expose printer methods
            String js = 
                "(function() {" +
                "  if (typeof window.wmPrinter === 'undefined') {" +
                "    window.wmPrinter = {" +
                "      printText: function(text) {" +
                "        if (window.SunmiPrinterNative) {" +
                "          window.SunmiPrinterNative.printText(text);" +
                "        } else {" +
                "          console.warn('SunmiPrinterNative not available');" +
                "        }" +
                "      }," +
                "      print: function(text) {" +
                "        this.printText(text);" +
                "      }," +
                "      sendRawData: function(data) {" +
                "        if (window.SunmiPrinterNative) {" +
                "          window.SunmiPrinterNative.printRaw(data);" +
                "        }" +
                "      }" +
                "    };" +
                "    console.log('✅ Sunmi printer interface injected');" +
                "  }" +
                "})();";
            
            webView.evaluateJavascript(js, null);
            Log.d(TAG, "Sunmi printer interface injected into WebView");
        } catch (Exception e) {
            Log.e(TAG, "Error injecting Sunmi printer interface", e);
        }
    }

    /**
     * JavaScript interface for Sunmi printer
     * Bridges JavaScript calls to native Android code
     */
    public static class SunmiPrinterJSInterface {
        @JavascriptInterface
        public void printText(String text) {
            Log.d(TAG, "Print text called from JavaScript: " + text.substring(0, Math.min(100, text.length())));
            
            // TODO: Implement actual Sunmi SDK printing here
            // This requires Sunmi Printer SDK dependency
            // For now, log it - you'll need to add Sunmi SDK to build.gradle
            
            // Example implementation (requires Sunmi SDK):
            // try {
            //     woyouService.printText(text, null);
            // } catch (Exception e) {
            //     Log.e(TAG, "Print error", e);
            // }
        }
        
        @JavascriptInterface
        public void printRaw(String data) {
            Log.d(TAG, "Print raw data called from JavaScript");
            // TODO: Implement ESC/POS raw printing
        }
    }
}
