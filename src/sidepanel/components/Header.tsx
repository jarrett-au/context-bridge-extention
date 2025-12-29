import { Power } from 'lucide-react';

export function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
      <h1 className="text-lg font-bold text-gray-800">Context Bridge</h1>
      <button className="p-2 rounded-full hover:bg-gray-100 text-green-600" title="Global Toggle">
        <Power size={20} />
      </button>
    </header>
  );
}
