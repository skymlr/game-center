import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-4xl font-bold my-4">Game Center</h1>
      <img src="/icons/icon-192x192.png" alt="Icon 192x192" />
      <div className="grid grid-cols-1 gap-4 w-full max-w-md">
        <Link href="/games/snake">
          <div className="block bg-blue-500 text-white p-4 rounded text-center">
            Snake Game
          </div>
        </Link>
        <Link href="/games/dino">
          <div className="block bg-green-500 text-white p-4 rounded text-center">
            Dino Run
          </div>
        </Link>
      </div>
    </div>
  );
}