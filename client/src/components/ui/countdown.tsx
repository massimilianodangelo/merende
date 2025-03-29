import { useState, useEffect } from "react";
import { isBeforeOrderDeadline, getTodayWithTime } from "@/lib/utils";
import { Clock } from "lucide-react";

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [beforeDeadline, setBeforeDeadline] = useState<boolean>(isBeforeOrderDeadline());
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const deadline = getTodayWithTime(10, 30); // 10:30 AM
      const diff = deadline.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft("Ordini chiusi per oggi");
        setBeforeDeadline(false);
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      setBeforeDeadline(true);
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className={`py-2 px-4 text-sm flex justify-center items-center ${beforeDeadline ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
      <Clock className="h-4 w-4 mr-2" />
      <span>{beforeDeadline ? `Ordina entro: ${timeLeft}` : timeLeft}</span>
    </div>
  );
}
