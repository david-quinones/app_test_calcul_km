import { useState } from "react";
import { Car } from "lucide-react";
import { RouteForm } from "@/components/RouteForm";
import { RouteResults } from "@/components/RouteResults";
import { RouteResult } from "@/types/route";

const Index = () => {
  const [result, setResult] = useState<RouteResult | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero py-8 px-4">
        <div className="container max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm mb-4">
            <Car className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-primary-foreground mb-2">
            Calculadora de Trayectos
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Calcula el precio de tus viajes por carretera
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-2xl mx-auto px-4 py-8 space-y-6">
        <RouteForm onResult={setResult} />
        
        {result && <RouteResults result={result} onClear={() => setResult(null)} />}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Distancias calculadas usando OpenStreetMap</p>
      </footer>
    </div>
  );
};

export default Index;
