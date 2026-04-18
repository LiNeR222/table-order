import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useOrderStore } from "@/store/orderStore";
import type { Nomenclature, OrderItem } from "@/types";
import { Search, Plus, Loader2, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductSearchSheet() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [products, setProducts] = useState<Nomenclature[]>([]);
  
  const [selectedProduct, setSelectedProduct] = useState<Nomenclature | null>(null);
  const [quantityDialogOpen, setQuantityDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  
  const { priceTypes, selectedPriceType, addItem } = useOrderStore();

  // Поиск товаров с debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      setProducts([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await api.get<Nomenclature>('/nomenclature', { search: searchQuery });
        setProducts(results);
      } catch (error) {
        console.error("Ошибка поиска товаров:", error);
        setProducts([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Получение цены в зависимости от выбранного типа цены
  const getProductPrice = (product: Nomenclature): number => {
    // По умолчанию берём price, если есть
    if (product.price) return product.price;
    if (product.price_retail) return product.price_retail;
    return 0;
  };

  const handleSelectProduct = (product: Nomenclature) => {
    setSelectedProduct(product);
    const defaultPrice = getProductPrice(product);
    setPrice(defaultPrice);
    setQuantity(1);
    setQuantityDialogOpen(true);
  };

  const handleAddToOrder = () => {
    if (!selectedProduct) return;
    
    const orderItem: OrderItem = {
      nomenclature: selectedProduct.id,
      price: price,
      quantity: quantity,
      unit: selectedProduct.unit || 116,
      discount: 0,
      sum_discounted: 0,
    };
    
    addItem(orderItem);
    setQuantityDialogOpen(false);
    setOpen(false);
    setSearchQuery("");
    setProducts([]);
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Добавить товар
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
          <SheetHeader>
            <SheetTitle>Поиск товаров</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию или артикулу"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white"
                autoFocus
              />
            </div>
            
            {isSearching && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Поиск...</span>
              </div>
            )}
            
            {!isSearching && searchQuery.length < 2 && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Введите минимум 2 символа для поиска</p>
              </div>
            )}
            
            {!isSearching && searchQuery.length >= 2 && products.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Товары не найдены</p>
              </div>
            )}
            
            {!isSearching && products.length > 0 && (
              <div className="space-y-2 max-h-[calc(90vh-180px)] overflow-auto">
                {products.map((product) => (
                  <button
                    key={product.id}
                    className={cn(
                      "w-full p-4 text-left bg-white border border-zinc-200 rounded-lg",
                      "hover:border-primary transition-colors"
                    )}
                    onClick={() => handleSelectProduct(product)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        {product.article && (
                          <p className="text-sm text-muted-foreground">
                            Артикул: {product.article}
                          </p>
                        )}
                      </div>
                      <p className="font-semibold text-primary">
                        {formatPrice(getProductPrice(product))}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Диалог выбора количества */}
      <Dialog open={quantityDialogOpen} onOpenChange={setQuantityDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Количество</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Цена (₽)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">Итого:</p>
              <p className="text-2xl font-bold">{formatPrice(price * quantity)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuantityDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddToOrder}>
              Добавить в заказ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}