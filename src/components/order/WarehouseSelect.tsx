import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrderStore } from "@/store/orderStore";

export function WarehouseSelect() {
  const { warehouses, selectedWarehouse, setSelectedWarehouse } = useOrderStore();

  if (!warehouses || warehouses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Склад</label>
      <Select
        value={selectedWarehouse?.toString() || ""}
        onValueChange={(value) => setSelectedWarehouse(Number(value))}
      >
        <SelectTrigger className="bg-white">
          <SelectValue placeholder="Выберите склад" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-zinc-200 shadow-lg">
          {warehouses.map((warehouse) => (
            <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
              {warehouse.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}