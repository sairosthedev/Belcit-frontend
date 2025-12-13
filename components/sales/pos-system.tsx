"use client"

import { useState, useEffect, useRef } from "react"
import { Minus, Plus, ShoppingCart, Trash2, CreditCard, Printer, Barcode, Tag, Boxes, DollarSign, Hash, Calculator, Sparkles, Zap } from "lucide-react"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { SalesHeader } from "./sales-header";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { usePOSDevice } from "@/hooks/use-pos-device";
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { printReceipt as sunmiPrintReceipt } from "@/lib/sunmi-printer";
import "@/lib/sunmi-printer-debug"; // Load debug utility

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  barcode?: string;
  category?: string;
  stock?: number;
};

export function POSSystem() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]); // Start with empty cart
  const [searchError, setSearchError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountReceived, setAmountReceived] = useState(0);
  const [change, setChange] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [lastSaleId, setLastSaleId] = useState<string | null>(null);
  const { user } = useAuth() as any;
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [ecocashNumber, setEcocashNumber] = useState("");
  const { isPOSDevice, isTouchDevice, isSmallScreen } = usePOSDevice();

  // Fetch customers (first 100)
  const { data: customerData, isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await apiFetch('/api/customers?page=1&limit=100');
      return res.docs || res.data || [];
    },
  });

  // Fetch top products for dynamic quick add
  const { data: topProducts, isLoading: topProductsLoading } = useQuery({
    queryKey: ['topProducts'],
    queryFn: async () => {
      const res = await apiFetch('/api/sales/top-products');
      return res;
    },
  });

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return

    setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
    toast.success("Quantity updated", { duration: 1500 })
  }

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
    toast.error("Item removed from cart", { duration: 2000 })
  }

  const addProductToCart = (product: any) => {
    setCartItems((prev) => {
      const pid = product._id || product.id;
      const existing = prev.find((item) => item.id === pid);
      if (existing) {
        toast.success(`+1 ${product.name}`, {
          duration: 1500,
          icon: "➕"
        });
        return prev.map((item) =>
          item.id === pid ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      toast.success(`${product.name} added to cart!`, {
        duration: 2000,
        icon: "🛒"
      });
      return [
        ...prev,
        {
          id: pid,
          name: product.name,
          price: product.price,
          quantity: 1,
          barcode: product.barcode,
          category: product.category,
          stock: product.stock,
        },
      ];
    });
  };

  const handleSearch = async (query: string) => {
    setSearchError(null);
    if (!query) return;
    try {
      // Try barcode first
      let product = await apiFetch(`/api/products/barcode/${encodeURIComponent(query)}`);
      if (!product || !product._id) {
        // Try by name if not found by barcode
        const products = await apiFetch(`/api/products?name=${encodeURIComponent(query)}`);
        product = products && products.length > 0 ? products[0] : null;
      }
      if (product && product._id) {
        addProductToCart(product);
        // Refocus the search input after adding
        if (searchInputRef.current) searchInputRef.current.focus();
      } else {
        setSearchError("Product not found.");
        toast.error("Product not found", { duration: 2000 });
        // Refocus even on error
        if (searchInputRef.current) searchInputRef.current.focus();
      }
    } catch (err) {
      setSearchError("Product not found.");
      toast.error("Product not found", { duration: 2000 });
      if (searchInputRef.current) searchInputRef.current.focus();
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.07 // 7% tax
  const total = subtotal + tax

  // Update change when amountReceived or total changes
  useEffect(() => {
    setChange(Math.max(0, amountReceived - total));
  }, [amountReceived, total]);

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const handleCompleteSale = async () => {
    setSubmitting(true);
    setSuccessMsg(null);
    try {
      if (!user || !user._id) throw new Error("No cashier info");
      if (cartItems.length === 0) throw new Error("Cart is empty");
      if (paymentMethod === "ecocash" && !ecocashNumber) throw new Error("Ecocash number is required");
      const items = cartItems.map(item => ({
        product: item.id,
        quantity: item.quantity
      }));
      // 1. Create the sale, now including paymentType and customer if selected
      const sale = await apiFetch("/api/sales", {
        method: "POST",
        body: JSON.stringify({
          items,
          cashier: user._id,
          paymentType: paymentMethod,
          customer: selectedCustomer ? selectedCustomer._id : undefined,
        }),
      });
      if (!sale._id) throw new Error("Sale creation failed");
      setLastSaleId(sale._id); // Store last sale ID
      // 2. Create the payment
      const payment = await apiFetch("/api/payments/", {
        method: "POST",
        body: JSON.stringify({
          saleId: sale._id,
          amount: total,
          paymentMethod,
          paymentType: "sale",
          ecocashNumber: paymentMethod === "ecocash" ? ecocashNumber : undefined
        }),
      });
      if (!payment || payment.error) {
        throw new Error(payment?.error || "Payment failed");
      }

      // Success! Trigger celebration
      triggerConfetti();
      toast.success("🎉 Sale completed successfully!", {
        duration: 3000,
        description: `Total: $${total.toFixed(2)}`
      });

      setSuccessMsg("Sale and payment completed successfully!");
      
      // Auto-print receipt after successful sale
      try {
        await printReceipt(sale._id);
      } catch (printErr) {
        console.error('Auto-print failed:', printErr);
        // Don't fail the sale if printing fails
        toast.error('Receipt printing failed, but sale was successful', { duration: 2000 });
      }
      
      setCartItems([]);
      setAmountReceived(0);
      setChange(0);
      setEcocashNumber("");
    } catch (err: any) {
      setSearchError(err.message || "Failed to complete sale");
      toast.error(err.message || "Failed to complete sale", { duration: 3000 });
    } finally {
      setSubmitting(false);
    }
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://belcit-backend.onrender.com";
  // Print receipt for the last sale - with Sunmi support
  const printReceipt = async (saleId: string) => {
    try {
      // Fetch the receipt HTML with authentication
      const res = await fetch(`${API_BASE}/api/sales/${saleId}/receipt`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'text/html',
        },
        credentials: 'include',
      });
      if (!res.ok) throw new Error(await res.text());
      const html = await res.text();
      
      // Try Sunmi native printing first, fallback to browser print
      const sunmiPrinted = await sunmiPrintReceipt(html);
      
      if (sunmiPrinted) {
        toast.success("Receipt sent to Sunmi printer", { duration: 2000 });
      } else {
        toast.success("Receipt sent to printer", { duration: 2000 });
      }
    } catch (err: any) {
      console.error('Print error:', err);
      toast.error(err.message || 'Failed to print receipt', { duration: 2000 });
    }
  };

  // POS-optimized button sizes
  const buttonSize = isPOSDevice || isTouchDevice ? "lg" : "default";
  const iconButtonSize = isPOSDevice || isTouchDevice ? "default" : "icon";
  const touchPadding = isPOSDevice || isTouchDevice ? "p-2" : "p-1";

  return (
    <div className={`grid grid-cols-1 ${isSmallScreen ? 'gap-3 p-2' : 'gap-4 md:gap-6 p-3 md:p-4 lg:p-6'} lg:grid-cols-3 relative w-full max-w-full overflow-x-hidden`}>
      {/* Premium gradient background overlay */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />

      {/* Left/Main Column: Product Scanner, Quick Add, and Cart Table */}
      <div className={`lg:col-span-2 flex flex-col ${isSmallScreen ? 'gap-3' : 'gap-4 md:gap-6'} w-full max-w-full overflow-x-hidden`}>
        {/* Responsive header: stack on mobile, row on desktop */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 mb-4"
        >
          {/* Cashier display on top for mobile */}
          {user && (
            <div className="text-right text-base font-medium">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-bold">
                Cashier:
              </span>{" "}
              <span className="text-foreground">{user.firstName} {user.lastName}</span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <SalesHeader onSearch={handleSearch} ref={searchInputRef} />
          </div>
        </motion.div>

        {/* Customer select */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row items-center gap-2 mb-4"
        >
          <label className="font-semibold text-sm">Customer:</label>
          <Select
            value={selectedCustomer ? selectedCustomer._id : 'walk-in'}
            onValueChange={val => {
              if (val === 'walk-in') {
                setSelectedCustomer(null);
              } else {
                const found = customerData?.find((c: any) => c._id === val);
                setSelectedCustomer(found || null);
              }
            }}
            disabled={customersLoading}
          >
            <SelectTrigger className="w-64 border-2 hover:border-primary/50 transition-colors">
              <SelectValue placeholder={customersLoading ? 'Loading customers...' : 'Select customer'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="walk-in">👤 Walk-in</SelectItem>
              {customerData && customerData.map((c: any) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.firstName} {c.lastName} ({c.customerType})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCustomer && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ml-2 text-sm text-muted-foreground px-3 py-1 bg-primary/10 rounded-full"
            >
              ✓ {selectedCustomer.firstName} {selectedCustomer.lastName}
            </motion.span>
          )}
        </motion.div>

        {/* Quick Add Products - dynamic with premium styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Quick Add Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topProductsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {topProducts && topProducts.length > 0 ? (
                    topProducts.map((product: any, index: number) => (
                      <motion.div
                        key={product.productId}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          className="relative flex flex-col items-center justify-center gap-2 py-6 h-auto border-2 hover:border-primary/50 bg-gradient-to-br from-background to-primary/5 hover:from-primary/10 hover:to-primary/20 transition-all duration-300 shadow-md hover:shadow-lg overflow-hidden group"
                          onClick={() => addProductToCart({
                            ...product,
                            _id: product.productId || product._id || product.id,
                          })}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                          <span className="font-semibold text-sm relative z-10">{product.name}</span>
                          <span className="text-primary font-bold text-lg relative z-10">
                            ${product.price?.toFixed(2) ?? '-'}
                          </span>
                        </Button>
                      </motion.div>
                    ))
                  ) : (
                    <div key="no-top-products" className="col-span-full text-muted-foreground text-center py-8">
                      No top products found.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Cart Table: premium styling with animations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="overflow-x-auto rounded-xl border-2 bg-gradient-to-br from-background via-background to-primary/5 shadow-xl mb-6 backdrop-blur-sm"
        >
          <Card className="min-w-[900px] border-none shadow-none bg-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Current Cart
                {cartItems.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-2 px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs font-bold"
                  >
                    {cartItems.length}
                  </motion.span>
                )}
              </CardTitle>
              <CardDescription>Items in the current transaction</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2">
                    <TableHead className="min-w-[120px]">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <ShoppingCart className="inline h-4 w-4" /> Product
                      </span>
                    </TableHead>
                    <TableHead className="min-w-[120px]">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <Barcode className="inline h-4 w-4" /> Barcode
                      </span>
                    </TableHead>
                    <TableHead className="min-w-[120px]">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <Tag className="inline h-4 w-4" /> Category
                      </span>
                    </TableHead>
                    <TableHead className="min-w-[100px]">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <Boxes className="inline h-4 w-4" /> Stock
                      </span>
                    </TableHead>
                    <TableHead className="text-right min-w-[100px]">
                      <span className="inline-flex items-center gap-1 justify-end font-semibold">
                        <DollarSign className="inline h-4 w-4" /> Price
                      </span>
                    </TableHead>
                    <TableHead className="text-center min-w-[100px]">
                      <span className="inline-flex items-center gap-1 justify-center font-semibold">
                        <Hash className="inline h-4 w-4" /> Qty
                      </span>
                    </TableHead>
                    <TableHead className="text-right min-w-[100px]">
                      <span className="inline-flex items-center gap-1 justify-end font-semibold">
                        <Calculator className="inline h-4 w-4" /> Total
                      </span>
                    </TableHead>
                    <TableHead className="min-w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {cartItems.map((item, index) => (
                      <motion.tr
                        key={item.id ?? item.barcode ?? item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b hover:bg-primary/5 transition-colors"
                      >
                        <TableCell className="font-semibold">{item.name}</TableCell>
                        <TableCell className="text-muted-foreground">{item.barcode || '-'}</TableCell>
                        <TableCell>
                          {item.category ? (
                            <span className="px-2 py-1 bg-primary/10 rounded-md text-xs font-medium">
                              {item.category}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {typeof item.stock === 'number' ? (
                            <span className={`font-semibold ${item.stock < 10 ? 'text-red-500' : 'text-green-600'}`}>
                              {item.stock}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">${item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size={iconButtonSize}
                              className={`${isPOSDevice || isTouchDevice ? 'h-10 w-10 min-w-[40px]' : 'h-8 w-8'} hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 transition-all touch-manipulation`}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className={isPOSDevice || isTouchDevice ? "h-4 w-4" : "h-3 w-3"} />
                            </Button>
                            <motion.span
                              key={item.quantity}
                              initial={{ scale: 1.3 }}
                              animate={{ scale: 1 }}
                              className={`${isPOSDevice || isTouchDevice ? 'w-16 text-lg' : 'w-12'} text-center font-bold`}
                            >
                              {item.quantity}
                            </motion.span>
                            <Button
                              variant="outline"
                              size={iconButtonSize}
                              className={`${isPOSDevice || isTouchDevice ? 'h-10 w-10 min-w-[40px]' : 'h-8 w-8'} hover:bg-green-500/10 hover:border-green-500 hover:text-green-500 transition-all touch-manipulation`}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className={isPOSDevice || isTouchDevice ? "h-4 w-4" : "h-3 w-3"} />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          ${(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size={iconButtonSize}
                            className={`${isPOSDevice || isTouchDevice ? 'h-10 w-10 min-w-[40px]' : 'h-8 w-8'} hover:bg-red-500/10 hover:text-red-500 transition-all touch-manipulation`}
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className={isPOSDevice || isTouchDevice ? "h-5 w-5" : "h-4 w-4"} />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {cartItems.length === 0 && (
                    <TableRow key="empty">
                      <TableCell colSpan={8} className="text-center py-12">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                          <p className="text-lg font-semibold text-muted-foreground">No items in cart</p>
                          <p className="text-sm text-muted-foreground mt-1">Scan a barcode or search for products to add</p>
                        </motion.div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
        {searchError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm font-medium"
          >
            {searchError}
          </motion.div>
        )}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-green-600 bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm font-medium"
          >
            ✓ {successMsg}
          </motion.div>
        )}
      </div>

      {/* Right/Sidebar: Order Summary with premium styling */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        className={`flex flex-col ${isSmallScreen ? 'gap-3' : 'gap-4 md:gap-6'} w-full max-w-full overflow-x-hidden`}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="lg:col-span-1 flex flex-col gap-6"
      >
        {/* Order Summary/Checkout */}
        <Card className="border-2 hover:border-primary/30 transition-all duration-300 shadow-xl sticky top-4 bg-gradient-to-br from-background via-background to-primary/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Order Summary
            </CardTitle>
            <CardDescription>Complete the transaction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tax (7%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium">$0.00</span>
              </div>
              <Separator className="bg-gradient-to-r from-transparent via-primary to-transparent h-[2px]" />
              <motion.div
                className="flex items-center justify-between font-bold text-xl p-4 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 rounded-lg border-2 border-primary/20"
                animate={{ scale: cartItems.length > 0 ? [1, 1.02, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                <span>Total</span>
                <span className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  ${total.toFixed(2)}
                </span>
              </motion.div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Payment Method</label>
                <Select value={paymentMethod} onValueChange={val => { setPaymentMethod(val); if (val !== 'ecocash') setEcocashNumber(""); }}>
                  <SelectTrigger className="w-full border-2 hover:border-primary/50 transition-colors">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">💵 Cash</SelectItem>
                    <SelectItem value="swipe">💳 Card (Swipe)</SelectItem>
                    <SelectItem value="ecocash">📱 Ecocash</SelectItem>
                    <SelectItem value="innbucks">💰 Innbucks</SelectItem>
                    <SelectItem value="bank-transfer">🏦 Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <AnimatePresence>
                {paymentMethod === "ecocash" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-semibold">Ecocash Number</label>
                    <Input
                      type="tel"
                      value={ecocashNumber}
                      onChange={e => setEcocashNumber(e.target.value)}
                      className="w-full border-2 focus:border-primary"
                      placeholder="Enter Ecocash number"
                      required
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Amount Received</label>
                <Input
                  type="number"
                  min={0}
                  value={amountReceived}
                  onChange={e => setAmountReceived(Number(e.target.value))}
                  className="w-full border-2 focus:border-primary"
                  placeholder="Enter amount received"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Change</span>
                <span className="font-bold text-lg text-green-600">${change.toFixed(2)}</span>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className={`w-full mt-2 ${isPOSDevice || isTouchDevice ? 'h-14 text-lg' : 'h-12 text-base'} font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group touch-manipulation`}
                  onClick={handleCompleteSale}
                  disabled={submitting || cartItems.length === 0 || amountReceived < total}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative z-10 flex items-center gap-2">
                    {submitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5" />
                        Complete Sale
                      </>
                    )}
                  </span>
                </Button>
              </motion.div>
              <AnimatePresence>
                {successMsg && lastSaleId && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full border-2 hover:bg-primary/10 hover:border-primary transition-all"
                      onClick={() => printReceipt(lastSaleId)}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Print Receipt
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
