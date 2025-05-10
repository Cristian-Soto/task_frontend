"use client";

import { useEffect, useState } from 'react';

export default function ClientDate() {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    // Solo se ejecuta en el cliente
    const date = new Date();
    const formatted = date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    setFormattedDate(formatted);
  }, []);

  return (
    <p className="text-gray-600 capitalize">
      {formattedDate || "Cargando fecha..."}
    </p>
  );
}
