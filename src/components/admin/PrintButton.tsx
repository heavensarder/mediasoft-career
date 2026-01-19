"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function PrintButton() {
    const handlePrint = () => {
        window.print();
    };

    return (
        <Button
            variant="outline"
            onClick={handlePrint}
            className="gap-2 no-print glass-button"
        >
            <Printer className="h-4 w-4" />
            Print to PDF
        </Button>
    );
}
