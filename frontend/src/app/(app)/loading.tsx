import { PageSkeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="p-4 lg:p-6 xl:p-8">
      <PageSkeleton />
    </div>
  );
}
