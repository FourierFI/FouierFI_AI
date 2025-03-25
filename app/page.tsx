import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="text-center py-20">
          <div className="mb-8">
            <Image
              src="/logo.svg"
              alt="FourierFi Logo"
              width={200}
              height={200}
              className="mx-auto"
            />
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            FourierFi
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Revolutionary DeFi platform combining Fourier transforms with AI and blockchain technology
          </p>
          <div className="flex gap-4 justify-center">
            <button className="btn-primary">Launch App</button>
            <button className="btn-secondary">Learn More</button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-16">
          <div className="card">
            <h3 className="text-xl font-bold text-primary mb-4">
              Fourier Signal Decomposition
            </h3>
            <p className="text-gray-300">
              Advanced market analysis using Fourier transforms to decompose price signals
            </p>
          </div>
          <div className="card">
            <h3 className="text-xl font-bold text-primary mb-4">
              Neural Spectrum AI
            </h3>
            <p className="text-gray-300">
              AI-powered pattern recognition and prediction in the frequency domain
            </p>
          </div>
          <div className="card">
            <h3 className="text-xl font-bold text-primary mb-4">
              Quantum Fourier Encryption
            </h3>
            <p className="text-gray-300">
              State-of-the-art security using quantum-resistant encryption
            </p>
          </div>
        </section>
      </div>
    </main>
  );
} 