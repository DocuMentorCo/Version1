"use client";

import ContractAnalysisResults from "@/components/analysis/contract-analysis-results";
import EmptyState from "@/components/analysis/empty-state";
import { useContractStore } from "@/store/zustand";

export default function ContractResultsPage() {
  const analysisResults = useContractStore((state) => state.analysisrResults); // fixed access to match Zustand store

  if (!analysisResults) {
    return <EmptyState title="No Analysis" description="Please try again" />;
  }

  return (
    <ContractAnalysisResults
      contractId={analysisResults._id}
      isActive={true}
      analysisResults={analysisResults}
      onUpgrade={() => {}} // temporary no-op to satisfy prop requirement
    />
  );
}