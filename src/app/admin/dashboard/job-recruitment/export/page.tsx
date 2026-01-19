import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";

export default function ExportPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Export Data</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Export Applications</CardTitle>
                <CardDescription>Download all received applications as CSV.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button className="w-full">
                    <Download className="mr-2 h-4 w-4" /> Download CSV
                </Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Export Jobs</CardTitle>
                <CardDescription>Download all job postings as CSV.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" /> Download CSV
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
