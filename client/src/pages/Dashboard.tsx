import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Package, AlertTriangle, DollarSign, ShoppingCart } from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function Dashboard() {
  const { data: overview, isLoading } = trpc.dashboard.overview.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const revenueGrowth = overview.predictedRevenue > overview.totalRevenue
    ? ((overview.predictedRevenue - overview.totalRevenue) / overview.totalRevenue * 100).toFixed(1)
    : "0";

  const salesChartData = overview.recentSales.slice(0, 7).reverse().map((sale) => ({
    date: new Date(sale.saleDate).toLocaleDateString("pt-BR", { month: "short", day: "numeric" }),
    quantity: sale.quantity,
    revenue: sale.revenue / 100,
  }));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral das suas previsões de demanda e métricas de vendas
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass hover:glow-primary transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card className="glass hover:glow-primary transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overview.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Vendas realizadas</p>
          </CardContent>
        </Card>

        <Card className="glass hover:glow-accent transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Previsão 30 Dias</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overview.predictedRevenue)}</div>
            <p className="text-xs text-accent">
              +{revenueGrowth}% de crescimento previsto
            </p>
          </CardContent>
        </Card>

        <Card className="glass hover:glow-primary transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.unreadAlerts}</div>
            <p className="text-xs text-muted-foreground">Requerem atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Vendas Recentes</CardTitle>
            <CardDescription>Últimos 7 dias de vendas</CardDescription>
          </CardHeader>
          <CardContent>
            {salesChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesChartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
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
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">Nenhuma venda registrada</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Quantidade Vendida</CardTitle>
            <CardDescription>Volume de produtos vendidos</CardDescription>
          </CardHeader>
          <CardContent>
            {salesChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesChartData}>
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
                  <Bar dataKey="quantity" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">Nenhuma venda registrada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      {overview.recentAlerts.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Alertas Recentes</CardTitle>
            <CardDescription>Notificações importantes sobre seus produtos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overview.recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-card/50 border border-border"
                >
                  <AlertTriangle
                    className={`h-5 w-5 mt-0.5 ${
                      alert.severity === "high"
                        ? "text-destructive"
                        : alert.severity === "medium"
                        ? "text-yellow-500"
                        : "text-blue-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
