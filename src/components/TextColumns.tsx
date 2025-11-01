export default function TextColumns() {
  const columns = [
    {
      title: 'Here text',
      content: 'Writing for websites is both simple and complex. On the one hand, all you need to do is say what you mean and in your words.'
    },
    {
      title: 'There text',
      content: 'Are you the thinking of keywords you should rank for? Are you including links in your text to additional information?'
    },
    {
      title: 'Everywhere text',
      content: "There's a theory that people read in an F-shape pattern, and that this should influence how you structure content on your website."
    }
  ];

  return (
    <section className="bg-gradient-to-b from-blue-300 to-blue-200 py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12">
          {columns.map((column, index) => (
            <div key={index}>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {column.title}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {column.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
