import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

export function LoginPage() {
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateToken = async (tokenToCheck: string): Promise<boolean> => {
    try {
      const url = `https://app.tablecrm.com/api/v1/warehouses/?token=${tokenToCheck.trim()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      // Проверяем, что ответ содержит result или это массив
      return !!(data && (data.result || Array.isArray(data)));
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const trimmedToken = token.trim();
    
    if (!trimmedToken) {
      setError("Введите токен");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const isValid = await validateToken(trimmedToken);
      
      if (isValid) {
        localStorage.setItem("tablecrm_token", trimmedToken);
        navigate("/order");
      } else {
        setError("Неверный или недействительный токен. Проверьте токен и попробуйте снова.");
      }
    } catch (err) {
      setError("Ошибка подключения к серверу. Проверьте интернет-соединение.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">TableCRM</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Введите API токен для доступа к кассе
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="af1874616430e04cfd4bce..."
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  setError("");
                }}
                disabled={isLoading}
                autoFocus
                className={error ? "border-destructive" : ""}
              />
              {error && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Проверка токена...
                </>
              ) : (
                "Войти в систему"
              )}
            </Button>
          </form>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Тестовый токен:</strong><br />
              af1874616430e04cfd4bce30035789907e899fc7c3a1a4bb27254828ff304a77
            </p>
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-4">
            Токен можно найти в настройках кассы TableCRM
          </p>
        </CardContent>
      </Card>
    </div>
  );
}