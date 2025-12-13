import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, TrendingUp, Package, Trash2, Bell } from "lucide-react";
import { toast } from "sonner";

export default function Alerts() {
  const { data: alerts, isLoading, refetch } = trpc.alerts.list.useQuery();
  const markAsReadMutation = trpc.alerts.markAsRead.useMutation();
  const deleteMutation = trpc.alerts.delete.useMutation();

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsReadMutation.mutateAsync({ id });
      toast.success("Alerta marcado como lido");
      refetch();
    } catch (error) {
      toast.error("Erro ao marcar alerta");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Alerta excluído");
      refetch();
    } catch (error) {
      toast.error("Erro ao excluir alerta");
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "high_demand":
        return <TrendingUp className="h-5 w-5" />;
      case "low_demand":
        return <TrendingUp className="h-5 w-5 rotate-180" />;
      case "stock_alert":
        return <Package className="h-5 w-5" />;
      case "trend_change":
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "high":
        return "Alta";
      case "medium":
        return "Média";
      case "low":
        return "Baixa";
      default:
        return severity;
    }
  };

  const unreadAlerts = alerts?.filter(a => a.isRead === 0) || [];
  const readAlerts = alerts?.filter(a => a.isRead === 1) || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alertas</h1>
          <p className="text-muted-foreground">
            Notificações sobre demanda e estoque
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="text-sm">
            {unreadAlerts.length} não lidos
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <Card className="glass">
          <CardContent className="flex items-center justify-center h-[200px]">
            <p className="text-muted-foreground">Carregando alertas...</p>
          </CardContent>
        </Card>
      ) : !alerts || alerts.length === 0 ? (
        <Card className="glass">
          <CardContent className="flex flex-col items-center justify-center h-[300px] gap-4">
            <CheckCircle2 className="h-16 w-16 text-accent" />
            <div className="text-center">
              <p className="font-semibold">Nenhum alerta ativo</p>
              <p className="text-sm text-muted-foreground">
                Tudo está funcionando perfeitamente!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {unreadAlerts.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Não Lidos</h2>
              <div className="grid gap-4">
                {unreadAlerts.map((alert) => (
                  <Card key={alert.id} className="glass border-l-4 border-l-primary">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-primary/10">
                            {getAlertIcon(alert.alertType)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={getSeverityColor(alert.severity) as any}>
                                {getSeverityText(alert.severity)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(alert.createdAt).toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <p className="text-sm">{alert.message}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkAsRead(alert.id)}
                            disabled={markAsReadMutation.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(alert.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {readAlerts.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Lidos</h2>
              <div className="grid gap-4">
                {readAlerts.map((alert) => (
                  <Card key={alert.id} className="glass opacity-60">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-muted">
                            {getAlertIcon(alert.alertType)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">
                                {getSeverityText(alert.severity)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(alert.createdAt).toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <p className="text-sm">{alert.message}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(alert.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
