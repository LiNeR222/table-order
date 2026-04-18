import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOrderStore } from "@/store/orderStore";
import { Trash2, ShoppingBag } from "lucide-react";

export function ItemsTable() {
  const { items, removeItem, updateItem } = useOrderStore();

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const total = items.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity;
    const discount = item.discount || 0;
    return sum + itemTotal - discount;
  }, 0);

  if (items.length === 0) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6 text-center">
          <ShoppingBag className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Корзина пуста</p>
          <p className="text-sm text-muted-foreground mt-1">
            Добавьте товары через поиск
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium">Товары в заказе</h3>
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <Card key={index} className="bg-white">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    Товар #{item.nomenclature}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-sm">
                    <span className="text-muted-foreground">
                      {item.quantity} × {formatPrice(item.price)}
                    </span>
                  </div>
                  {item.discount > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Скидка: {formatPrice(item.discount)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatPrice(item.price * item.quantity - item.discount)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive mt-1"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="bg-white border-t-2 border-t-primary">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Итого:</span>
            <span className="text-xl font-bold text-primary">
              {formatPrice(total)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}