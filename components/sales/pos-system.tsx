"use client"

import { useState, useEffect } from "react"
import { Minus, Plus, ShoppingCart, Trash2, CreditCard, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { SalesHeader } from "./sales-header";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

type CartItem = {
  id: number
  name: string
  price: number
  quantity: number
}

export function POSSystem() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]); // Start with empty cart
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountReceived, setAmountReceived] = useState(0);
  const [change, setChange] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { user } = useAuth() as any;

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
      // 1. Create the sale, now including paymentType
      const sale = await apiFetch("/api/sales", {
        method: "POST",
        body: JSON.stringify({
          items,
          cashier: user._id,
          paymentType: paymentMethod, // <-- Use dropdown value
        }),
      });
      if (!sale._id) throw new Error("Sale creation failed");
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

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-3 mb-2">
        <SalesHeader onSearch={handleSearch} />
        <Button variant="secondary" className="ml-2" onClick={() => setScanModalOpen(true)}>
          Scan with Camera
        </Button>
        {searchError && <div className="text-red-500 mt-2">{searchError}</div>}
        {successMsg && <div className="text-green-600 mt-2">{successMsg}</div>}
      </div>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Current Cart</CardTitle>
          <CardDescription>Items in the current transaction</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cartItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
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
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
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
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" size="lg">
            <CreditCard className="mr-2 h-4 w-4" />
            Complete Sale
          </Button>
          <Button variant="outline" className="w-full bg-transparent">
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
        </CardFooter>
      </Card>
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
