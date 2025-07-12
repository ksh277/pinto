import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus, X, ShoppingCart, CreditCard, AlertTriangle } from "lucide-react";

interface CartItem {
  id: number;
  name: string;
  nameKo: string;
  price: number;
  quantity: number;
  image: string;
  options: {
    size?: string;
    color?: string;
    [key: string]: any;
  };
}

export default function Cart() {
  const { t } = useLanguage();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
        setSelectedItems(parsedCart.map((item: CartItem) => item.id));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    } else {
      // Initialize with sample data if no cart exists
      const sampleCart = [
        {
          id: 1,
          name: "Acrylic Keychain",
          nameKo: "아크릴 키링",
          price: 8900,
          quantity: 2,
          image: "/api/placeholder/100/100",
          options: {
            size: "5x5cm",
            color: "투명"
          }
        },
        {
          id: 2,
          name: "Custom Sticker",
          nameKo: "커스텀 스티커",
          price: 5500,
          quantity: 1,
          image: "/api/placeholder/100/100",
          options: {
            size: "10x10cm",
            color: "컬러"
          }
        },
        {
          id: 3,
          name: "Acrylic Stand",
          nameKo: "아크릴 스탠드",
          price: 15000,
          quantity: 1,
          image: "/api/placeholder/100/100",
          options: {
            size: "15x20cm",
            color: "투명"
          }
        }
      ];
      setCartItems(sampleCart);
      setSelectedItems(sampleCart.map(item => item.id));
      localStorage.setItem('cart', JSON.stringify(sampleCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
      // Dispatch custom event to notify header of cart changes
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  }, [cartItems]);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
    setSelectedItems(selected => selected.filter(itemId => itemId !== id));
  };

  const toggleSelectItem = (id: number) => {
    setSelectedItems(selected =>
      selected.includes(id)
        ? selected.filter(itemId => itemId !== id)
        : [...selected, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.id));
    }
  };

  const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
  const subtotal = selectedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = subtotal >= 50000 ? 0 : 3000;
  const total = subtotal + shippingFee;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t({ ko: "장바구니가 비어 있습니다", en: "Your cart is empty" })}
            </h2>
            <p className="text-gray-600 mb-8">
              {t({ ko: "원하는 상품을 장바구니에 담아보세요", en: "Add items to your cart to get started" })}
            </p>
            <Link href="/products">
              <Button className="px-8 py-3">
                {t({ ko: "쇼핑 계속하기", en: "Continue Shopping" })}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t({ ko: "장바구니", en: "Shopping Cart" })}
          </h1>
          <p className="text-gray-600 mt-2">
            {t({ ko: `총 ${cartItems.length}개의 상품이 있습니다`, en: `${cartItems.length} items in your cart` })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Checkbox
                      checked={selectedItems.length === cartItems.length}
                      onCheckedChange={toggleSelectAll}
                      className="mr-3"
                    />
                    {t({ ko: "전체 선택", en: "Select All" })}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      selectedItems.forEach(id => removeItem(id));
                    }}
                    disabled={selectedItems.length === 0}
                  >
                    {t({ ko: "선택 삭제", en: "Remove Selected" })}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => toggleSelectItem(item.id)}
                    />
                    
                    <img
                      src={item.image}
                      alt={item.nameKo}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.nameKo}</h3>
                      <p className="text-sm text-gray-600">{item.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {Object.entries(item.options).map(([key, value]) => (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₩{(item.price * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        ₩{item.price.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>
                  {t({ ko: "주문 요약", en: "Order Summary" })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t({ ko: "상품 금액", en: "Subtotal" })}
                  </span>
                  <span className="font-semibold">₩{subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t({ ko: "배송비", en: "Shipping" })}
                  </span>
                  <span className="font-semibold">
                    {shippingFee === 0 ? (
                      <span className="text-green-600">
                        {t({ ko: "무료", en: "Free" })}
                      </span>
                    ) : (
                      `₩${shippingFee.toLocaleString()}`
                    )}
                  </span>
                </div>
                
                {subtotal < 50000 && (
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                    {t({ 
                      ko: `₩${(50000 - subtotal).toLocaleString()} 더 구매하시면 무료배송!`, 
                      en: `₩${(50000 - subtotal).toLocaleString()} more for free shipping!` 
                    })}
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>{t({ ko: "총 결제 금액", en: "Total" })}</span>
                  <span className="text-blue-600">₩{total.toLocaleString()}</span>
                </div>
                
                <Link href="/checkout">
                  <Button 
                    className="w-full py-3 text-lg" 
                    disabled={selectedItems.length === 0}
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    {t({ ko: "주문하기", en: "Proceed to Checkout" })}
                  </Button>
                </Link>
                
                <Link href="/products">
                  <Button variant="outline" className="w-full">
                    {t({ ko: "쇼핑 계속하기", en: "Continue Shopping" })}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}