---
layout: default
title: ""              # blank so Jekyll doesn’t print a page title
---

<style>
  /* —— Hide whatever header your theme is shoving up there —— */
  h1:first-of-type { display: none !important; }
  html, body {
    background-color: #1F2529 !important;
  }
  /* —— Page styling —— */
  body {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    background: #1F2529;
    color: #e0e0e0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    line-height: 1.7;
  }
  a { color: #58a6ff; }

  h1, h2, h3 {
    margin-top: 2.5rem;
    margin-bottom: 1rem;
  }
  p      { margin-bottom: 1.25rem; }
  ul, ol { margin-bottom: 1.5rem; }
  code, pre {
    background: #1e1e1e;
    border-radius: 4px;
    padding: .4em;
    overflow-x: auto;
  }
  pre { padding: 1em; }
  blockquote {
    border-left: 4px solid #333;
    padding-left: 1rem;
    color: #bbb;
    margin: 1.5rem 0;
  }

  /* —— Extra breathing room in your lists —— */
  ul > li { margin: 1.5rem 0; }
  ul li ul {
    margin-top: .5rem;
    margin-left: 1.2rem;
  }
</style>

{% include_relative README.md %}
