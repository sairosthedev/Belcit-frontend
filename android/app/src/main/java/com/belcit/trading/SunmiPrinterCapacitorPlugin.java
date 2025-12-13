package com.belcit.trading;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.os.RemoteException;
import android.util.Log;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Capacitor Plugin for Sunmi V2 Pro Thermal Printer
 * This properly connects to Sunmi's Print Service
 */
@CapacitorPlugin(name = "SunmiPrinter")
public class SunmiPrinterCapacitorPlugin extends Plugin {
    
    private static final String TAG = "SunmiPrinter";
    private Object woyouService = null;
    private boolean isServiceConnected = false;
    
    // Service connection for Sunmi Print Service
    private ServiceConnection serviceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            try {
                // Use reflection to avoid needing SDK JAR
                Class<?> stubClass = Class.forName("woyou.aidlservice.jiuiv5.IWoyouService$Stub");
                woyouService = stubClass.getMethod("asInterface", IBinder.class).invoke(null, service);
                isServiceConnected = true;
                Log.d(TAG, "✅ Connected to Sunmi Print Service");
            } catch (Exception e) {
                Log.e(TAG, "Failed to connect to print service", e);
                isServiceConnected = false;
            }
        }
        
        @Override
        public void onServiceDisconnected(ComponentName name) {
            woyouService = null;
            isServiceConnected = false;
            Log.d(TAG, "Disconnected from Sunmi Print Service");
        }
    };
    
    @Override
    public void load() {
        super.load();
        connectToPrintService();
    }
    
    /**
     * Connect to Sunmi Print Service
     */
    private void connectToPrintService() {
        try {
            Intent intent = new Intent();
            intent.setPackage("woyou.aidlservice.jiuiv5");
            intent.setAction("woyou.aidlservice.jiuiv5.IWoyouService");
            
            boolean bound = getContext().bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE);
            if (bound) {
                Log.d(TAG, "✅ Binding to Sunmi Print Service...");
            } else {
                Log.e(TAG, "❌ Failed to bind to Sunmi Print Service");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error binding to print service", e);
        }
    }
    
    /**
     * Print text to thermal printer
     */
    @PluginMethod
    public void printText(PluginCall call) {
        String text = call.getString("text");
        if (text == null || text.isEmpty()) {
            call.reject("Text is required");
            return;
        }
        
        if (!isServiceConnected || woyouService == null) {
            Log.e(TAG, "❌ Print service not connected");
            call.reject("Printer service not available");
            return;
        }
        
        try {
            Log.d(TAG, "🖨️ Printing text: " + text.substring(0, Math.min(100, text.length())));
            
            // Call printText via reflection
            woyouService.getClass().getMethod("printText", String.class, 
                Class.forName("woyou.aidlservice.jiuiv5.ICallback"))
                .invoke(woyouService, text, null);
            
            // Add some line feeds
            woyouService.getClass().getMethod("lineWrap", int.class,
                Class.forName("woyou.aidlservice.jiuiv5.ICallback"))
                .invoke(woyouService, 3, null);
                
            Log.d(TAG, "✅ ✅ ✅ PRINTED TO SUNMI THERMAL PRINTER ✅ ✅ ✅");
            call.resolve();
            
        } catch (Exception e) {
            Log.e(TAG, "❌ Print error", e);
            e.printStackTrace();
            call.reject("Print failed: " + e.getMessage());
        }
    }
    
    /**
     * Check if printer is available
     */
    @PluginMethod
    public void isAvailable(PluginCall call) {
        call.resolve(new com.getcapacitor.JSObject().put("available", isServiceConnected));
    }
}
