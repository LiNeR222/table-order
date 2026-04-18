import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrderStore } from "@/store/orderStore";

export function OrganizationSelect() {
  const { organizations, selectedOrganization, setSelectedOrganization } = useOrderStore();

  if (!organizations || organizations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Организация</label>
      <Select
        value={selectedOrganization?.toString() || ""}
        onValueChange={(value) => setSelectedOrganization(Number(value))}
      >
        <SelectTrigger className="bg-white">
          <SelectValue placeholder="Выберите организацию" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-zinc-200 shadow-lg">
          {organizations.map((org) => (
            <SelectItem key={org.id} value={org.id.toString()}>
              {org.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}