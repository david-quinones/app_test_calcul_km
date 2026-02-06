import { useState } from "react";
import { Copy, Download, CheckCircle, AlertCircle, MapPin, Navigation, Clock, Route, Trash2, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RouteResult } from "@/types/route";
import { formatDuration } from "@/services/routeService";
import { toast } from "@/hooks/use-toast";

interface RouteResultsProps {
  result: RouteResult;
  onClear: () => void;
}

export function RouteResults({ result, onClear }: RouteResultsProps) {
  const [copied, setCopied] = useState(false);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getTextToCopy = () => {
    if (result.error) {
      return `ERROR: ${result.error}\nFecha: ${formatDate(result.fechaCalculo)}`;
    }

    return `Trayecto: ${result.origen} → ${result.destino}
Tipo: ${result.idaYVuelta ? "Ida y vuelta" : "Solo ida"}
Distancia: ${result.distanciaKm} km
Duración estimada: ${formatDuration(result.duracionMinutos)}
Precio/km: ${result.precioKm.toFixed(2)} €
PRECIO TOTAL: ${result.precioTotal.toFixed(2)} €
Fecha cálculo: ${formatDate(result.fechaCalculo)}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getTextToCopy());
      setCopied(true);
      toast({
        title: "Copiado al portapapeles",
        description: "Los resultados han sido copiados correctamente",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive",
      });
    }
  };

  const handleExportExcel = () => {
    const headers = ["Campo", "Valor"];
    const rows = result.error
      ? [
          ["Error", result.error],
          ["Origen introducido", result.origen || "No especificado"],
          ["Destino introducido", result.destino || "No especificado"],
          ["Fecha cálculo", formatDate(result.fechaCalculo)],
        ]
      : [
          ["Origen", result.origen],
          ["Destino", result.destino],
          ["Tipo de trayecto", result.idaYVuelta ? "Ida y vuelta" : "Solo ida"],
          ["Distancia (km)", result.distanciaKm.toString()],
          ["Duración estimada", formatDuration(result.duracionMinutos)],
          ["Precio por km (€)", result.precioKm.toFixed(2)],
          ["Precio total (€)", result.precioTotal.toFixed(2)],
          ["Fecha cálculo", formatDate(result.fechaCalculo)],
          ["Error", "Ninguno"],
        ];

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join("\t"))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/tab-separated-values;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `trayecto_${new Date().toISOString().split("T")[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Archivo exportado",
      description: "El archivo Excel ha sido descargado",
    });
  };

  if (result.error) {
    return (
      <Card className="w-full border-destructive/50 bg-destructive/5 animate-slide-up shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-display flex items-center gap-2 text-destructive">
            <AlertCircle className="h-6 w-6" />
            Error en el cálculo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-destructive font-medium">{result.error}</p>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Fecha del intento: {formatDate(result.fechaCalculo)}</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1">
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copiado" : "Copiar"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel} className="flex-1">
              <Download className="h-4 w-4" />
              Exportar Excel
            </Button>
            <Button variant="ghost" size="sm" onClick={onClear}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-success/30 bg-success/5 animate-slide-up shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-display flex items-center gap-2 text-success">
          <CheckCircle className="h-6 w-6" />
          Resultado del cálculo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
            <MapPin className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Origen</p>
              <p className="font-medium text-sm break-words">{result.origen}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
            <Navigation className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Destino</p>
              <p className="font-medium text-sm break-words">{result.destino}</p>
            </div>
          </div>

          {result.idaYVuelta && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
              <ArrowLeftRight className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Trayecto ida y vuelta</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
              <Route className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Distancia</p>
                <p className="font-semibold text-lg">{result.distanciaKm} km</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
              <Clock className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Duración</p>
                <p className="font-semibold text-lg">{formatDuration(result.duracionMinutos)}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl gradient-hero text-primary-foreground">
            <p className="text-sm opacity-90">Precio total del trayecto</p>
            <p className="text-4xl font-bold font-display">{result.precioTotal.toFixed(2)} €</p>
            <p className="text-sm opacity-75 mt-1">
              {result.distanciaKm} km × {result.precioKm.toFixed(2)} €/km
            </p>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Calculado el {formatDate(result.fechaCalculo)}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" size="sm" onClick={handleCopy} className="flex-1">
            {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
          <Button variant="accent" size="sm" onClick={handleExportExcel} className="flex-1">
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
          <Button variant="ghost" size="sm" onClick={onClear}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
