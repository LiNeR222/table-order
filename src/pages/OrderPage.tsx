import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientSearch } from "@/components/order/ClientSearch";
import { WarehouseSelect } from "@/components/order/WarehouseSelect";
import { PayboxSelect } from "@/components/order/PayboxSelect";
import { OrganizationSelect } from "@/components/order/OrganizationSelect";
import { PriceTypeSelect } from "@/components/order/PriceTypeSelect";
import { ProductSearchSheet } from "@/components/order/ProductSearchSheet";
import { ItemsTable } from "@/components/order/ItemsTable";
import { useOrderStore } from "@/store/orderStore";
import { LogOut, Loader2, CheckCircle } from "lucide-react";

export function OrderPage() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  
  const {
    warehouses,
    payboxes,
    organizations,
    priceTypes,
    isLoadingWarehouses,
    isLoadingPayboxes,
    isLoadingOrganizations,
    isLoadingPriceTypes,
    isSubmitting,
    fetchWarehouses,
    fetchPayboxes,
    fetchOrganizations,
    fetchPriceTypes,
    submitOrder,
    resetOrder,
  } = useOrderStore();

  useEffect(() => {
    fetchWarehouses();
    fetchPayboxes();
    fetchOrganizations();
    fetchPriceTypes();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("tablecrm_token");
    navigate("/login");
  };

  const handleSubmit = async (status: boolean) => {
    const success = await submitOrder(status);
    if (success) {
      setShowSuccess(true);
      resetOrder();
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const isLoading = 
    isLoadingWarehouses || 
    isLoadingPayboxes || 
    isLoadingOrganizations || 
    isLoadingPriceTypes;

  const hasData = 
    warehouses.length > 0 && 
    payboxes.length > 0 && 
    organizations.length > 0 && 
    priceTypes.length > 0;

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Заказ создан!</h2>
            <p className="text-muted-foreground mb-4">
              Заказ успешно создан в системе TableCRM
            </p>
            <Button onClick={() => setShowSuccess(false)} className="w-full">
              Создать новый заказ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-4 pb-20">
      <Card className="w-full max-w-md mx-auto bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Новый заказ</CardTitle>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Загрузка данных...</span>
            </div>
          )}
          
          {!isLoading && !hasData && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Не удалось загрузить данные</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => {
                  fetchWarehouses();
                  fetchPayboxes();
                  fetchOrganizations();
                  fetchPriceTypes();
                }}
              >
                Попробовать снова
              </Button>
            </div>
          )}
          
          {hasData && (
            <>
              <ClientSearch />
              <WarehouseSelect />
              <PayboxSelect />
              <OrganizationSelect />
              <PriceTypeSelect />
              
              <div className="border-t pt-4">
                <ItemsTable />
              </div>
              
              <ProductSearchSheet />
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Фиксированные кнопки внизу */}
      {hasData && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t max-w-md mx-auto">
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Создать
            </Button>
            <Button 
              className="flex-1"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Создать и провести
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}