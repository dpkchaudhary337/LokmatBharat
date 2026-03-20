import Axios from "axios";
import configData from "../lib/amp-config";
import Head from "next/head";

// Next.js Pages Router AMP support
export const config = { amp: true };

async function getHomeData() {
  const axiosConfig = {
    headers: {
      sessionToken: configData.SESSION_TOKEN,
    },
  };

  try {
    const [homeSliderRes, marqueeRes, featureRes, settingsRes, menuRes, footerMenuRes, homeCategoryRes] = await Promise.all([
      Axios.get(configData.HOME_SLIDER_API_URL, axiosConfig),
      Axios.get(configData.MARQUEE_API_URL, axiosConfig),
      Axios.get(configData.FEATURE_POST_API_URL.replace("#CATEGORY_SLUG", ""), axiosConfig),
      Axios.get(configData.SETTING_URL, axiosConfig),
      Axios.get(configData.MENU_API_URL, axiosConfig),
      Axios.get(configData.FOOTER_MENU_API_URL, axiosConfig),
      Axios.get(configData.HOME_CATEGORY_BASE_URL, axiosConfig),
    ]);

    const homeSlider = JSON.parse(homeSliderRes.data.payload || "[]");
    const marqueeNews = JSON.parse(marqueeRes.data.payload || "[]");
    const featurePosts = JSON.parse(featureRes.data.payload || "[]");
    const settings = JSON.parse(settingsRes.data.payload || "[]");
    const menus = JSON.parse(menuRes.data.payload || "[]");
    const footerMenu = JSON.parse(footerMenuRes.data.payload || "[]");
    const homeCategories = JSON.parse(homeCategoryRes.data.payload || "[]");
    const settingData = Array.isArray(settings) ? settings[0] : settings || {};

    // Fetch posts for each home category section (first 4 categories)
    const categorySections = [];
    const categoriesToFetch = Array.isArray(homeCategories)
      ? homeCategories.filter(c => c.PlaceHolderIDForHome >= 1).slice(0, 6)
      : [];

    for (const cat of categoriesToFetch) {
      try {
        const postUrl = configData.POST_API_URL
          .replace("#CATEGORY_SLUG", cat.Slug)
          .replace("#OFFSET", "0");
        const postRes = await Axios.get(postUrl, axiosConfig);
        const posts = JSON.parse(postRes.data.payload || "[]");
        if (Array.isArray(posts) && posts.length > 0) {
          categorySections.push({
            categoryName: cat.DefaultTitleToDisplay || cat.CategoryName || cat.Slug,
            categorySlug: cat.Slug,
            categoryColor: posts[0]?.CategoryColor || "#007bff",
            posts: posts.slice(0, 8),
          });
        }
      } catch (e) {
        // Skip categories that fail
      }
    }

    return {
      homeSlider: Array.isArray(homeSlider) ? homeSlider : [],
      marqueeNews: Array.isArray(marqueeNews) ? marqueeNews : [],
      featurePosts: Array.isArray(featurePosts) ? featurePosts : [],
      categorySections,
      settingData,
      menus: Array.isArray(menus) ? menus : [],
      footerMenu: Array.isArray(footerMenu) ? footerMenu : [],
    };
  } catch (error) {
    console.error("Error fetching home data:", error);
    return {
      homeSlider: [],
      marqueeNews: [],
      featurePosts: [],
      categorySections: [],
      settingData: {},
      menus: [],
      footerMenu: [],
    };
  }
}

export async function getServerSideProps() {
  const homeData = await getHomeData();
  return {
    props: {
      ...homeData,
    },
  };
}

export default function AMPHomePage({ homeSlider, marqueeNews, featurePosts, categorySections, settingData, menus, footerMenu }) {
  const todayDate = new Date().toLocaleDateString("hi-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <Head>
        <title>Hindi News; Latest Hindi News, Breaking Hindi News Live - Lokmat Bharat</title>
        <meta name="description" content="Lokmat Bharat Hindi News Samachar - Find all Hindi News and Samachar, News in Hindi, Hindi News Headlines and Daily Breaking Hindi News Today" />
        <link rel="canonical" href={`${configData.CANONICAL_BASE}/`} />
        <link rel="icon" href="/assets/images/favicon.ico" />
        <script async custom-element="amp-carousel" src="https://cdn.ampproject.org/v0/amp-carousel-0.1.js"></script>
        <script async custom-element="amp-sidebar" src="https://cdn.ampproject.org/v0/amp-sidebar-0.1.js"></script>
        <script async custom-element="amp-social-share" src="https://cdn.ampproject.org/v0/amp-social-share-0.1.js"></script>
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

        /* Top Header Bar */
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
        .top-header-date { color: #ccc; }
        .top-header-social a {
          color: #ccc;
          margin-left: 12px;
          font-size: 14px;
        }
        .top-header-social a:hover { color: #fff; }

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
        .navbar-logo { display: inline-block; }
        .navbar-logo amp-img { display: block; }

        /* Menu */
        .nav-menu {
          display: flex;
          list-style: none;
          gap: 0;
          flex-wrap: wrap;
          align-items: center;
        }
        .nav-menu li a {
          color: #fff;
          padding: 8px 12px;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
        }
        .nav-menu li a:hover {
          background: rgba(255,255,255,0.15);
          border-radius: 4px;
        }

        /* Marquee */
        .marquee-bar {
          background: #fff;
          border-bottom: 2px solid #a10509;
          padding: 8px 0;
          overflow: hidden;
        }
        .marquee-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 15px;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .marquee-label {
          background: #a10509;
          color: #fff;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }
        .marquee-scroll {
          display: flex;
          gap: 30px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .marquee-scroll::-webkit-scrollbar { display: none; }
        .marquee-item {
          white-space: nowrap;
          color: #333;
          font-size: 13px;
          font-weight: 500;
        }

        /* Container */
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 15px;
        }

        /* Hero Area */
        .hero-section {
          margin: 20px 0;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
        }
        .hero-main {
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }
        .hero-main amp-carousel {
          border-radius: 12px;
        }
        .hero-slide {
          position: relative;
        }
        .hero-slide-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          padding: 20px;
          color: #fff;
        }
        .hero-slide-tag {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #fff;
        }
        .hero-slide-title {
          font-size: 20px;
          font-weight: 700;
          line-height: 1.3;
          color: #fff;
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
        .section-header h2 {
          font-size: 20px;
          font-weight: 700;
          color: #29293a;
          margin: 0;
        }
        .section-header a {
          color: #a10509;
          font-size: 13px;
          font-weight: 600;
        }

        /* Content Section */
        .content-section {
          background: #fff;
          padding: 20px;
          margin-bottom: 20px;
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }

        /* News Grid */
        .news-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }
        .news-card {
          background: #fff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
          transition: box-shadow 0.2s;
        }
        .news-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .news-card-img { position: relative; }
        .news-card-tag {
          position: absolute;
          top: 8px;
          left: 8px;
          padding: 3px 10px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 700;
          color: #fff;
          z-index: 1;
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
        .news-card-date {
          color: #999;
          font-size: 11px;
          margin-top: 6px;
        }

        /* Big + Small Layout */
        .category-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .big-card .news-card-title {
          font-size: 16px;
          -webkit-line-clamp: 3;
        }
        .small-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .small-cards .news-card-title {
          font-size: 13px;
          -webkit-line-clamp: 2;
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
        .footer-links a:hover { color: #fff; }
        .footer-social { display: flex; gap: 10px; margin-top: 10px; }
        .footer-social a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
          color: #fff;
          font-size: 14px;
        }
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
          .hero-grid { grid-template-columns: 1fr; }
          .news-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .category-layout { grid-template-columns: 1fr; }
          .small-cards { grid-template-columns: 1fr 1fr; }
          .footer-grid { grid-template-columns: 1fr 1fr; }
          .nav-menu { display: none; }
          .hero-slide-title { font-size: 16px; }
        }
        @media (max-width: 480px) {
          .news-grid { grid-template-columns: 1fr; }
          .small-cards { grid-template-columns: 1fr; }
          .footer-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Top Header */}
      <div className="top-header">
        <div className="top-header-inner">
          <span className="top-header-date">{todayDate}</span>
          <div className="top-header-social">
            {settingData?.FacebookLink && <a href={settingData.FacebookLink} target="_blank" rel="noopener noreferrer">Facebook</a>}
            {settingData?.TwitterLink && <a href={settingData.TwitterLink} target="_blank" rel="noopener noreferrer">Twitter</a>}
            {settingData?.YoutubeLink && <a href={settingData.YoutubeLink} target="_blank" rel="noopener noreferrer">YouTube</a>}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="main-navbar">
        <div className="navbar-inner">
          <a href="/" className="navbar-logo">
            {settingData?.LogoLiveUrl ? (
              <amp-img
                src={settingData.LogoLiveUrl}
                alt="Lokmat Bharat"
                width="130"
                height="50"
                layout="fixed"
              ></amp-img>
            ) : (
              <span style={{ color: "#fff", fontSize: "22px", fontWeight: "bold" }}>Lokmat Bharat</span>
            )}
          </a>
          <ul className="nav-menu">
            {menus.slice(0, 8).map((menu, i) => (
              <li key={i}>
                <a href={`/category/${menu.Slug}`}>{menu.MenuTitle}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Marquee News */}
      {marqueeNews.length > 0 && (
        <div className="marquee-bar">
          <div className="marquee-inner">
            <span className="marquee-label">ब्रेकिंग</span>
            <div className="marquee-scroll">
              {marqueeNews.map((news, i) => (
                <a key={i} href={`/details/${news.Slug}`} className="marquee-item">
                  {news.TitleData?.[0]?.Translation || "News"}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="container">
        {/* Hero Slider */}
        {homeSlider.length > 0 && (
          <div className="hero-section">
            <div className="hero-main">
              <amp-carousel
                width="800"
                height="450"
                layout="responsive"
                type="slides"
                autoplay=""
                delay="3000"
                loop=""
              >
                {homeSlider.map((slide, i) => (
                  <a key={i} href={`/details/${slide.Slug}`} className="hero-slide">
                    <amp-img
                      src={slide.PostFiles?.[0]?.AssetLiveUrl || "/assets/images/no-image.png"}
                      alt={slide.TitleData?.[0]?.Translation || "News"}
                      width="800"
                      height="450"
                      layout="responsive"
                    ></amp-img>
                    <div className="hero-slide-overlay">
                      <span className="hero-slide-tag" style={{ backgroundColor: slide.CategoryColor || "#a10509" }}>
                        {slide.CategoryName || "News"}
                      </span>
                      <h2 className="hero-slide-title">{slide.TitleData?.[0]?.Translation || ""}</h2>
                    </div>
                  </a>
                ))}
              </amp-carousel>
            </div>
          </div>
        )}

        {/* Category Sections */}
        {categorySections.map((section, idx) => (
          <div key={idx} className="content-section">
            <div className="section-header">
              <h2>{section.categoryName}</h2>
              <a href={`/category/${section.categorySlug}`}>सभी देखें →</a>
            </div>
            {section.posts.length > 0 && (
              <div className="category-layout">
                {/* Big Card */}
                <div className="big-card">
                  <a href={`/details/${section.posts[0].Slug}`}>
                    <div className="news-card">
                      <div className="news-card-img">
                        <span className="news-card-tag" style={{ backgroundColor: section.categoryColor }}>
                          {section.categoryName}
                        </span>
                        <amp-img
                          src={section.posts[0].PostFiles?.[0]?.AssetLiveUrl || "/assets/images/no-image.png"}
                          alt={section.posts[0].TitleData?.[0]?.Translation || "News"}
                          width="400"
                          height="250"
                          layout="responsive"
                        ></amp-img>
                      </div>
                      <div className="news-card-body">
                        <h3 className="news-card-title">{section.posts[0].TitleData?.[0]?.Translation || ""}</h3>
                        <div className="news-card-date">{section.posts[0].CreatedOnStr || ""}</div>
                      </div>
                    </div>
                  </a>
                </div>
                {/* Small Cards */}
                <div className="small-cards">
                  {section.posts.slice(1, 5).map((post, pi) => (
                    <a key={pi} href={`/details/${post.Slug}`}>
                      <div className="news-card">
                        <div className="news-card-img">
                          <amp-img
                            src={post.PostFiles?.[0]?.AssetLiveUrl || "/assets/images/no-image.png"}
                            alt={post.TitleData?.[0]?.Translation || "News"}
                            width="200"
                            height="130"
                            layout="responsive"
                          ></amp-img>
                        </div>
                        <div className="news-card-body">
                          <h3 className="news-card-title">{post.TitleData?.[0]?.Translation || ""}</h3>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Featured Posts Fallback */}
        {categorySections.length === 0 && featurePosts.length > 0 && (
          <div className="content-section">
            <div className="section-header">
              <h2>Featured News</h2>
            </div>
            <div className="news-grid">
              {featurePosts.slice(0, 8).map((news, i) => (
                <a key={i} href={`/details/${news.Slug}`}>
                  <div className="news-card">
                    <div className="news-card-img">
                      <amp-img
                        src={news.PostFiles?.[0]?.AssetLiveUrl || "/assets/images/no-image.png"}
                        alt={news.TitleData?.[0]?.Translation || "News"}
                        width="300"
                        height="200"
                        layout="responsive"
                      ></amp-img>
                    </div>
                    <div className="news-card-body">
                      <span className="news-card-tag" style={{ backgroundColor: "#a10509" }}>
                        {news.CategoryName || "News"}
                      </span>
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
              <amp-img
                src={settingData.FooterLogoLiveUrl}
                alt="Lokmat Bharat"
                width="150"
                height="50"
                layout="fixed"
              ></amp-img>
            )}
            <div className="footer-social" style={{ marginTop: "15px" }}>
              {settingData?.FacebookLink && <a href={settingData.FacebookLink} target="_blank">FB</a>}
              {settingData?.TwitterLink && <a href={settingData.TwitterLink} target="_blank">TW</a>}
              {settingData?.YoutubeLink && <a href={settingData.YoutubeLink} target="_blank">YT</a>}
              {settingData?.InstagramLink && <a href={settingData.InstagramLink} target="_blank">IG</a>}
            </div>
          </div>

          <div>
            <h4>USEFUL LINKS</h4>
            <ul className="footer-links">
              {footerMenu.map((menu, i) => (
                <li key={i}><a href={`/${menu.Slug}`}>{menu.MenuTitle}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Contact Us</h4>
            <div className="footer-contact">
              {settingData?.Address && <p>📍 {settingData.Address}</p>}
              {settingData?.Mobile1 && <p>📞 {settingData.Mobile1}{settingData?.Mobile2 ? ` | ${settingData.Mobile2}` : ''}</p>}
              {settingData?.MailID && <p>✉️ {settingData.MailID}</p>}
            </div>
          </div>

          <div>
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/">Home</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-copyright">
          {settingData?.Copyright || "© Lokmat Bharat. All Rights Reserved."}
        </div>
      </footer>

      {/* AMP Analytics */}
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
