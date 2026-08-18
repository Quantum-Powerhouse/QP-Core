"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { QuantumEventBus, type QuantumEvent, type QuantumEventType } from "@/lib/quantum/events";

const QuantumEventBusContext = createContext<QuantumEventBus | null>(null);

export function QuantumEventProvider({ children }: { children: React.ReactNode }) {
  const [bus] = useState(() => new QuantumEventBus());

  return (
    <QuantumEventBusContext.Provider value={bus}>{children}</QuantumEventBusContext.Provider>
  );
}

/** Returns the shared bus for emitting events. */
export function useQuantumEventBus(): QuantumEventBus {
  const bus = useContext(QuantumEventBusContext);
  if (!bus) throw new Error("useQuantumEventBus must be used within a QuantumEventProvider");
  return bus;
}

/** Subscribes to a single event type for the lifetime of the component. */
export function useQuantumEvents<T extends QuantumEventType>(
  type: T,
  listener: (event: QuantumEvent<T>) => void,
): void {
  const bus = useQuantumEventBus();
  const listenerRef = useRef(listener);
  useEffect(() => {
    listenerRef.current = listener;
  });

  useEffect(() => bus.on(type, (event) => listenerRef.current(event)), [bus, type]);
}

/** Subscribes to every event type — for a single ambient consumer (e.g. the living field). */
export function useAnyQuantumEvent(listener: (event: QuantumEvent) => void): void {
  const bus = useQuantumEventBus();
  const listenerRef = useRef(listener);
  useEffect(() => {
    listenerRef.current = listener;
  });

  useEffect(() => bus.onAny((event) => listenerRef.current(event)), [bus]);
}
