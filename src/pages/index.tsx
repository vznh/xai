import { Generate, Upload, Viewer, Preview } from "@/dashboard";

export default function Home() {
  return (
    <div className="h-screen overflow-hidden bg-background">
      <div className="flex flex-col lg:flex-row h-full">
        <div className="w-full lg:w-1/2 p-4 space-y-4 overflow-auto">
          <Upload />
          <Generate />
          <div className="text-xs text-muted-foreground text-center">
            No fonts inferred—set your typography downstream
          </div>
        </div>

        <div className="w-full lg:w-1/2 p-4 space-y-4 overflow-hidden">
          <div className="h-1/2">
            <Preview />
          </div>
          <div className="h-1/2">
            <Viewer />
          </div>
        </div>
      </div>
    </div>
  );
}
