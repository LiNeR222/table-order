import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useOrderStore } from "@/store/orderStore";
import type { Contragent } from "@/types";
import { Check, User, Loader2 } from "lucide-react";

export function ClientSearch() {
  const [phone, setPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Contragent[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const { selectedContragent, setSelectedContragent } = useOrderStore();

  useEffect(() => {
    if (phone.length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await api.get<Contragent>('/contragents', { phone });
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error("Ошибка поиска клиента:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [phone]);

  const handleSelectClient = (client: Contragent) => {
    setSelectedContragent(client);
    setPhone(client.phone || "");
    setShowResults(false);
  };

  const handleClear = () => {
    setSelectedContragent(null);
    setPhone("");
    setSearchResults([]);
  };

  const formatPhone = (phoneStr: string) => {
    if (!phoneStr) return "";
    const digits = phoneStr.replace(/\D/g, "");
    if (digits.length === 11) {
      return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
    }
    return phoneStr;
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Клиент</label>
      
      {selectedContragent ? (
        <Card className="bg-white">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{selectedContragent.name || "Без имени"}</p>
                <p className="text-sm text-muted-foreground">
                  {formatPhone(selectedContragent.phone || "")}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Изменить
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          <div className="relative">
            <Input
              placeholder="Введите номер телефона"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onFocus={() => phone.length >= 3 && setShowResults(true)}
              className="pr-8 bg-white"
            />
            {isSearching && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          
          {showResults && searchResults.length > 0 && (
            <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white border shadow-lg">
              <CardContent className="p-0">
                {searchResults.map((client) => (
                  <button
                    key={client.id}
                    className="w-full p-3 text-left hover:bg-zinc-100 flex items-center justify-between transition-colors border-b last:border-b-0"
                    onClick={() => handleSelectClient(client)}
                  >
                    <div>
                      <p className="font-medium">{client.name || "Без имени"}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPhone(client.phone || "")}
                      </p>
                    </div>
                    <Check className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
          
          {showResults && !isSearching && phone.length >= 3 && searchResults.length === 0 && (
            <Card className="absolute z-50 w-full mt-1 bg-white border shadow-lg">
              <CardContent className="p-3 text-center text-muted-foreground">
                Клиент не найден
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}