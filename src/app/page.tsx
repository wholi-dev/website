import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen py-8 text-center bg-[color:var(--color-background)] text-[color:var(--color-text)] font-body">
      <div className="mt-8">
        <h1 className="font-title text-6xl md:text-8xl mb-4">Wholi</h1>
        <p className="text-md mb-6 mt-2">An online farmers market ❤️</p>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-xl mb-3">Are you a farmer or a buyer?</p>
        <div className="flex gap-4">
          <Link href="/farmer" className="btn btn-primary">
            Farmer
          </Link>
          <Link href="/buyer" className="btn btn-primary">
            Buyer
          </Link>
        </div>
      </div>
      <div className="mb-8"></div>
    </div>
  );
}