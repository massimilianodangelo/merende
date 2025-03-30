import { Clock } from "lucide-react";

export function Countdown() {
  // Ordini sempre disponibili, nessuna limitazione oraria
  return (
    <div className="py-2 px-4 text-sm flex justify-center items-center bg-green-50 text-green-700">
      <Clock className="h-4 w-4 mr-2" />
      <span>Ordini sempre disponibili</span>
    </div>
  );
}
