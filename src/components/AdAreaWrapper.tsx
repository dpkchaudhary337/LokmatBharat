"use client";

import AdArea from "./AdArea";
import AdAreaSkeleton from "./AdAreaSkeleton";

interface AdAreaWrapperProps {
  adHeader?: any;
}

export default function AdAreaWrapper({ adHeader }: AdAreaWrapperProps) {
  if (adHeader?.pAsset) {
    return <AdArea adHeader={adHeader} />;
  }
  return <AdAreaSkeleton />;
}

