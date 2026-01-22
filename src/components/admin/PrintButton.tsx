"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function PrintButton() {
    const handlePrint = () => {
        window.print();
    };

    return (
        <Button
            onClick={handlePrint}
            className="gap-2 no-print bg-slate-800 hover:bg-slate-900 text-white shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 font-bold h-10 px-6 border-0"
        >
            <Printer className="h-4 w-4" />
            Print to PDF
        </Button>
    );
}
