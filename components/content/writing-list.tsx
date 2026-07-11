import type { Writing } from "@/types/site";
export function WritingList({ items }: { items: Writing[] }) {
  return (
    <div className="writing-list">
      {items.map((item) => (
        <article key={item.title} tabIndex={0} data-vim-item>
          <div className="writing-meta">
            <span>{item.category}</span>
            <time>{item.date}</time>
            <span>{item.readTime}</span>
          </div>
          <h2>{item.title}</h2>
          <p>{item.excerpt}</p>
          <button aria-label={`Read ${item.title}`}>
            Read entry <span>→</span>
          </button>
        </article>
      ))}
    </div>
  );
}
