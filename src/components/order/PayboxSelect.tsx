import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrderStore } from "@/store/orderStore";

export function PayboxSelect() {
  const { payboxes, selectedPaybox, setSelectedPaybox } = useOrderStore();

  if (!payboxes || payboxes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Касса (Счёт)</label>
      <Select
        value={selectedPaybox?.toString() || ""}
        onValueChange={(value) => setSelectedPaybox(Number(value))}
      >
        <SelectTrigger className="bg-white">
          <SelectValue placeholder="Выберите кассу" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-zinc-200 shadow-lg">
          {payboxes.map((paybox) => (
            <SelectItem key={paybox.id} value={paybox.id.toString()}>
              {paybox.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}