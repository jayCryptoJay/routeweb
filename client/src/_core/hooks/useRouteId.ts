import { useEffect, useState } from "react";

export function useRouteId() {
  const [routeId, setRouteIdState] = useState<string>("default");

  useEffect(() => {
    const saved = localStorage.getItem("routeId");
    if (saved) {
      setRouteIdState(saved);
    }
  }, []);

  const setRouteId = (id: string) => {
    localStorage.setItem("routeId", id);
    setRouteIdState(id);
  };

  return { routeId, setRouteId };
}
