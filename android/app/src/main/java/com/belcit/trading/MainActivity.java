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
        
        // Bind to Sunmi Printer Service (uncomment when SDK is added)
        // try {
        //     Intent intent = new Intent();
        //     intent.setPackage("woyou.aidlservice.jiuiv5");
        //     intent.setAction("woyou.aidlservice.jiuiv5.IWoyouService");
        //     bindService(intent, connService, Context.BIND_AUTO_CREATE);
        // } catch (Exception e) {
        //     Log.e(TAG, "Failed to bind Sunmi printer service", e);
        // }
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        // Unbind Sunmi Printer Service (uncomment when SDK is added)
        // if (connService != null) {
        //     unbindService(connService);
        // }
    }

    @Override
    public void onStart() {
        super.onStart();
        
        // Inject Sunmi printer JavaScript interface after bridge is ready
        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebView webView = this.bridge.getWebView();
            
            // Add JavaScript interface for Sunmi printer
            webView.addJavascriptInterface(new SunmiPrinterJSInterface(), "SunmiPrinterNative");
            
            // Also expose wm_print directly (common Sunmi method)
            webView.addJavascriptInterface(new SunmiPrinterJSInterface(), "wm_print");
            
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
        
        private void printTextImmediate(String text) {
            Log.d(TAG, "🖨️ printTextImmediate called on UI thread");
            
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
                            // Don't unbind immediately - let it finish printing
                            new android.os.Handler().postDelayed(new Runnable() {
                                @Override
                                public void run() {
                                    unbindService(printService);
                                }
                            }, 2000);
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
                                .setContentType(android.print.PrintDocumentInfo.CONTENT_TYPE_TEXT)
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
