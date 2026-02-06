import { useState } from "react";
import { MapPin, Navigation, Euro, Calculator, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RouteResult } from "@/types/route";
import { geocodeAddress, calculateRoute } from "@/services/routeService";

interface RouteFormProps {
  onResult: (result: RouteResult) => void;
}

export function RouteForm({ onResult }: RouteFormProps) {
  const [pricePerKm, setPricePerKm] = useState<string>("0.30");
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [roundTrip, setRoundTrip] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const price = parseFloat(pricePerKm);

    // Validaciones
    if (isNaN(price) || price <= 0) {
      onResult({
        origen: origin,
        destino: destination,
        distanciaKm: 0,
        precioKm: 0,
        precioTotal: 0,
        duracionMinutos: 0,
        fechaCalculo: new Date().toISOString(),
        idaYVuelta: roundTrip,
        error: "El precio por kilómetro debe ser un número mayor que 0. Ejemplo: 0.30",
      });
      setLoading(false);
      return;
    }

    if (!origin.trim()) {
      onResult({
        origen: origin,
        destino: destination,
        distanciaKm: 0,
        precioKm: price,
        precioTotal: 0,
        duracionMinutos: 0,
        fechaCalculo: new Date().toISOString(),
        idaYVuelta: roundTrip,
        error: "Debes introducir una dirección de origen. Ejemplo: Madrid, España",
      });
      setLoading(false);
      return;
    }

    if (!destination.trim()) {
      onResult({
        origen: origin,
        destino: destination,
        distanciaKm: 0,
        precioKm: price,
        precioTotal: 0,
        duracionMinutos: 0,
        fechaCalculo: new Date().toISOString(),
        idaYVuelta: roundTrip,
        error: "Debes introducir una dirección de destino. Ejemplo: Barcelona, España",
      });
      setLoading(false);
      return;
    }

    try {
      // Geocodificar origen
      const originGeo = await geocodeAddress(origin);
      
      // Pequeña pausa para respetar límites de la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Geocodificar destino
      const destGeo = await geocodeAddress(destination);
      
      // Calcular ruta
      const route = await calculateRoute(originGeo, destGeo);
      
      const distanceKm = route.distance / 1000;
      const durationMinutes = route.duration / 60;
      
      // Si es ida y vuelta, multiplicar por 2
      const multiplier = roundTrip ? 2 : 1;
      const totalDistance = distanceKm * multiplier;
      const totalDuration = durationMinutes * multiplier;
      const totalPrice = totalDistance * price;

      onResult({
        origen: originGeo.displayName,
        destino: destGeo.displayName,
        distanciaKm: Math.round(totalDistance * 10) / 10,
        precioKm: price,
        precioTotal: Math.round(totalPrice * 100) / 100,
        duracionMinutos: Math.round(totalDuration),
        fechaCalculo: new Date().toISOString(),
        idaYVuelta: roundTrip,
        error: null,
      });
    } catch (err) {
      onResult({
        origen: origin,
        destino: destination,
        distanciaKm: 0,
        precioKm: price,
        precioTotal: 0,
        duracionMinutos: 0,
        fechaCalculo: new Date().toISOString(),
        idaYVuelta: roundTrip,
        error: err instanceof Error ? err.message : "Error desconocido al calcular la ruta",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-0 gradient-card animate-fade-in">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-display flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" />
          Calcular Trayecto
        </CardTitle>
        <CardDescription>
          Introduce los datos del viaje para calcular el precio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pricePerKm" className="flex items-center gap-2 text-sm font-medium">
              <Euro className="h-4 w-4 text-primary" />
              Precio por kilómetro (€)
            </Label>
            <Input
              id="pricePerKm"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.30"
              value={pricePerKm}
              onChange={(e) => setPricePerKm(e.target.value)}
              className="h-12 text-lg border-2 focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="origin" className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-success" />
              Dirección de origen
            </Label>
            <Input
              id="origin"
              type="text"
              placeholder="Madrid, España"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="h-12 text-lg border-2 focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination" className="flex items-center gap-2 text-sm font-medium">
              <Navigation className="h-4 w-4 text-destructive" />
              Dirección de destino
            </Label>
            <Input
              id="destination"
              type="text"
              placeholder="Barcelona, España"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="h-12 text-lg border-2 focus:border-primary transition-colors"
            />
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 border">
            <Checkbox
              id="roundTrip"
              checked={roundTrip}
              onCheckedChange={(checked) => setRoundTrip(checked === true)}
            />
            <Label 
              htmlFor="roundTrip" 
              className="text-sm font-medium cursor-pointer select-none"
            >
              Ida y vuelta
            </Label>
          </div>

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Calculando ruta...
              </>
            ) : (
              <>
                <Calculator className="h-5 w-5" />
                Calcular Precio
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
