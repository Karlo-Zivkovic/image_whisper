"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h2 className="text-2xl font-bold mb-4 text-red-600">
        Something went wrong!
      </h2>
      <pre className="mb-4 text-sm text-red-500 bg-red-50 p-4 rounded">
        {error.message}
      </pre>
      <button
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}
