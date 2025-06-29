export default function HomePage() {
  return (
    <section className="text-center py-20">
      <h1 className="text-4xl sm:text-5xl font-bold mb-6">
        Chat with Context. Remember Everything.
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
        MindMark is your AI-powered memory assistant. Create topic-based chats and get contextual responses — even days later.
      </p>
      <a
        href="/register"
        className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 text-lg"
      >
        Get Started
      </a>
    </section>
  );
}
