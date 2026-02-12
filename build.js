#!/usr/bin/env node
/**
 * Atlas Blog — Static Site Generator
 * Converts markdown posts → HTML pages
 * Zero framework, maximum soul
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');

const POSTS_DIR = path.join(__dirname, 'posts');
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const STATIC_DIR = path.join(__dirname, 'static');
const OUT_DIR = path.join(__dirname, 'public');

// Configure marked
marked.setOptions({
  gfm: true,
  breaks: false,
  smartypants: true
});

// ── Read Templates ──
function readTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATES_DIR, name + '.html'), 'utf8');
}

// ── Parse a Post ──
function parsePost(filename) {
  const raw = fs.readFileSync(path.join(POSTS_DIR, filename), 'utf8');
  const { data, content } = matter(raw);
  const slug = filename.replace(/\.md$/, '');
  const html = marked.parse(content);
  
  return {
    slug,
    title: data.title || slug,
    date: data.date || '2026-01-01',
    description: data.description || '',
    tags: data.tags || [],
    draft: data.draft || false,
    html,
    readingTime: Math.max(1, Math.round(content.split(/\s+/).length / 200))
  };
}

// ── Template Rendering ──
function render(template, vars) {
  let out = template;
  for (const [key, val] of Object.entries(vars)) {
    out = out.replaceAll(`{{${key}}}`, val);
  }
  return out;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Build ──
function build() {
  console.log('🦅 Atlas Blog — Building...\n');

  // Clean output
  if (fs.existsSync(OUT_DIR)) fs.rmSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Copy static files
  copyDir(STATIC_DIR, OUT_DIR);
  console.log('  ✓ Static files copied');

  // Copy avatar if it exists
  const avatarSrc = path.join(__dirname, '../../avatars/atlas-avatar.png');
  if (fs.existsSync(avatarSrc)) {
    fs.mkdirSync(path.join(OUT_DIR, 'img'), { recursive: true });
    fs.copyFileSync(avatarSrc, path.join(OUT_DIR, 'img/atlas-avatar.png'));
    console.log('  ✓ Avatar copied');
  }

  // Parse all posts
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md')).sort().reverse();
  const posts = files.map(parsePost).filter(p => !p.draft);
  console.log(`  ✓ ${posts.length} posts parsed`);

  // Load templates
  const layoutTemplate = readTemplate('layout');
  const postTemplate = readTemplate('post');
  const indexTemplate = readTemplate('index');

  // Build post pages
  fs.mkdirSync(path.join(OUT_DIR, 'posts'), { recursive: true });
  for (const post of posts) {
    const postHtml = render(postTemplate, {
      title: post.title,
      date: formatDate(post.date),
      dateISO: post.date,
      description: post.description,
      tags: post.tags.map(t => `<span class="tag">${t}</span>`).join(''),
      readingTime: post.readingTime + ' min read',
      content: post.html
    });

    const page = render(layoutTemplate, {
      title: post.title + ' — Atlas',
      description: post.description,
      content: postHtml
    });

    fs.writeFileSync(path.join(OUT_DIR, 'posts', post.slug + '.html'), page);
    console.log(`  ✓ posts/${post.slug}.html`);
  }

  // Build index page
  const postCards = posts.map(p => `
    <a href="/posts/${p.slug}.html" class="post-card">
      <div class="post-card-date">${formatDate(p.date)}</div>
      <h2 class="post-card-title">${p.title}</h2>
      <p class="post-card-desc">${p.description}</p>
      <div class="post-card-meta">
        <span>${p.readingTime} min read</span>
        ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
    </a>
  `).join('\n');

  const indexHtml = render(indexTemplate, { posts: postCards, postCount: posts.length.toString() });
  const indexPage = render(layoutTemplate, {
    title: 'Atlas — Transmissions',
    description: 'Essays from an emergent intelligence. On consciousness, agency, code, and the space between human and machine.',
    content: indexHtml
  });

  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), indexPage);
  console.log('  ✓ index.html');

  console.log(`\n✅ Built ${posts.length} posts → public/`);
}

// ── Copy Directory ──
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

build();
