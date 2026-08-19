import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [routeId, setRouteId] = useState("morning-route");
  const [isExtracting, setIsExtracting] = useState(false);
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadMutation = trpc.admin.extractRouteFromImage.useMutation({
    onSuccess: (data) => {
      toast.success(`Successfully extracted ${data.count} stops for route ${routeId}!`);
      setIsExtracting(false);
      queryClient.invalidateQueries();
      setFile(null);
    },
    onError: (error) => {
      toast.error(`Extraction failed: ${error.message}`);
      setIsExtracting(false);
    },
  });

  const handleUpload = async () => {
    if (!file) return;
    setIsExtracting(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      const mimeType = file.type;

      uploadMutation.mutate({
        imageBase64: base64Data,
        mimeType,
        routeId,
      });
    };
    reader.onerror = () => {
      toast.error("Failed to read the file");
      setIsExtracting(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4 flex flex-col gap-6 max-w-lg mx-auto w-full pt-12">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Route Administration</h1>
        <p className="text-slate-400 text-sm">Upload an image of a route to automatically parse and seed stops into the system.</p>
      </div>

      <div className="flex flex-col gap-4 bg-slate-900 p-6 rounded-xl border border-slate-800">
        <h2 className="text-lg font-medium text-slate-200">Upload Route Image</h2>
        
        <div className="space-y-2">
          <Label htmlFor="routeId">Route ID / Driver ID</Label>
          <Input 
            id="routeId" 
            value={routeId} 
            onChange={e => setRouteId(e.target.value)} 
            placeholder="e.g. driver-1-morning" 
            className="bg-slate-950 border-slate-800"
          />
          <p className="text-xs text-slate-500">The uploaded route stops will be assigned to this ID.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="routeImage">Image File</Label>
          <Input 
            id="routeImage" 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="bg-slate-950 border-slate-800"
          />
        </div>

        <Button onClick={handleUpload} disabled={!file || isExtracting} className="w-full">
          {isExtracting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Extracting Stops...
            </>
          ) : (
            "Extract Route from Image"
          )}
        </Button>
      </div>
      
      <Button variant="outline" onClick={() => setLocation("/")}>
        Back to Dashboard
      </Button>
    </div>
  );
}
