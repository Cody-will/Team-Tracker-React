import * as React from "react";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import type { InfoCardProps, Filter } from "../../components/InfoCard";

export interface Value {}

const CardContext = React.createContext<Value | undefined>(undefined);

export function useCard() {
  const context = React.useContext(CardContext);
  if (!context) {
    throw new Error("Schedule must be inside <CardProvider>");
  }
  return context;
}

export function CardProvider({ children }: any) {
  const value = {};

  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
}
