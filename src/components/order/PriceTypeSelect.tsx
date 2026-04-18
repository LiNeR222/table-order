import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrderStore } from "@/store/orderStore";

export function PriceTypeSelect() {
  const { priceTypes, selectedPriceType, setSelectedPriceType } = useOrderStore();

  if (!priceTypes || priceTypes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Тип цены</label>
      <Select
        value={selectedPriceType?.toString() || ""}
        onValueChange={(value) => setSelectedPriceType(Number(value))}
      >
        <SelectTrigger className="bg-white">
          <SelectValue placeholder="Выберите тип цены" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-zinc-200 shadow-lg">
          {priceTypes.map((priceType) => (
            <SelectItem key={priceType.id} value={priceType.id.toString()}>
              {priceType.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}