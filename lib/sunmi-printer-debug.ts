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
  
  // Test print function
  window.testSunmiPrint = function(text: string = 'TEST PRINT\nBELCIT TRADING\nTest Receipt\n\n') {
    console.log('Testing print with text:', text);
    
    if (window.wm_print) {
      console.log('Trying wm_print...');
      try {
        if (typeof window.wm_print === 'function') {
          window.wm_print(text);
          console.log('✓ wm_print() called');
        } else if (window.wm_print.printText) {
          window.wm_print.printText(text);
          console.log('✓ wm_print.printText() called');
        }
      } catch (e) {
        console.error('✗ wm_print error:', e);
      }
    }
    
    if (window.wwise) {
      console.log('Trying wwise...');
      try {
        if (window.wwise.printText) {
          window.wwise.printText(text);
          console.log('✓ wwise.printText() called');
        } else if (window.wwise.postMessage) {
          window.wwise.postMessage(JSON.stringify({ action: 'print', text }));
          console.log('✓ wwise.postMessage() called');
        }
      } catch (e) {
        console.error('✗ wwise error:', e);
      }
    }
    
    if (window.SunmiPrinter) {
      console.log('Trying SunmiPrinter...');
      try {
        if (window.SunmiPrinter.printText) {
          window.SunmiPrinter.printText(text);
          console.log('✓ SunmiPrinter.printText() called');
        } else if (window.SunmiPrinter.print) {
          window.SunmiPrinter.print(text);
          console.log('✓ SunmiPrinter.print() called');
        }
      } catch (e) {
        console.error('✗ SunmiPrinter error:', e);
      }
    }
    
    if (window.sunmi) {
      console.log('Trying sunmi...');
      try {
        if (window.sunmi.printText) {
          window.sunmi.printText(text);
          console.log('✓ sunmi.printText() called');
        } else if (window.sunmi.print) {
          window.sunmi.print({ text });
          console.log('✓ sunmi.print() called');
        }
      } catch (e) {
        console.error('✗ sunmi error:', e);
      }
    }
    
    if (window.Android) {
      console.log('Trying Android...');
      try {
        if (window.Android.printText) {
          window.Android.printText(text, 24, 'left', false);
          console.log('✓ Android.printText() called');
        } else if (window.Android.print) {
          window.Android.print(text);
          console.log('✓ Android.print() called');
        }
      } catch (e) {
        console.error('✗ Android error:', e);
      }
    }
    
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
  }, 1000);
}

