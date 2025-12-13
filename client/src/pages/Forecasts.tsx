import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, Minus, Sparkles, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function Forecasts() {
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [daysAhead, setDaysAhead] = useState("30");

  const { data: products } = trpc.products.list.useQuery();
  const { data: forecasts, refetch: refetchForecasts } = trpc.forecasts.byProduct.useQuery(
    { productId: parseInt(selectedProduct) },
    { enabled: !!selectedProduct }
  );
  const { data: analysis } = trpc.forecasts.analyze.useQuery(
    { productId: parseInt(selectedProduct) },
    { enabled: !!selectedProduct }
  );

  const generateMutation = trpc.forecasts.generate.useMutation();

  const handleGenerate = async () => {
    if (!selectedProduct) {
      toast.error("Selecione um produto");
      return;
    }

    try {
      await generateMutation.mutateAsync({
        productId: parseInt(selectedProduct),
        daysAhead: parseInt(daysAhead),
      });
      toast.success("Previsões geradas com sucesso!");
      refetchForecasts();
    } catch (error: any) {
      toast.error(error.message || "Erro ao gerar previsões");
    }
  };

  const getTrendIcon = (trend?: string) => {
    if (trend === "increasing") return <TrendingUp className="h-4 w-4 text-accent" />;
    if (trend === "decreasing") return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendText = (trend?: string) => {
    if (trend === "increasing") return "Crescente";
    if (trend === "decreasing") return "Decrescente";
    return "Estável";
  };

  const chartData = forecasts?.slice(0, 30).map((f) => ({
    date: new Date(f.forecastDate).toLocaleDateString("pt-BR", { month: "short", day: "numeric" }),
    quantity: f.predictedQuantity,
    revenue: f.predictedRevenue / 100,
    confidence: f.confidence,
  })) || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Previsões de Demanda</h1>
        <p className="text-muted-foreground">
          Análise preditiva com Machine Learning
        </p>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Gerar Previsões</CardTitle>
          <CardDescription>
            Selecione um produto e o período para análise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Produto</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dias à Frente</Label>
              <Input
                type="number"
                min="1"
                max="90"
                value={daysAhead}
                onChange={(e) => setDaysAhead(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleGenerate}
                disabled={!selectedProduct || generateMutation.isPending}
                className="w-full gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {generateMutation.isPending ? "Gerando..." : "Gerar Previsões"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Análise de Tendência</CardTitle>
              <CardDescription>Direção e força da tendência</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.trend ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Direção</span>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(analysis.trend.direction)}
                      <span className="font-semibold">{getTrendText(analysis.trend.direction)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Força</span>
                    <span className="font-semibold">{analysis.trend.strength.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Taxa de Crescimento</span>
                    <span className="font-semibold">{analysis.trend.growthRate.toFixed(2)}%</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Dados insuficientes para análise</p>
              )}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Análise de Sazonalidade</CardTitle>
              <CardDescription>Padrões sazonais identificados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.seasonality ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tem Sazonalidade?</span>
                    <span className="font-semibold">{analysis.seasonality.hasSeason ? "Sim" : "Não"}</span>
                  </div>
                  {analysis.seasonality.hasSeason && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Fator Sazonal</span>
                        <span className="font-semibold">{analysis.seasonality.seasonalityFactor}%</span>
                      </div>
                      {analysis.seasonality.peakPeriods.length > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Picos</span>
                          <span className="font-semibold">
                            Meses {analysis.seasonality.peakPeriods.join(", ")}
                          </span>
                        </div>
                      )}
                      {analysis.seasonality.lowPeriods.length > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Baixas</span>
                          <span className="font-semibold">
                            Meses {analysis.seasonality.lowPeriods.join(", ")}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Dados insuficientes para análise</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {chartData.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Previsão de Demanda</CardTitle>
            <CardDescription>Quantidade prevista para os próximos dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="quantity"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                  name="Quantidade Prevista"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {!selectedProduct && (
        <Card className="glass">
          <CardContent className="flex flex-col items-center justify-center h-[300px] gap-4">
            <BarChart3 className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">Selecione um produto para ver as previsões</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
