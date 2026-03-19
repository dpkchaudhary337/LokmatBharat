import Axios from "axios";
import configData from "../../../lib/amp-config";
import Head from "next/head";

// Next.js Pages Router AMP support
export const config = { amp: true };

async function getPostDetails(postSlug) {
  const axiosConfig = {
    headers: {
      sessionToken: configData.SESSION_TOKEN,
    },
  };

  try {
    const [postRes, settingsRes, menuRes, footerMenuRes] = await Promise.all([
      Axios.get(`${configData.POST_DETAIL_API_URL}${postSlug}`, axiosConfig),
      Axios.get(configData.SETTING_URL, axiosConfig),
      Axios.get(configData.MENU_API_URL, axiosConfig),
      Axios.get(configData.FOOTER_MENU_API_URL, axiosConfig),
    ]);

    const post = JSON.parse(postRes.data.payload);
    const settings = JSON.parse(settingsRes.data.payload || "[]");
    const menus = JSON.parse(menuRes.data.payload || "[]");
    const footerMenu = JSON.parse(footerMenuRes.data.payload || "[]");
    const settingData = Array.isArray(settings) ? settings[0] : settings || {};

    // Fetch related news
    let relatedNews = [];
    try {
      const relatedRes = await Axios.get(
        `${configData.RELATED_NEWS_API_URL}${post.ID || 0}`,
        axiosConfig
      );
      relatedNews = JSON.parse(relatedRes.data.payload || "[]");
    } catch (error) {
      console.error("Error fetching related news:", error);
    }

    return {
      post,
      relatedNews: Array.isArray(relatedNews) ? relatedNews : [],
      settingData,
      menus: Array.isArray(menus) ? menus : [],
      footerMenu: Array.isArray(footerMenu) ? footerMenu : [],
    };
  } catch (error) {
    console.error("Error fetching post details:", error);
    try {
      const [settingsRes, menuRes, footerMenuRes] = await Promise.all([
        Axios.get(configData.SETTING_URL, axiosConfig),
        Axios.get(configData.MENU_API_URL, axiosConfig),
        Axios.get(configData.FOOTER_MENU_API_URL, axiosConfig),
      ]);
      const settings = JSON.parse(settingsRes.data.payload || "[]");
      const menus = JSON.parse(menuRes.data.payload || "[]");
      const footerMenu = JSON.parse(footerMenuRes.data.payload || "[]");
      const settingData = Array.isArray(settings) ? settings[0] : settings || {};
      return { post: null, relatedNews: [], settingData, menus: Array.isArray(menus) ? menus : [], footerMenu: Array.isArray(footerMenu) ? footerMenu : [] };
    } catch {
      return { post: null, relatedNews: [], settingData: {}, menus: [], footerMenu: [] };
    }
  }
}

export async function getServerSideProps({ params }) {
  const { postSlug } = params;
  const data = await getPostDetails(postSlug);
  return {
    props: {
      ...data,
      postSlug,
    },
  };
}

// Sanitize HTML content for AMP - remove scripts, iframes, event handlers, etc.
function sanitizeForAMP(html) {
  if (!html) return "";
  return html
    // Remove script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove event handlers
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    // Remove iframes (can't use in AMP body without amp-iframe)
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
    // Remove style attributes (AMP doesn't allow inline style on arbitrary elements in body)
    // Actually AMP allows inline styles, just not !important
    .replace(/!important/gi, "")
    // Remove img tags and replace with amp-img
    .replace(/<img\s+([^>]*)>/gi, (match, attrs) => {
      const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
      const altMatch = attrs.match(/alt=["']([^"']*?)["']/i);
      const src = srcMatch ? srcMatch[1] : "";
      const alt = altMatch ? altMatch[1] : "";
      if (!src) return "";
      return `<amp-img src="${src}" alt="${alt}" width="600" height="400" layout="responsive"></amp-img>`;
    })
    // Remove form elements
    .replace(/<form\b[^>]*>[\s\S]*?<\/form>/gi, "")
    // Remove input elements
    .replace(/<input\b[^>]*>/gi, "")
    // Remove button elements
    .replace(/<button\b[^>]*>[\s\S]*?<\/button>/gi, "");
}

export default function AMPDetailPage({ post, relatedNews, postSlug, settingData, menus, footerMenu }) {
  if (!post) {
    return (
      <>
        <Head>
          <title>Post Not Found | Lokmat Bharat</title>
          <link rel="canonical" href={`https://lokmatbharat.com/details/${postSlug}`} />
        </Head>
        <style jsx global>{`
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; background: #f5f5f5; }
          .main-navbar { background: #a10509; padding: 12px 0; }
          .navbar-inner { max-width: 1200px; margin: 0 auto; padding: 0 15px; text-align: center; }
          .container { max-width: 1200px; margin: 0 auto; padding: 0 15px; }
          .content-section { background: #fff; padding: 30px; margin: 20px 0; border-radius: 8px; }
        `}</style>
        <nav className="main-navbar">
          <div className="navbar-inner">
            <a href="/amp">
              {settingData?.LogoLiveUrl ? (
                <amp-img src={settingData.LogoLiveUrl} alt="Lokmat Bharat" width="130" height="50" layout="fixed"></amp-img>
              ) : (
                <span style={{ color: "#fff", fontSize: "22px", fontWeight: "bold" }}>Lokmat Bharat</span>
              )}
            </a>
          </div>
        </nav>
        <div className="container">
          <div className="content-section">
            <h1>Post Not Found</h1>
            <p style={{ marginTop: "15px" }}><a href="/amp" style={{ color: "#a10509" }}>← Back to Home</a></p>
          </div>
        </div>
      </>
    );
  }

  const title = post.TitleData?.[0]?.Translation || "";
  const rawDescription = post.DescriptionData?.[0]?.Translation || "";
  const cleanDescription = sanitizeForAMP(rawDescription);
  const mainImage = post.PostFiles?.[0]?.AssetLiveUrl || "/assets/images/no-image.png";
  const canonicalUrl = `https://lokmatbharat.com/details/${postSlug}`;
  const metaDescription = rawDescription.replace(/<[^>]*>/g, "").substring(0, 160);

  return (
    <>
      <Head>
        <title>{title} | Lokmat Bharat</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="icon" href="/assets/images/favicon.ico" />
        <script async custom-element="amp-social-share" src="https://cdn.ampproject.org/v0/amp-social-share-0.1.js"></script>
        <script async custom-element="amp-analytics" src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js"></script>
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={mainImage} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:image" content={mainImage} />
      </Head>

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          margin: 0;
          padding: 0;
          background: #f5f5f5;
          color: #333;
        }
        a { text-decoration: none; color: inherit; }

        /* Top Header */
        .top-header {
          background: #1a1a2e;
          color: #fff;
          padding: 6px 0;
          font-size: 13px;
        }
        .top-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Main Navbar */
        .main-navbar {
          background: #a10509;
          padding: 10px 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .navbar-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-menu {
          display: flex;
          list-style: none;
          gap: 0;
          flex-wrap: wrap;
        }
        .nav-menu li a {
          color: #fff;
          padding: 8px 12px;
          font-size: 14px;
          font-weight: 500;
        }

        /* Container */
        .container { max-width: 1200px; margin: 0 auto; padding: 0 15px; }

        /* Article Layout */
        .article-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 25px;
          margin: 20px 0;
        }

        /* Article Content */
        .article-section {
          background: #fff;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .article-title {
          font-size: 26px;
          font-weight: 700;
          line-height: 1.3;
          color: #222;
          margin-bottom: 15px;
        }
        .article-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 15px;
          color: #666;
          font-size: 14px;
          padding-bottom: 12px;
          border-bottom: 1px solid #eee;
        }
        .article-category-tag {
          display: inline-block;
          padding: 4px 14px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 700;
          color: #fff;
        }
        .article-share {
          display: flex;
          gap: 8px;
          margin: 15px 0;
        }
        .article-image {
          margin: 18px 0;
          border-radius: 8px;
          overflow: hidden;
        }
        .article-body {
          line-height: 1.9;
          color: #444;
          font-size: 16px;
        }
        .article-body p { margin-bottom: 16px; }
        .article-body h2, .article-body h3 {
          margin: 20px 0 10px;
          color: #222;
        }
        .article-body amp-img {
          margin: 15px 0;
          border-radius: 6px;
        }

        /* Sidebar */
        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .sidebar-section {
          background: #fff;
          padding: 18px;
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }

        /* Related News */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 3px solid #a10509;
        }
        .section-header h2 {
          font-size: 20px;
          font-weight: 700;
          color: #29293a;
          margin: 0;
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }
        .news-card {
          background: #fff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        }
        .news-card-body { padding: 12px; }
        .news-card-title {
          font-size: 14px;
          font-weight: 600;
          line-height: 1.4;
          color: #333;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0;
        }
        .news-card-date { color: #999; font-size: 11px; margin-top: 6px; }

        /* Footer */
        .footer {
          background: #1a1a2e;
          color: #ddd;
          padding: 30px 0 0;
          margin-top: 30px;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1.5fr 1fr;
          gap: 25px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 15px 25px;
        }
        .footer h4 {
          color: #fff;
          font-size: 16px;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #a10509;
        }
        .footer-links { list-style: none; padding: 0; }
        .footer-links li { margin-bottom: 8px; }
        .footer-links a { color: #ccc; font-size: 13px; }
        .footer-contact p { font-size: 13px; color: #ccc; margin-bottom: 6px; }
        .footer-copyright {
          background: #111;
          text-align: center;
          padding: 12px;
          font-size: 12px;
          color: #888;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .article-grid { grid-template-columns: 1fr; }
          .related-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .footer-grid { grid-template-columns: 1fr 1fr; }
          .nav-menu { display: none; }
          .article-title { font-size: 20px; }
        }
        @media (max-width: 480px) {
          .related-grid { grid-template-columns: 1fr; }
          .footer-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Top Header */}
      <div className="top-header">
        <div className="top-header-inner">
          <span>{new Date().toLocaleDateString("hi-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
      </div>

      {/* Navbar */}
      <nav className="main-navbar">
        <div className="navbar-inner">
          <a href="/amp">
            {settingData?.LogoLiveUrl ? (
              <amp-img src={settingData.LogoLiveUrl} alt="Lokmat Bharat" width="130" height="50" layout="fixed"></amp-img>
            ) : (
              <span style={{ color: "#fff", fontSize: "22px", fontWeight: "bold" }}>Lokmat Bharat</span>
            )}
          </a>
          <ul className="nav-menu">
            {menus.slice(0, 8).map((menu, i) => (
              <li key={i}><a href={`/amp/category/${menu.Slug}`}>{menu.MenuTitle}</a></li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="container">
        <div className="article-grid">
          {/* Main Article */}
          <div className="article-section">
            <h1 className="article-title">{title}</h1>

            <div className="article-meta">
              <span>{post.CreatedOnStr || ""}</span>
              {post.CategoryName && (
                <span className="article-category-tag" style={{ backgroundColor: post.CategoryColor || "#a10509" }}>
                  {post.CategoryName}
                </span>
              )}
            </div>

            <div className="article-share">
              <amp-social-share type="facebook" data-param-url={canonicalUrl} data-param-text={title} width="36" height="36"></amp-social-share>
              <amp-social-share type="twitter" data-param-url={canonicalUrl} data-param-text={title} width="36" height="36"></amp-social-share>
              <amp-social-share type="whatsapp" data-param-url={canonicalUrl} data-param-text={title} width="36" height="36"></amp-social-share>
            </div>

            <div className="article-image">
              <amp-img
                src={mainImage}
                alt={title}
                width="800"
                height="450"
                layout="responsive"
              ></amp-img>
            </div>

            {cleanDescription && (
              <div className="article-body" dangerouslySetInnerHTML={{ __html: cleanDescription }} />
            )}

            <div style={{ marginTop: "25px", padding: "12px", background: "#f0f0f0", borderRadius: "6px" }}>
              <a href={`/details/${postSlug}`} style={{ color: "#a10509", fontWeight: "600" }}>
                View Regular Version →
              </a>
            </div>
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            {settingData?.YoutubeVideoURL && (
              <div className="sidebar-section">
                <h4 style={{ marginBottom: "10px", color: "#333" }}>Featured Video</h4>
                <amp-iframe
                  src={settingData.YoutubeVideoURL}
                  width="400"
                  height="225"
                  layout="responsive"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                >
                  <amp-img placeholder src="/assets/images/no-image.png" width="400" height="225" layout="responsive"></amp-img>
                </amp-iframe>
              </div>
            )}
          </div>
        </div>

        {/* Related News */}
        {relatedNews.length > 0 && (
          <div className="article-section" style={{ marginBottom: "20px" }}>
            <div className="section-header">
              <h2>Related News</h2>
            </div>
            <div className="related-grid">
              {relatedNews.map((news, i) => (
                <a key={i} href={`/amp/details/${news.Slug}`}>
                  <div className="news-card">
                    <amp-img
                      src={news.PostFiles?.[0]?.AssetLiveUrl || "/assets/images/no-image.png"}
                      alt={news.TitleData?.[0]?.Translation || "News"}
                      width="300"
                      height="200"
                      layout="responsive"
                    ></amp-img>
                    <div className="news-card-body">
                      <h3 className="news-card-title">{news.TitleData?.[0]?.Translation || "News"}</h3>
                      <div className="news-card-date">{news.CreatedOnStr || ""}</div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            {settingData?.FooterLogoLiveUrl && (
              <amp-img src={settingData.FooterLogoLiveUrl} alt="Lokmat Bharat" width="150" height="50" layout="fixed"></amp-img>
            )}
          </div>
          <div>
            <h4>USEFUL LINKS</h4>
            <ul className="footer-links">
              {footerMenu.map((menu, i) => (
                <li key={i}><a href={`/amp/${menu.Slug}`}>{menu.MenuTitle}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Contact Us</h4>
            <div className="footer-contact">
              {settingData?.Address && <p>📍 {settingData.Address}</p>}
              {settingData?.Mobile1 && <p>📞 {settingData.Mobile1}</p>}
              {settingData?.MailID && <p>✉️ {settingData.MailID}</p>}
            </div>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/amp">Home</a></li>
              <li><a href="/">Regular Version</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-copyright">
          {settingData?.Copyright || "© Lokmat Bharat. All Rights Reserved."}
        </div>
      </footer>

      <amp-analytics type="gtag" data-credentials="include">
        <script type="application/json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            vars: { gtag_id: "G-1VQLRQN658", config: { "G-1VQLRQN658": { groups: "default" } } },
          }),
        }} />
      </amp-analytics>
    </>
  );
}
