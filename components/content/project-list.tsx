import { projects } from "@/data/site-content";
export function ProjectList() {
  return (
    <div className="card-list">
      {projects.map((project, index) => (
        <article className="project-card" key={project.title} tabIndex={0} data-vim-item>
          <div className="card-index">0{index + 1}</div>
          <div>
            <div className="card-meta">
              <span>{project.status}</span>
              <time>{project.year}</time>
            </div>
            <h2>{project.title}</h2>
            <p>{project.summary}</p>
            <div className="tags">
              {project.stack.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
