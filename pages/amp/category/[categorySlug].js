import Axios from "axios";
import configData from "../../../lib/amp-config";
import Head from "next/head";

// Next.js Pages Router AMP support
export const config = { amp: true };

async function getCategoryData(categorySlug) {
  const axiosConfig = {
    headers: {
      sessionToken: configData.SESSION_TOKEN,
    },
  };

  try {
    const postUrl = configData.POST_API_URL
      .replace("#CATEGORY_SLUG", categorySlug)
      .replace("#OFFSET", "0");

    const [postRes, settingsRes, menuRes, footerMenuRes] = await Promise.all([
      Axios.get(postUrl, axiosConfig),
      Axios.get(configData.SETTING_URL, axiosConfig),
      Axios.get(configData.MENU_API_URL, axiosConfig),
      Axios.get(configData.FOOTER_MENU_API_URL, axiosConfig),
    ]);

    const posts = JSON.parse(postRes.data.payload || "[]");
    const settings = JSON.parse(settingsRes.data.payload || "[]");
    const menus = JSON.parse(menuRes.data.payload || "[]");
    const footerMenu = JSON.parse(footerMenuRes.data.payload || "[]");
    const settingData = Array.isArray(settings) ? settings[0] : settings || {};

    return {
      posts: Array.isArray(posts) ? posts : [],
      settingData,
      menus: Array.isArray(menus) ? menus : [],
      footerMenu: Array.isArray(footerMenu) ? footerMenu : [],
    };
  } catch (error) {
    console.error("Error fetching category data:", error);
    return {
      posts: [],
      settingData: {},
      menus: [],
      footerMenu: [],
    };
  }
}

export async function getServerSideProps({ params }) {
  const { categorySlug } = params;
  const data = await getCategoryData(categorySlug);
  return {
    props: {
      ...data,
      categorySlug,
    },
  };
}

export default function AMPCategoryPage({ posts, categorySlug, settingData, menus, footerMenu }) {
  const categoryName = posts.length > 0 ? posts[0].CategoryName : categorySlug;

  return (
    <>
      <Head>
        <title>{categoryName} - Lokmat Bharat</title>
        <meta name="description" content={`Latest ${categoryName} news on Lokmat Bharat`} />
        <link rel="canonical" href={`https://lokmatbharat.com/category/${categorySlug}`} />
        <link rel="icon" href="/assets/images/favicon.ico" />
        <script async custom-element="amp-analytics" src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js"></script>
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
        .nav-menu li a:hover {
          background: rgba(255,255,255,0.15);
          border-radius: 4px;
        }

        /* Container */
        .container { max-width: 1200px; margin: 0 auto; padding: 0 15px; }

        /* Category Page Layout */
        .category-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 25px;
          margin: 20px 0;
        }

        /* Section Header */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 3px solid #a10509;
        }
        .section-header h1 {
          font-size: 22px;
          font-weight: 700;
          color: #29293a;
          margin: 0;
        }

        /* Content Section */
        .content-section {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }

        /* News Grid */
        .news-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        .news-card {
          background: #fff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        }
        .news-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
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
        .sidebar-section h3 {
          font-size: 16px;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid #a10509;
          color: #333;
        }

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
          .category-grid { grid-template-columns: 1fr; }
          .news-grid { grid-template-columns: 1fr; }
          .footer-grid { grid-template-columns: 1fr 1fr; }
          .nav-menu { display: none; }
        }
        @media (max-width: 480px) {
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
              <li key={i}>
                <a href={`/amp/category/${menu.Slug}`} style={menu.Slug === categorySlug ? { background: "rgba(255,255,255,0.2)", borderRadius: "4px" } : {}}>
                  {menu.MenuTitle}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="container">
        <div className="category-grid">
          {/* Main Content */}
          <div className="content-section">
            <div className="section-header">
              <h1>{categoryName}</h1>
            </div>

            {posts.length > 0 ? (
              <div className="news-grid">
                {posts.map((post, i) => (
                  <a key={i} href={`/amp/details/${post.Slug}`}>
                    <div className="news-card">
                      <amp-img
                        src={post.PostFiles?.[0]?.AssetLiveUrl || "/assets/images/no-image.png"}
                        alt={post.TitleData?.[0]?.Translation || "News"}
                        width="400"
                        height="250"
                        layout="responsive"
                      ></amp-img>
                      <div className="news-card-body">
                        <h3 className="news-card-title">{post.TitleData?.[0]?.Translation || ""}</h3>
                        <div className="news-card-date">{post.CreatedOnStr || ""}</div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
                No posts found in this category.
              </p>
            )}
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            {settingData?.YoutubeVideoURL && (
              <div className="sidebar-section">
                <h3>Featured Video</h3>
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

            <div className="sidebar-section">
              <h3>Quick Navigation</h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {menus.slice(0, 10).map((menu, i) => (
                  <li key={i} style={{ marginBottom: "8px" }}>
                    <a
                      href={`/amp/category/${menu.Slug}`}
                      style={{
                        color: menu.Slug === categorySlug ? "#a10509" : "#333",
                        fontWeight: menu.Slug === categorySlug ? "700" : "400",
                        fontSize: "14px",
                      }}
                    >
                      {menu.MenuTitle}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
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
              <li><a href={`/category/${categorySlug}`}>Regular Version</a></li>
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
