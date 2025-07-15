"use client"

import { useState, useEffect } from "react"
import { Minus, Plus, ShoppingCart, Trash2, CreditCard, Printer, Barcode, Tag, Boxes, DollarSign, Hash, Calculator } from "lucide-react"
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
import { useQuery } from '@tanstack/react-query';

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
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountReceived, setAmountReceived] = useState(0);
  const [change, setChange] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [lastSaleId, setLastSaleId] = useState<string | null>(null);
  const { user } = useAuth() as any;
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

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
  }

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const addProductToCart = (product: any) => {
    setCartItems((prev) => {
      const pid = product._id || product.id;
      const existing = prev.find((item) => item.id === pid);
      if (existing) {
        return prev.map((item) =>
          item.id === pid ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
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
      } else {
        setSearchError("Product not found.");
      }
    } catch (err) {
      setSearchError("Product not found.");
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.07 // 7% tax
  const total = subtotal + tax

  // Update change when amountReceived or total changes
  useEffect(() => {
    setChange(Math.max(0, amountReceived - total));
  }, [amountReceived, total]);

  const handleCompleteSale = async () => {
    setSubmitting(true);
    setSuccessMsg(null);
    try {
      if (!user || !user._id) throw new Error("No cashier info");
      if (cartItems.length === 0) throw new Error("Cart is empty");
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
          paymentType: "sale"
        }),
      });
      if (!payment || payment.error) {
        throw new Error(payment?.error || "Payment failed");
      }
      setSuccessMsg("Sale and payment completed successfully!");
      setCartItems([]);
      setAmountReceived(0);
      setChange(0);
    } catch (err: any) {
      setSearchError(err.message || "Failed to complete sale");
    } finally {
      setSubmitting(false);
    }
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  // Print receipt for the last sale
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
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
    } catch (err) {
      alert('Failed to print receipt.');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 p-4 md:p-8">
      {/* Left/Main Column: Product Scanner, Quick Add, and Cart Table */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Responsive header: stack on mobile, row on desktop */}
        <div className="flex flex-col gap-4 mb-4">
          {/* Cashier display on top for mobile */}
          {user && (
            <div className="text-right text-base font-medium text-primary">
              <span className="font-semibold">Cashier:</span> {user.firstName} {user.lastName}
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <SalesHeader onSearch={handleSearch} />
            <Button variant="secondary" className="sm:ml-2" onClick={() => setScanModalOpen(true)}>
              Scan with Camera
            </Button>
          </div>
        </div>
        {/* Customer select */}
        <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
          <label className="font-medium">Customer:</label>
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
            <SelectTrigger className="w-64">
              <SelectValue placeholder={customersLoading ? 'Loading customers...' : 'Select customer'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="walk-in">Walk-in</SelectItem>
              {customerData && customerData.map((c: any) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.firstName} {c.lastName} ({c.customerType})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCustomer && (
            <span className="ml-2 text-muted-foreground">{selectedCustomer.firstName} {selectedCustomer.lastName}</span>
          )}
        </div>
        {/* Quick Add Products - dynamic */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Add Products</CardTitle>
          </CardHeader>
          <CardContent>
            {topProductsLoading ? (
              <div>Loading top products...</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {topProducts && topProducts.length > 0 ? (
                  topProducts.map((product: any) => (
                    <Button
                      key={product.productId}
                      variant="outline"
                      className="flex flex-col items-center justify-center gap-1 py-6"
                      onClick={() => addProductToCart({
                        ...product,
                        _id: product.productId || product._id || product.id, // ensure _id is set
                      })}
                    >
                      <span className="font-medium">{product.name}</span>
                      <span className="text-muted-foreground text-sm">${product.price?.toFixed(2) ?? '-'}</span>
                    </Button>
                  ))
                ) : (
                  <div key="no-top-products" className="col-span-full text-muted-foreground">No top products found.</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Cart Table: always horizontally scrollable and visually contained, now below quick add */}
        <div className="overflow-x-auto rounded-lg border bg-background shadow-sm mb-6">
          <Card className="min-w-[900px] border-none shadow-none">
            <CardHeader>
              <CardTitle>Current Cart</CardTitle>
              <CardDescription>Items in the current transaction</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">
                      <span className="inline-flex items-center gap-1">
                        <ShoppingCart className="inline h-5 w-5" /> Product
                      </span>
                    </TableHead>
                    <TableHead className="min-w-[120px]">
                      <span className="inline-flex items-center gap-1">
                        <Barcode className="inline h-5 w-5" /> Barcode
                      </span>
                    </TableHead>
                    <TableHead className="min-w-[120px]">
                      <span className="inline-flex items-center gap-1">
                        <Tag className="inline h-5 w-5" /> Category
                      </span>
                    </TableHead>
                    <TableHead className="min-w-[100px]">
                      <span className="inline-flex items-center gap-1">
                        <Boxes className="inline h-5 w-5" /> Stock Left
                      </span>
                    </TableHead>
                    <TableHead className="text-right min-w-[100px]">
                      <span className="inline-flex items-center gap-1 justify-end">
                        <DollarSign className="inline h-5 w-5" /> Price
                      </span>
                    </TableHead>
                    <TableHead className="text-center min-w-[100px]">
                      <span className="inline-flex items-center gap-1 justify-center">
                        <Hash className="inline h-5 w-5" /> Quantity
                      </span>
                    </TableHead>
                    <TableHead className="text-right min-w-[100px]">
                      <span className="inline-flex items-center gap-1 justify-end">
                        <Calculator className="inline h-5 w-5" /> Total
                      </span>
                    </TableHead>
                    <TableHead className="min-w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cartItems.map((item) => (
                    <TableRow key={item.id ?? item.barcode ?? item.name}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.barcode || '-'}</TableCell>
                      <TableCell>{item.category || '-'}</TableCell>
                      <TableCell>{typeof item.stock === 'number' ? item.stock : '-'}</TableCell>
                      <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {cartItems.length === 0 && (
                    <TableRow key="empty">
                      <TableCell colSpan={8} className="text-center py-8">
                        <ShoppingCart className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-muted-foreground">No items in cart</p>
                        <p className="text-sm text-muted-foreground">Scan a barcode or search for products to add</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        {searchError && <div className="text-red-500 mt-2">{searchError}</div>}
        {successMsg && <div className="text-green-600 mt-2">{successMsg}</div>}
      </div>
      {/* Right/Sidebar: Order Summary only */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        {/* Order Summary/Checkout */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Complete the transaction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tax (7%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>$0.00</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-medium">
                <span>Total</span>
                <span className="text-xl">${total.toFixed(2)}</span>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method</label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="swipe">Card (Swipe)</SelectItem>
                    <SelectItem value="ecocash">Ecocash</SelectItem>
                    <SelectItem value="innbucks">Innbucks</SelectItem>
                    <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount Received</label>
                <Input
                  type="number"
                  min={0}
                  value={amountReceived}
                  onChange={e => setAmountReceived(Number(e.target.value))}
                  className="w-full"
                  placeholder="Enter amount received"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Change</span>
                <span>${change.toFixed(2)}</span>
              </div>
              <Button
                className="w-full mt-2"
                onClick={handleCompleteSale}
                disabled={submitting || cartItems.length === 0 || amountReceived < total}
              >
                {submitting ? "Processing..." : "Complete Sale"}
              </Button>
              {/* Print Receipt button can be implemented here if needed */}
              {successMsg && lastSaleId && (
                <Button
                  variant="outline"
                  className="w-full bg-transparent mt-2"
                  onClick={() => printReceipt(lastSaleId)}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print Receipt
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Camera scan modal scaffold */}
      {scanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Scan Barcode with Camera</h2>
            <div className="mb-4">[Camera scanner coming soon]</div>
            <Button onClick={() => setScanModalOpen(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  )
}
