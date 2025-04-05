"use client";

import { ContractAnalysis } from "@/interfaces/contract.interface";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { UploadModal } from "../modals/upload-modal";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function UserContracts() {
  const { data: contracts, refetch } = useQuery<ContractAnalysis[]>({
    queryKey: ["user-contracts"],
    queryFn: fetchUserContracts,
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const contractTypeColors: { [key: string]: string } = {
    Employment: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    "Non-Disclosure Agreement": "bg-green-100 text-green-800 hover:bg-green-200",
    Sales: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    Lease: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
    Services: "bg-pink-100 text-pink-800 hover:bg-pink-200",
    Other: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  };

  const deleteContract = async (id: string) => {
    try {
      await api.delete(`/contracts/${id}`);
      toast.success("Contract deleted successfully");
      refetch(); // Refresh the data after deletion
    } catch (error) {
      console.error("Error deleting contract:", error);
      toast.error("Failed to delete contract");
    }
  };

  const columns: ColumnDef<ContractAnalysis>[] = [
    {
      accessorKey: "_id",
      header: () => <Button variant="ghost">Contract ID</Button>,
      cell: ({ row }) => <div className="font-medium">{row.getValue<string>("_id")}</div>,
    },
    {
      accessorKey: "overallScore",
      header: () => <Button variant="ghost">Overall Score</Button>,
      cell: ({ row }) => {
        const score = parseFloat(row.getValue("overallScore"));
        return (
          <Badge
            className="rounded-md"
            variant={score > 75 ? "success" : score < 50 ? "destructive" : "secondary"}
          >
            {score.toFixed(2)} Overall Score
          </Badge>
        );
      },
    },
    {
      accessorKey: "contractType",
      header: "Contract Type",
      cell: ({ row }) => {
        const contractType = row.getValue("contractType") as string;
        const colorClass = contractTypeColors[contractType] || contractTypeColors["Other"];
        return <Badge className={cn("rounded-md", colorClass)}>{contractType}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const contract = row.original;
        return (
          <div className="flex items-center gap-3">
            <Link href={`/dashboard/contract/${contract._id}`}>
              <Button size="sm" variant="outline">
                View Results
              </Button>
            </Link>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteContract(contract._id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: contracts ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  const totalContracts = contracts?.length || 0;
  const averageScore =
    totalContracts > 0
      ? (contracts?.reduce((sum, contract) => sum + (contract.overallScore ?? 0), 0) ?? 0) / totalContracts
      : 0;
  const highRiskContracts =
    contracts?.filter((contract) =>
      contract.risks.some((risk) => risk.severity === "high")
    ).length ?? 0;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Contracts</h1>
        <Button onClick={() => setIsUploadModalOpen(true)}>New Contract</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContracts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Risk Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highRiskContracts}</div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={() => table.reset()}
      />
    </div>
  );
}

async function fetchUserContracts(): Promise<ContractAnalysis[]> {
  const response = await api.get("/contracts/user-contracts");
  return response.data;
}
