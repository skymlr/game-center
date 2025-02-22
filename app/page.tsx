import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-extrabold text-white mb-8 drop-shadow-lg">Game Center</h1>
      <div className="grid grid-cols-1 gap-6 w-full max-w-md">
        <Link href="/games/snake">
          <div className="block bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-white p-6 rounded-lg shadow-xl text-center text-2xl font-semibold transform hover:scale-105">
            Snake Game
          </div>
        </Link>
        <Link href="/games/dino">
          <div className="block bg-green-600 hover:bg-green-700 transition-all duration-300 text-white p-6 rounded-lg shadow-xl text-center text-2xl font-semibold transform hover:scale-105">
            Dino Run
          </div>
        </Link>
      </div>
    </div>
  );
}