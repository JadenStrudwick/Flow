import { Loader2 } from "lucide-react";

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
      Loading your financial data...
    </h2>
    <p className="mt-2 text-gray-500 dark:text-gray-400">
      Please wait while we crunch the numbers.
    </p>
  </div>
);

export default LoadingScreen;