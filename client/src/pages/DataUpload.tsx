import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileJson, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function DataUpload() {
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [uploadedCount, setUploadedCount] = useState(0);

  const { data: products } = trpc.products.list.useQuery();
  const bulkCreateMutation = trpc.sales.bulkCreate.useMutation();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProduct) {
      toast.error("Selecione um produto antes de fazer upload");
      return;
    }

    setIsProcessing(true);
    setUploadStatus("idle");

    try {
      const text = await file.text();
      let salesData: any[] = [];

      if (file.name.endsWith(".json")) {
        salesData = JSON.parse(text);
      } else if (file.name.endsWith(".csv")) {
        const lines = text.split("\n");
        const headers = lines[0].split(",").map(h => h.trim());
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const values = lines[i].split(",").map(v => v.trim());
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index];
          });
          salesData.push(row);
        }
      }

      // Transform data to expected format
      const formattedSales = salesData.map((sale) => ({
        productId: parseInt(selectedProduct),
        quantity: parseInt(sale.quantity || sale.Quantity || "0"),
        revenue: Math.round(parseFloat(sale.revenue || sale.Revenue || sale.price || sale.Price || "0") * 100),
        saleDate: new Date(sale.date || sale.Date || sale.saleDate || sale.SaleDate),
      })).filter(sale => !isNaN(sale.quantity) && !isNaN(sale.revenue));

      if (formattedSales.length === 0) {
        throw new Error("Nenhum dado válido encontrado no arquivo");
      }

      await bulkCreateMutation.mutateAsync({ sales: formattedSales });
      
      setUploadedCount(formattedSales.length);
      setUploadStatus("success");
      toast.success(`${formattedSales.length} registros de vendas importados com sucesso!`);
    } catch (error: any) {
      setUploadStatus("error");
      toast.error(error.message || "Erro ao processar arquivo");
    } finally {
      setIsProcessing(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload de Dados</h1>
        <p className="text-muted-foreground">
          Importe histórico de vendas em CSV ou JSON
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Importar Histórico de Vendas</CardTitle>
            <CardDescription>
              Faça upload de um arquivo CSV ou JSON com dados históricos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Selecione o Produto</Label>
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
              <Label htmlFor="file-upload">Arquivo de Dados</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={!selectedProduct || isProcessing}
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  {isProcessing ? (
                    <>Processando...</>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Selecionar Arquivo
                    </>
                  )}
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {uploadStatus === "success" && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-accent/10 border border-accent">
                <CheckCircle2 className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm font-medium">Upload concluído!</p>
                  <p className="text-xs text-muted-foreground">
                    {uploadedCount} registros importados
                  </p>
                </div>
              </div>
            )}

            {uploadStatus === "error" && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-sm font-medium">Erro no upload</p>
                  <p className="text-xs text-muted-foreground">
                    Verifique o formato do arquivo
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Formato dos Dados</CardTitle>
            <CardDescription>
              Exemplos de formatos aceitos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">CSV</h3>
              </div>
              <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
{`date,quantity,revenue
2024-01-01,10,1500.00
2024-01-02,15,2250.00
2024-01-03,8,1200.00`}
              </pre>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileJson className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">JSON</h3>
              </div>
              <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
{`[
  {
    "date": "2024-01-01",
    "quantity": 10,
    "revenue": 1500.00
  },
  {
    "date": "2024-01-02",
    "quantity": 15,
    "revenue": 2250.00
  }
]`}
              </pre>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• <strong>date</strong>: Data da venda (YYYY-MM-DD)</p>
              <p>• <strong>quantity</strong>: Quantidade vendida</p>
              <p>• <strong>revenue</strong>: Receita em reais</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
