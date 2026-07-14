# LazyVim Portfolio

A keyboard-first personal portfolio built with Next.js, TypeScript, and Tailwind CSS. The interface recreates the feel of LazyVim with the Tokyo Night color palette, editor buffers, relative line numbers, and Vim-style navigation.

## Development

```bash
npm install
npm run dev
```

The development server is available at `http://localhost:3000`.

## Project commands

```bash
npm run format        # Format authored files
npm run format:check  # Verify formatting without changing files
npm run lint          # Run ESLint
npm test              # Build and run server-rendering tests
npm run build         # Create a production build
```

## Architecture

- `app/` contains the App Router pages and global Tokyo Night styles.
- `components/app-shell.tsx` owns global keyboard input, search, cursor movement, and editor chrome.
- `components/editor-buffer.tsx` renders route content as Neovim-style buffer lines.
- `components/home-dashboard.tsx` renders the LazyVim dashboard and font-independent pixel banner.
- `components/content/editor-pages.tsx` converts portfolio data into themed editor buffers.
- `data/` contains navigation, commands, profile content, projects, and writing.
- `app/writing/` groups essays, blog posts, and notes into nested folder pages.
- `app/projects/[slug]/` renders individual project pages from the structured project data.
- `hooks/` contains browser-local preference state.

## Keyboard navigation

| Key                       | Action                                      |
| ------------------------- | ------------------------------------------- |
| `h` / `j` / `k` / `l`     | Move left, down, up, or right               |
| `w` / `e` / `b`           | Move by words (`W`, `E`, `B` use WORDS)     |
| `0` / `^` / `$`           | Move to the start, first text, or line end  |
| `gg` / `G`                | Jump to the first or last line              |
| `{count}{motion}`         | Repeat a motion, such as `5j` or `12e`      |
| `v`                       | Enter visual mode and extend with motions   |
| `f`, `F`, `t`, `T`        | Find a character on the current line        |
| `Ctrl-d/u`, `Ctrl-f/b`    | Move half or full viewport                  |
| `/` / `n`                 | Search the buffer / move to the next result |
| `Space e` / `Space Space` | Toggle the explorer / find files            |
| Dashboard letter          | Open a dashboard page from the homepage     |
| `:`                       | Open the command line                       |
| `Escape`                  | Return to normal mode and clear key memory  |

The status line shows the active mode and recent keys. Incomplete counts and chords clear after
900ms; completed commands remain visible for 1.4 seconds.

## Editing portfolio content

Update `data/site-content.ts` to change the biography, projects, writing, contact details, or
social links. Project and writing slugs automatically become nested page URLs and explorer entries.
Update `data/navigation.ts` when adding or renaming a top-level dashboard route.

The name banner is a bitmap alphabet rendered as a CSS grid. Each filled and empty cell has an identical size, preventing Unicode block characters and fallback fonts from distorting its alignment.
