/**
 * Sunmi Printer Debug Utility
 * Use this to test and debug printing on Sunmi devices
 */

export function debugSunmiPrinter() {
  if (typeof window === 'undefined') {
    console.log('Not in browser environment');
    return;
  }

  console.log('=== Sunmi Printer Debug Info ===');
  console.log('User Agent:', navigator.userAgent);
  console.log('Vendor:', navigator.vendor);
  
  const isSunmi = /sunmi/i.test(navigator.userAgent) || 
                  /sunmi/i.test(navigator.vendor) ||
                  window.navigator.userAgent.includes("Sunmi");
  console.log('Is Sunmi Device:', isSunmi);
  
  console.log('\n=== Available SDKs ===');
  console.log('window.wm_print:', typeof window.wm_print, window.wm_print);
  console.log('window.wwise:', typeof window.wwise, window.wwise);
  console.log('window.SunmiPrinter:', typeof window.SunmiPrinter, window.SunmiPrinter);
  console.log('window.sunmi:', typeof window.sunmi, window.sunmi);
  console.log('window.Android:', typeof window.Android, window.Android);
  console.log('window.Printer:', typeof window.Printer, window.Printer);
  
  // Test print function - Enhanced version (overrides any existing one)
  // Use async to ensure it's the latest version
  (window as any).testSunmiPrint = async function(text: string = 'TEST PRINT\nBELCIT TRADING\n' + new Date().toLocaleString() + '\n\n') {
    console.log('🧪 ===== TESTING SUNMI PRINT =====');
    console.log('Testing print with text:', text);
    
    // Check for SunmiPrinterNative first (injected from Android MainActivity)
    if ((window as any).SunmiPrinterNative) {
      console.log('✅ Found SunmiPrinterNative (injected from Android)');
      try {
        if (typeof (window as any).SunmiPrinterNative.printText === 'function') {
          console.log('Trying SunmiPrinterNative.printText...');
          (window as any).SunmiPrinterNative.printText(text);
          console.log('✅ ✅ ✅ SunmiPrinterNative.printText() called successfully!');
          console.log('Check your printer - receipt should print now!');
          return;
        } else if (typeof (window as any).SunmiPrinterNative === 'function') {
          console.log('Trying SunmiPrinterNative as function...');
          (window as any).SunmiPrinterNative(text);
          console.log('✅ ✅ ✅ SunmiPrinterNative() called successfully!');
          return;
        }
      } catch (e: any) {
        console.error('❌ SunmiPrinterNative error:', e);
      }
    } else {
      console.log('❌ SunmiPrinterNative not found');
    }
    
    if (window.wm_print) {
      console.log('✅ Found wm_print - trying...');
      try {
        if (typeof window.wm_print === 'function') {
          window.wm_print(text);
          console.log('✅ wm_print() called');
          return;
        } else if ((window.wm_print as any).printText) {
          (window.wm_print as any).printText(text);
          console.log('✅ wm_print.printText() called');
          return;
        }
      } catch (e: any) {
        console.error('❌ wm_print error:', e);
      }
    } else {
      console.log('❌ wm_print not found');
    }
    
    if (window.wwise) {
      console.log('✅ Found wwise - trying...');
      try {
        if ((window.wwise as any).printText) {
          (window.wwise as any).printText(text);
          console.log('✅ wwise.printText() called');
          return;
        } else if ((window.wwise as any).postMessage) {
          (window.wwise as any).postMessage(JSON.stringify({ action: 'print', text }));
          console.log('✅ wwise.postMessage() called');
          return;
        }
      } catch (e: any) {
        console.error('❌ wwise error:', e);
      }
    } else {
      console.log('❌ wwise not found');
    }
    
    if ((window as any).SunmiPrinter) {
      console.log('✅ Found SunmiPrinter - trying...');
      try {
        if ((window as any).SunmiPrinter.printText) {
          (window as any).SunmiPrinter.printText(text);
          console.log('✅ SunmiPrinter.printText() called');
          return;
        } else if ((window as any).SunmiPrinter.print) {
          (window as any).SunmiPrinter.print(text);
          console.log('✅ SunmiPrinter.print() called');
          return;
        }
      } catch (e: any) {
        console.error('❌ SunmiPrinter error:', e);
      }
    } else {
      console.log('❌ SunmiPrinter not found');
    }
    
    if ((window as any).sunmi) {
      console.log('✅ Found sunmi - trying...');
      try {
        if ((window as any).sunmi.printText) {
          (window as any).sunmi.printText(text);
          console.log('✅ sunmi.printText() called');
          return;
        } else if ((window as any).sunmi.print) {
          (window as any).sunmi.print({ text });
          console.log('✅ sunmi.print() called');
          return;
        }
      } catch (e: any) {
        console.error('❌ sunmi error:', e);
      }
    } else {
      console.log('❌ sunmi not found');
    }
    
    if ((window as any).Android) {
      console.log('✅ Found Android - trying...');
      try {
        if ((window as any).Android.printText) {
          (window as any).Android.printText(text, 24, 'left', false);
          console.log('✅ Android.printText() called');
          return;
        } else if ((window as any).Android.print) {
          (window as any).Android.print(text);
          console.log('✅ Android.print() called');
          return;
        }
      } catch (e: any) {
        console.error('❌ Android error:', e);
      }
    } else {
      console.log('❌ Android not found');
    }
    
    console.log('\n❌ ❌ ❌ NO PRINT METHODS WORKED ❌ ❌ ❌');
    console.log('Check:');
    console.log('1. Are you using native Android app (not browser)?');
    console.log('2. Is printer service installed?');
    console.log('3. Is printer enabled in device settings?');
    console.log('\n=== Print Test Complete ===');
    console.log('Check your printer for output');
  };
  
  console.log('\n=== Test Function Available ===');
  console.log('Call window.testSunmiPrint("your text") to test printing');
  console.log('Or call window.testSunmiPrint() for default test text');
  
  return {
    isSunmi,
    availableSDKs: {
      wm_print: !!window.wm_print,
      wwise: !!window.wwise,
      SunmiPrinter: !!window.SunmiPrinter,
      sunmi: !!window.sunmi,
      Android: !!window.Android,
      Printer: !!window.Printer
    }
  };
}

// Auto-run debug on load (only in browser)
if (typeof window !== 'undefined') {
  // Run after a short delay to ensure page is loaded
  setTimeout(() => {
    debugSunmiPrinter();
    // Ensure test function is set (override any cached version)
    if ((window as any).testSunmiPrint) {
      console.log('✅ Test function available: window.testSunmiPrint()');
    }
  }, 1000);
}

