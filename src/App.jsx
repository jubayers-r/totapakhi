import { Button } from '@/components/ui/button';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-950 p-6">
      <h1 className="text-xl font-semibold text-slate-100">shadcn/ui Test</h1>

      <div className="flex flex-wrap gap-3">
        {/* Default Variant */}
        <Button onClick={() => alert('Default button clicked!')}>
          Default
        </Button>

        {/* Destructive Variant */}
        <Button variant="destructive">Destructive</Button>

        {/* Outline Variant */}
        <Button variant="outline">Outline</Button>
      </div>
    </div>
  );
}
