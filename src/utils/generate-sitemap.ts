import fs from 'fs';
import path from 'path';
import { getDB } from '../server/db.js';

/**
 * Dynamically builds a standard XML Sitemap string for Google/Bing crawlers
 * scanning the MAS Sovereign Tours tour catalog and blog directory.
 */
export function buildSitemapXml(domainUrl: string = 'https://mas-sovereign-tours.com'): string {
  const db = getDB();
  const currentDate = new Date().toISOString().split('T')[0];

  const staticUrls = [
    { loc: '', priority: '1.0', changefreq: 'daily' },
    { loc: '/gallery', priority: '0.8', changefreq: 'weekly' },
    { loc: '/blog', priority: '0.8', changefreq: 'weekly' }
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Static Pages
  staticUrls.forEach(url => {
    xml += '  <url>\n';
    xml += `    <loc>${domainUrl}${url.loc}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    xml += `    <priority>${url.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  // Dynamic Tour Catalog Pages
  if (db && Array.isArray(db.tours)) {
    db.tours.forEach(tour => {
      xml += '  <url>\n';
      xml += `    <loc>${domainUrl}/tour/${tour.id}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.9</priority>\n';
      xml += '  </url>\n';
    });
  }

  // Dynamic Blog Post Pages
  if (db && Array.isArray(db.blogs)) {
    db.blogs.forEach(blog => {
      const slug = blog.slug || blog.id;
      if (slug) {
        xml += '  <url>\n';
        xml += `    <loc>${domainUrl}/blog/${slug}</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.7</priority>\n';
        xml += '  </url>\n';
      }
    });
  }

  xml += '</urlset>';
  return xml;
}

/**
 * Runs directly to output static sitemap.xml files during builds or deployment.
 */
export function runStaticGeneration() {
  try {
    const xmlContent = buildSitemapXml();
    
    // Ensure directories exist and write to both source public and production dist folders
    const pathsToWrite = [
      path.join(process.cwd(), 'public', 'sitemap.xml'),
      path.join(process.cwd(), 'dist', 'sitemap.xml')
    ];

    pathsToWrite.forEach(filePath => {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, xmlContent, 'utf8');
      console.log(`[Sitemap Generator] Wrote live sitemap successfully to: ${filePath}`);
    });
  } catch (error) {
    console.error('[Sitemap Generator] Error creating static sitemap:', error);
  }
}

// Execute static sitemap generation if executed directly
if (import.meta.url.endsWith(process.argv[1])) {
  runStaticGeneration();
}
