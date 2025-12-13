package com.belcit.trading;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.IBinder;
import android.os.RemoteException;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.JavascriptInterface;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import java.util.ArrayList;
import com.getcapacitor.Plugin;

// Sunmi Printer SDK imports (if SDK is available)
// Uncomment these when you add Sunmi SDK JAR to libs/
// import woyou.aidlservice.jiuiv5.IWoyouService;
// import woyou.aidlservice.jiuiv5.ICallback;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    
    // Sunmi Printer Service connection
    // Uncomment when Sunmi SDK is added:
    // private IWoyouService woyouService;
    // private ServiceConnection connService = new ServiceConnection() {
    //     @Override
    //     public void onServiceConnected(ComponentName name, IBinder service) {
    //         woyouService = IWoyouService.Stub.asInterface(service);
    //         Log.d(TAG, "Sunmi printer service connected");
    //     }
    //     @Override
    //     public void onServiceDisconnected(ComponentName name) {
    //         woyouService = null;
    //         Log.d(TAG, "Sunmi printer service disconnected");
    //     }
    // };

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Log.d(TAG, "✅ MainActivity created - Sunmi Printer plugin will auto-register");
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        // Unbind Sunmi Printer Service (uncomment when SDK is added)
        // if (connService != null) {
        //     unbindService(connService);
        // }
    }

    @Override
    public void onStart() {
        super.onStart();
        injectPrinterInterface();
        setupMessageListener();
    }
    
    /**
     * Set up message listener for androidBridge.postMessage
     */
    private void setupMessageListener() {
        try {
            if (this.bridge != null && this.bridge.getWebView() != null) {
                WebView webView = this.bridge.getWebView();
                
                // Inject message listener
                String listenerJS = 
                    "(function() {" +
                    "  console.log('🔗 Setting up Android message listener...');" +
                    "  " +
                    "  if (window.androidBridge && window.androidBridge.addEventListener) {" +
                    "    window.androidBridge.addEventListener('message', function(event) {" +
                    "      console.log('📨 Received from Android:', event.data);" +
                    "      " +
                    "      try {" +
                    "        const data = JSON.parse(event.data);" +
                    "        if (data.action === 'printResult') {" +
                    "          console.log('🖨️ Print result:', data.success);" +
                    "        }" +
                    "      } catch (e) {" +
                    "        console.log('Non-JSON message:', event.data);" +
                    "      }" +
                    "    });" +
                    "    console.log('✅ Message listener set up');" +
                    "  }" +
                    "})();";
                
                webView.evaluateJavascript(listenerJS, null);
                Log.d(TAG, "✅ Message listener set up");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error setting up message listener", e);
        }
    }
    
    @Override
    public void onResume() {
        super.onResume();
        // Also inject on resume in case WebView wasn't ready before
        injectPrinterInterface();
    }
    
    /**
     * Inject printer interface - call this whenever WebView might be ready
     */
    private void injectPrinterInterface() {
        try {
            if (this.bridge != null && this.bridge.getWebView() != null) {
                WebView webView = this.bridge.getWebView();
                
                Log.d(TAG, "🖨️ Injecting Sunmi printer interface...");
                
            // Add JavaScript interface for Sunmi printer
            webView.addJavascriptInterface(new SunmiPrinterJSInterface(), "SunmiPrinterNative");
            Log.d(TAG, "✅ Added SunmiPrinterNative interface");
            
            // Also expose wm_print directly (common Sunmi method)
            webView.addJavascriptInterface(new SunmiPrinterJSInterface(), "wm_print");
            Log.d(TAG, "✅ Added wm_print interface");
            
            // Add androidBridge message handler
            webView.addJavascriptInterface(new SunmiPrinterJSInterface(), "androidBridgeHandler");
            Log.d(TAG, "✅ Added androidBridge message handler");
                
                // Enable JavaScript (should already be enabled, but ensure it)
                webView.getSettings().setJavaScriptEnabled(true);
                
                // Set WebViewClient to inject printer interface on page load
                webView.setWebViewClient(new WebViewClient() {
                    @Override
                    public void onPageFinished(WebView view, String url) {
                        super.onPageFinished(view, url);
                        Log.d(TAG, "📄 Page finished loading: " + url);
                        injectSunmiPrinterInterface(view);
                        
                        // Also verify interface is available
                        String verifyJS = 
                            "(function() {" +
                            "  console.log('🔍 Checking for SunmiPrinterNative...');" +
                            "  console.log('SunmiPrinterNative:', typeof window.SunmiPrinterNative, window.SunmiPrinterNative);" +
                            "  console.log('wm_print:', typeof window.wm_print, window.wm_print);" +
                            "  if (window.SunmiPrinterNative) {" +
                            "    console.log('✅ ✅ ✅ SunmiPrinterNative is available!');" +
                            "  } else {" +
                            "    console.error('❌ SunmiPrinterNative not found');" +
                            "  }" +
                            "})();";
                        view.evaluateJavascript(verifyJS, null);
                    }
                });
                
                // Also inject immediately if page is already loaded
                if (webView.getUrl() != null && !webView.getUrl().isEmpty()) {
                    injectSunmiPrinterInterface(webView);
                }
            } else {
                Log.w(TAG, "⚠️ Bridge or WebView not ready yet");
            }
        } catch (Exception e) {
            Log.e(TAG, "❌ Error injecting printer interface", e);
        }
    }

    /**
     * Inject Sunmi printer JavaScript interface into WebView
     * This makes native printer available to JavaScript
     */
    private void injectSunmiPrinterInterface(WebView webView) {
        try {
            Log.d(TAG, "🖨️ Injecting JavaScript printer interface...");
            
            // Inject JavaScript to expose printer methods and verify interface
            String js = 
                "(function() {" +
                "  console.log('🔍 Verifying SunmiPrinterNative...');" +
                "  console.log('Type:', typeof window.SunmiPrinterNative);" +
                "  console.log('Value:', window.SunmiPrinterNative);" +
                "  " +
                "  if (window.SunmiPrinterNative) {" +
                "    console.log('✅ ✅ ✅ SunmiPrinterNative is AVAILABLE!');" +
                "  } else {" +
                "    console.error('❌ SunmiPrinterNative NOT FOUND');" +
                "  }" +
                "  " +
                "  if (typeof window.wm_print === 'function') {" +
                "    console.log('✅ wm_print is available');" +
                "  } else {" +
                "    console.log('❌ wm_print not found');" +
                "  }" +
                "  " +
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
                "    console.log('✅ wmPrinter wrapper created');" +
                "  }" +
                "})();";
            
            webView.evaluateJavascript(js, null);
            Log.d(TAG, "✅ JavaScript printer interface injected");
        } catch (Exception e) {
            Log.e(TAG, "❌ Error injecting Sunmi printer interface", e);
            e.printStackTrace();
        }
    }

    /**
     * JavaScript interface for Sunmi printer
     * Bridges JavaScript calls to native Android code
     * This will use Sunmi's built-in thermal printer
     */
    public class SunmiPrinterJSInterface {
        @JavascriptInterface
        public void printText(String text) {
            Log.d(TAG, "🖨️ ===== PRINT TEXT CALLED FROM JAVASCRIPT =====");
            Log.d(TAG, "Text length: " + text.length());
            Log.d(TAG, "Text preview: " + text.substring(0, Math.min(200, text.length())));
            
            // Print immediately using runOnUiThread to ensure it executes
            final String textToPrint = text; // Final variable for inner class
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    printTextImmediate(textToPrint);
                }
            });
        }
        
        @JavascriptInterface
        public void postMessage(String message) {
            Log.d(TAG, "📨 ===== MESSAGE RECEIVED FROM JAVASCRIPT =====");
            Log.d(TAG, "Message: " + message);
            
            try {
                // Try to parse as JSON
                if (message.startsWith("{")) {
                    // Handle JSON messages
                    if (message.contains("\"action\":\"print\"") || 
                        message.contains("\"command\":\"printText\"") || 
                        message.contains("\"type\":\"PRINT_TEXT\"") || 
                        message.contains("\"method\":\"print\"")) {
                        
                        Log.d(TAG, "🖨️ Print message detected!");
                        
                        // Extract text from JSON (simple approach)
                        String textToPrint = extractTextFromJson(message);
                        if (!textToPrint.isEmpty()) {
                            Log.d(TAG, "Extracted text: " + textToPrint.substring(0, Math.min(100, textToPrint.length())));
                            printTextImmediate(textToPrint);
                        }
                        return;
                    }
                } else if (message.startsWith("PRINT:")) {
                    // Handle simple PRINT: format
                    String textToPrint = message.substring(6); // Remove "PRINT:"
                    Log.d(TAG, "🖨️ Simple print command detected!");
                    printTextImmediate(textToPrint);
                    return;
                }
                
                Log.w(TAG, "Unknown message format: " + message);
            } catch (Exception e) {
                Log.e(TAG, "Error processing message", e);
            }
        }
        
        private String extractTextFromJson(String json) {
            // Simple JSON parsing without external libraries
            try {
                if (json.contains("\"text\":\"")) {
                    int start = json.indexOf("\"text\":\"") + 8;
                    int end = json.indexOf("\"", start);
                    if (end > start) return json.substring(start, end).replace("\\n", "\n");
                }
                if (json.contains("\"data\":\"")) {
                    int start = json.indexOf("\"data\":\"") + 8;
                    int end = json.indexOf("\"", start);
                    if (end > start) return json.substring(start, end).replace("\\n", "\n");
                }
                if (json.contains("\"payload\":\"")) {
                    int start = json.indexOf("\"payload\":\"") + 11;
                    int end = json.indexOf("\"", start);
                    if (end > start) return json.substring(start, end).replace("\\n", "\n");
                }
                if (json.contains("\"content\":\"")) {
                    int start = json.indexOf("\"content\":\"") + 11;
                    int end = json.indexOf("\"", start);
                    if (end > start) return json.substring(start, end).replace("\\n", "\n");
                }
            } catch (Exception e) {
                Log.e(TAG, "JSON parsing error", e);
            }
            return "";
        }
        
        private void printTextImmediate(String text) {
            Log.d(TAG, "🖨️ ===== PRINTING TO SUNMI V2 PRO THERMAL PRINTER =====");
            Log.d(TAG, "Text length: " + text.length());
            Log.d(TAG, "Text: " + text);
            
            // Method 1: Direct Sunmi V2 Pro thermal printer approach
            boolean printed = false;
            
            // Try direct serial/USB thermal printer access
            try {
                Log.d(TAG, "Attempting direct thermal printer access...");
                
                // Common thermal printer device paths on Sunmi devices
                String[] printerPaths = {
                    "/dev/ttyUSB0",    // USB thermal printer
                    "/dev/ttyS0",      // Serial thermal printer
                    "/dev/ttyS1",      // Alternative serial
                    "/sys/class/thermal_printer/print", // Sunmi specific
                    "/dev/sunmi_printer" // Sunmi device file
                };
                
                for (String path : printerPaths) {
                    try {
                        Log.d(TAG, "Trying printer path: " + path);
                        java.io.File printerDevice = new java.io.File(path);
                        
                        if (printerDevice.exists()) {
                            Log.d(TAG, "✅ Found printer device: " + path);
                            
                            // Try to write directly to the device
                            java.io.FileOutputStream fos = new java.io.FileOutputStream(printerDevice);
                            fos.write(text.getBytes("UTF-8"));
                            fos.flush();
                            fos.close();
                            
                            Log.d(TAG, "✅ ✅ ✅ PRINTED TO THERMAL PRINTER VIA " + path + " ✅ ✅ ✅");
                            printed = true;
                            break;
                        } else {
                            Log.d(TAG, "Printer device not found: " + path);
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Failed to write to " + path + ": " + e.getMessage());
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Direct printer access error", e);
            }
            
            if (printed) {
                Log.d(TAG, "🎉 Successfully printed via direct access!");
                return;
            }
            
            Log.w(TAG, "Direct thermal printer access failed, trying SDK approach...");
            
            // Method 1: Try using Sunmi Printer SDK via AIDL service
            // This is the proper way to access Sunmi V2 Pro's built-in thermal printer
            try {
                Intent intent = new Intent();
                intent.setPackage("woyou.aidlservice.jiuiv5");
                intent.setAction("woyou.aidlservice.jiuiv5.IWoyouService");
                
                // Try to bind and print
                ServiceConnection printService = new ServiceConnection() {
                    @Override
                    public void onServiceConnected(ComponentName name, IBinder service) {
                        try {
                            // Use reflection to call Sunmi SDK methods
                            // This works even without the SDK JAR if the service is available
                            Class<?> stubClass = Class.forName("woyou.aidlservice.jiuiv5.IWoyouService$Stub");
                            Object woyouService = stubClass.getMethod("asInterface", IBinder.class).invoke(null, service);
                            
                            // Call printText method
                            woyouService.getClass().getMethod("printText", String.class, 
                                Class.forName("woyou.aidlservice.jiuiv5.ICallback")).invoke(woyouService, text, null);
                            
                            Log.d(TAG, "✅ ✅ ✅ PRINTED VIA SUNMI SDK ✅ ✅ ✅");
                            // Note: Not unbinding service to avoid compilation issues
                            // The service will be unbound when the activity is destroyed
                            return; // Success - exit early
                        } catch (Exception e) {
                            Log.e(TAG, "❌ Sunmi SDK print error", e);
                            Log.e(TAG, "Error message: " + e.getMessage());
                            e.printStackTrace();
                            // Fall through to other methods
                        }
                    }
                    
                    @Override
                    public void onServiceDisconnected(ComponentName name) {
                        Log.d(TAG, "Sunmi printer service disconnected");
                    }
                };
                
                if (bindService(intent, printService, Context.BIND_AUTO_CREATE)) {
                    Log.d(TAG, "✅ Bound to Sunmi printer service");
                    // Service will print in onServiceConnected
                    return;
                } else {
                    Log.w(TAG, "⚠️ Could not bind to Sunmi printer service");
                }
            } catch (Exception e) {
                Log.e(TAG, "Sunmi SDK binding error", e);
            }
            
            // Method 2: Try using Android Intent with Sunmi package
            try {
                Intent printIntent = new Intent();
                printIntent.setAction("android.intent.action.SEND");
                printIntent.setType("text/plain");
                printIntent.putExtra(Intent.EXTRA_TEXT, text);
                printIntent.setPackage("woyou.aidlservice.jiuiv5");
                printIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(printIntent);
                Log.d(TAG, "✅ Sent print intent to Sunmi service");
            } catch (Exception e) {
                Log.e(TAG, "Print intent error", e);
            }
            
            // Method 3: Use Android PrintManager (system print)
            // This will show print dialog but works as fallback
            try {
                android.print.PrintManager printManager = (android.print.PrintManager) getSystemService(Context.PRINT_SERVICE);
                if (printManager != null) {
                    android.print.PrintDocumentAdapter adapter = new android.print.PrintDocumentAdapter() {
                        @Override
                        public void onWrite(android.print.PageRange[] pages, android.os.ParcelFileDescriptor destination, 
                                          android.os.CancellationSignal cancellationSignal, 
                                          android.print.PrintDocumentAdapter.WriteResultCallback callback) {
                            try (java.io.FileOutputStream fos = new java.io.FileOutputStream(destination.getFileDescriptor())) {
                                fos.write(text.getBytes("UTF-8"));
                                callback.onWriteFinished(new android.print.PageRange[]{android.print.PageRange.ALL_PAGES});
                                Log.d(TAG, "✅ Wrote print data");
                            } catch (Exception e) {
                                Log.e(TAG, "Write error", e);
                                callback.onWriteFailed(null);
                            }
                        }
                        
                        @Override
                        public void onLayout(android.print.PrintAttributes oldAttributes, android.print.PrintAttributes newAttributes,
                                           android.os.CancellationSignal cancellationSignal,
                                           android.print.PrintDocumentAdapter.LayoutResultCallback callback,
                                           android.os.Bundle metadata) {
                            android.print.PrintDocumentInfo info = new android.print.PrintDocumentInfo.Builder("Receipt")
                                .setContentType(android.print.PrintDocumentInfo.CONTENT_TYPE_UNKNOWN)
                                .setPageCount(1)
                                .build();
                            callback.onLayoutFinished(info, true);
                        }
                    };
                    
                    android.print.PrintJob printJob = printManager.print("Receipt", adapter, 
                        new android.print.PrintAttributes.Builder()
                            .setMediaSize(android.print.PrintAttributes.MediaSize.ISO_A4)
                            .setMinMargins(android.print.PrintAttributes.Margins.NO_MARGINS)
                            .build());
                    Log.d(TAG, "✅ Created system print job");
                }
            } catch (Exception e) {
                Log.e(TAG, "System print error", e);
            }
        }
        
        @JavascriptInterface
        public void printRaw(String data) {
            Log.d(TAG, "Print raw data called from JavaScript, length: " + data.length());
            
            // Try Sunmi SDK raw printing (if available)
            // Uncomment when Sunmi SDK is added:
            // try {
            //     if (woyouService != null) {
            //         byte[] rawData = android.util.Base64.decode(data, android.util.Base64.DEFAULT);
            //         woyouService.sendRawData(rawData, null);
            //         Log.d(TAG, "✅ Sent raw data via Sunmi SDK");
            //         return;
            //     }
            // } catch (Exception e) {
            //     Log.e(TAG, "Raw print error", e);
            // }
            
            // Fallback: decode and print as text
            try {
                byte[] rawData = android.util.Base64.decode(data, android.util.Base64.DEFAULT);
                String text = new String(rawData, "UTF-8");
                printText(text);
            } catch (Exception e) {
                Log.e(TAG, "Raw data decode error", e);
            }
        }
        
        // Support for wm_print() function call
        @JavascriptInterface
        public void wm_print(String text) {
            printText(text);
        }
    }
}
