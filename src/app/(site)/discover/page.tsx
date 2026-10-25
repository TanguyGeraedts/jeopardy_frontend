import { RequireAuth } from "@/components/auth/RequireAuth";
import { Discover } from "@/components/discover/Discover";

export default function DiscoverPage() {
  return (
    <RequireAuth>
      <Discover />
    </RequireAuth>
  );
}
