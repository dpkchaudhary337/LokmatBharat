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
    const [postRes, settingsRes, menuRes, footerMenuRes, marqueeRes] = await Promise.all([
      Axios.get(`${configData.POST_DETAIL_API_URL}${postSlug}`, axiosConfig),
      Axios.get(configData.SETTING_URL, axiosConfig),
      Axios.get(configData.MENU_API_URL, axiosConfig),
      Axios.get(configData.FOOTER_MENU_API_URL, axiosConfig),
      Axios.get(configData.MARQUEE_API_URL, axiosConfig),
    ]);

    const post = JSON.parse(postRes.data.payload);
    const settings = JSON.parse(settingsRes.data.payload || "[]");
    const menus = JSON.parse(menuRes.data.payload || "[]");
    const footerMenu = JSON.parse(footerMenuRes.data.payload || "[]");
    const marqueeNews = JSON.parse(marqueeRes.data.payload || "[]");
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
      marqueeNews: Array.isArray(marqueeNews) ? marqueeNews : [],
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
      return { post: null, relatedNews: [], settingData, menus: Array.isArray(menus) ? menus : [], footerMenu: Array.isArray(footerMenu) ? footerMenu : [], marqueeNews: [] };
    } catch {
      return { post: null, relatedNews: [], settingData: {}, menus: [], footerMenu: [], marqueeNews: [] };
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
    // Remove !important (not allowed in AMP)
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

export default function AMPDetailPage({ post, relatedNews, postSlug, settingData, menus, footerMenu, marqueeNews }) {
  if (!post) {
    return (
      <>
        <Head>
          <title>Post Not Found | Lokmat Bharat</title>
          <link rel="canonical" href={`${configData.CANONICAL_BASE}/details/${postSlug}`} />
        </Head>
        <style jsx global>{`
          body { font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; background: #fff; }
          .main-top-header { background: #a10509; border-bottom: 12px solid #be0201; padding: 0; }
          .header-inner { max-width: 1230px; margin: 0 auto; padding: 0 15px; display: flex; align-items: center; justify-content: space-between; }
          .container { max-width: 1230px; margin: 0 auto; padding: 0 15px; }
          .content-section { background: #fff; padding: 30px; margin: 20px 0; }
        `}</style>
        <section className="main-top-header">
          <div className="header-inner">
            <a href="/">
              {settingData?.LogoLiveUrl ? (
                <amp-img src={settingData.LogoLiveUrl} alt="Lokmat Bharat" width="130" height="42" layout="fixed"></amp-img>
              ) : (
                <span style={{ color: "#fff", fontSize: "22px", fontWeight: "bold" }}>Lokmat Bharat</span>
              )}
            </a>
          </div>
        </section>
        <div className="container">
          <div className="content-section">
            <h1>Post Not Found</h1>
            <p style={{ marginTop: "15px" }}><a href="/" style={{ color: "#a10509" }}>← Back to Home</a></p>
          </div>
        </div>
      </>
    );
  }

  const title = post.TitleData?.[0]?.Translation || "";
  const rawDescription = post.DescriptionData?.[0]?.Translation || "";
  const cleanDescription = sanitizeForAMP(rawDescription);
  const mainImage = post.PostFiles?.[0]?.AssetLiveUrl || "/assets/images/no-image.png";
  const canonicalUrl = `${configData.CANONICAL_BASE}/details/${postSlug}`;
  const metaDescription = rawDescription.replace(/<[^>]*>/g, "").substring(0, 160);
  const dateStr = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <Head>
        <title>{title} | Lokmat Bharat</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="icon" href="/assets/images/favicon.ico" />
        <script async custom-element="amp-social-share" src="https://cdn.ampproject.org/v0/amp-social-share-0.1.js"></script>
        <script async custom-element="amp-analytics" src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js"></script>
        <script async custom-element="amp-iframe" src="https://cdn.ampproject.org/v0/amp-iframe-0.1.js"></script>
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
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          margin: 0;
          padding: 0;
          background: #fff;
          color: #333;
        }
        a { text-decoration: none; color: inherit; }

        /* ===== Top Header (Red bar with logo) ===== */
        .main-top-header {
          background: #a10509;
          border-bottom: 12px solid #be0201;
          padding: 0;
        }
        .header-inner {
          max-width: 1230px;
          margin: 0 auto;
          padding: 0 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .header-logo { padding: 10px 0; }
        .header-right {
          display: flex;
          align-items: center;
          gap: 15px;
          color: #fff;
          font-size: 14px;
        }
        .header-date { font-size: 16px; }
        .header-social {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .header-social a { color: #fff; font-size: 14px; }

        /* ===== Marquee / Breaking News ===== */
        .marquee-bar {
          padding-top: 12px;
          background: #fff;
        }
        .marquee-inner {
          max-width: 1230px;
          margin: 0 auto;
          padding: 0 15px;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        .marquee-heading {
          background: #a10509;
          color: #fff;
          font-size: 14px;
          padding: 6px 15px;
          text-transform: uppercase;
          font-weight: 600;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .marquee-arrow {
          width: 0;
          height: 0;
          border-top: 16px solid transparent;
          border-bottom: 16px solid transparent;
          border-left: 16px solid #a10509;
          flex-shrink: 0;
        }
        .marquee-track {
          flex: 1;
          overflow: hidden;
          white-space: nowrap;
          position: relative;
          font-size: 14px;
          padding-left: 10px;
        }
        .marquee-content {
          display: inline-block;
          white-space: nowrap;
          animation: marquee-scroll 60s linear infinite;
        }
        .marquee-content a {
          margin: 0 15px;
          font-weight: 600;
          color: #000;
        }
        .marquee-separator { color: #a10509; margin: 0 5px; }
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* ===== Main Menu (Dark navbar) ===== */
        .mainmenu-area {
          background: #333;
          box-shadow: 0px 3px 8px rgba(0,0,0,0.1), 0px -3px 8px rgba(0,0,0,0.1);
        }
        .mainmenu-inner {
          max-width: 1230px;
          margin: 0 auto;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-menu {
          display: flex;
          list-style: none;
          gap: 0;
          flex-wrap: wrap;
          padding: 0;
          margin: 0;
        }
        .nav-menu li a {
          color: #fff;
          padding: 8px 15px;
          font-size: 14px;
          font-weight: 400;
          line-height: 24px;
          text-transform: uppercase;
          display: block;
        }
        .nav-search { color: #fff; padding: 8px 15px; font-size: 14px; }

        /* ===== Container ===== */
        .container { max-width: 1230px; margin: 0 auto; padding: 0 15px; }

        /* ===== Hero / Article Area ===== */
        .hero-area { padding: 12px 0 0; }
        .row { display: flex; flex-wrap: wrap; margin: 0 -15px; }
        .col-lg-8 { flex: 0 0 66.666%; max-width: 66.666%; padding: 0 15px; }
        .col-lg-4 { flex: 0 0 33.333%; max-width: 33.333%; padding: 0 15px; }
        .col-lg-12 { flex: 0 0 100%; max-width: 100%; padding: 0 15px; }
        .col-md-3 { flex: 0 0 25%; max-width: 25%; padding: 0 15px; }

        /* ===== Details Content ===== */
        .details-content-area { padding: 0 15px; }
        .single-news { background: #fff; }
        .article-title {
          font-size: 20px;
          line-height: 30px;
          font-weight: 600;
          color: #222;
          margin-bottom: 0;
        }
        .post-footer {
          border-top: 1px solid rgba(0,0,0,0.1);
          padding-top: 12px;
          padding-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .date-social { font-size: 16px; color: #333; }
        .social-share {
          display: flex;
          gap: 4px;
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .article-image {
          position: relative;
          margin: 0;
          border-radius: 5px;
          overflow: hidden;
        }
        .article-image .tag {
          position: absolute;
          top: 20px;
          left: 20px;
          color: #fff;
          padding: 1px 12px;
          font-weight: 600;
          font-size: 14px;
          z-index: 2;
        }
        .article-body {
          padding: 16px 0 10px;
          text-align: justify;
          line-height: 1.8;
          color: #333;
          font-size: 15px;
        }
        .article-body p { margin-bottom: 12px; text-align: justify; }
        .article-body h2, .article-body h3 {
          font-size: 18px;
          line-height: 28px;
          font-weight: 600;
          margin: 16px 0 8px;
          color: #222;
        }
        .article-body amp-img { width: 100%; margin: 5px 0 15px; }

        /* ===== Sidebar ===== */
        .sidebar { margin-top: 0; }
        .side-video { margin-bottom: 15px; }
        .ad-area { margin-bottom: 15px; }
        .subscribe-widget {
          border: 1px solid rgba(0,0,0,0.1);
          padding: 20px;
          margin-bottom: 10px;
        }
        .subscribe-widget h5 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 5px;
        }
        .subscribe-widget p {
          font-size: 14px;
          color: #666;
          margin-bottom: 12px;
        }
        .subscribe-link {
          display: inline-block;
          background: #333;
          color: #e1e1e1;
          padding: 8px 14px;
          font-size: 14px;
          border-radius: 4px;
        }

        /* ===== Related News ===== */
        .related-section {
          padding: 0 15px;
          margin-top: 20px;
        }
        .main-content {
          padding: 0 15px;
          box-shadow: 1px 2px 10px #c5c5c5;
          background: #fff;
        }
        .border-theme { border-top: 2px #ea2328 solid; }
        .header-area {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 7px 0;
        }
        .header-area .title {
          font-size: 16px;
          font-weight: 600;
          color: #a10509;
          margin: 0;
        }
        .news-card {
          border: 1px solid rgba(0,0,0,0.1);
          background: #fff;
          overflow: hidden;
        }
        .news-card .tag {
          position: absolute;
          top: 15px;
          left: 15px;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          padding: 1px 10px;
          z-index: 2;
        }
        .news-card-img { position: relative; }
        .news-card-body { padding: 10px 10px 0 10px; background: #fff; }
        .news-card-title {
          font-size: 15px;
          font-weight: 600;
          line-height: 1.4;
          color: #222;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0 0 8px;
        }

        /* ===== Footer ===== */
        .footer {
          overflow: hidden;
          position: relative;
          padding: 30px 0 0;
          margin-top: 20px;
        }
        .footer-row {
          display: flex;
          flex-wrap: wrap;
          margin: 0 -15px;
          max-width: 1230px;
          margin-left: auto;
          margin-right: auto;
          padding: 0 15px;
        }
        .footer-col-3 { flex: 0 0 25%; max-width: 25%; padding: 0 15px; }
        .footer-col-2 { flex: 0 0 16.666%; max-width: 16.666%; padding: 0 15px; }
        .footer-col-4 { flex: 0 0 33.333%; max-width: 33.333%; padding: 0 15px; }
        .footer-logo-img { margin-bottom: 25px; }
        .footer-social {
          display: flex;
          list-style: none;
          padding: 0;
          gap: 6px;
          flex-wrap: wrap;
        }
        .footer-widget-title {
          font-size: 16px;
          font-weight: 600;
          text-transform: uppercase;
          color: #a10509;
          margin-bottom: 15px;
        }
        .footer-link-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .footer-link-list li { list-style: none; }
        .footer-link-list li a {
          line-height: 30px;
          font-size: 14px;
          color: #7a7a7a;
        }
        .footer-contact-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .footer-contact-list li {
          color: #7a7a7a;
          font-size: 14px;
          margin-bottom: 5px;
          display: flex;
          align-items: flex-start;
          gap: 5px;
        }
        .footer-contact-list li a { color: #7a7a7a; }
        .footer-contact-list .text-theme { color: #a10509; }
        .footer-newsletter-desc {
          font-size: 14px;
          color: #7a7a7a;
          margin-bottom: 10px;
        }
        .footer-newsletter-link {
          display: inline-block;
          color: #a10509;
          font-size: 14px;
          margin-bottom: 10px;
        }
        .footer-admin-link {
          font-size: 14px;
          color: #7a7a7a;
        }
        .copy-bg {
          margin-top: 30px;
          padding: 10px 15px;
          border-top: 1px #b6b6b6 solid;
          text-align: center;
        }
        .copy-bg p {
          margin: 0;
          font-size: 14px;
          line-height: 24px;
          color: #101d29;
        }

        /* ===== View Regular Link ===== */
        .view-regular {
          margin-top: 30px;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 4px;
        }
        .view-regular a { color: #007bff; font-weight: 500; }

        /* ===== Responsive ===== */
        @media (max-width: 991px) {
          .col-lg-8, .col-lg-4 { flex: 0 0 100%; max-width: 100%; }
          .sidebar { margin-top: 30px; }
          .nav-menu { display: none; }
          .header-social { display: none; }
          .header-date { font-size: 12px; }
          .main-top-header { border-bottom-width: 6px; }
        }
        @media (max-width: 767px) {
          .article-title { font-size: 18px; line-height: 28px; }
          .col-md-3 { flex: 0 0 100%; max-width: 100%; margin-bottom: 15px; }
          .footer-col-3, .footer-col-2, .footer-col-4 { flex: 0 0 50%; max-width: 50%; margin-bottom: 15px; }
          .marquee-bar { display: none; }
        }
        @media (max-width: 575px) {
          .footer-col-3, .footer-col-2, .footer-col-4 { flex: 0 0 100%; max-width: 100%; }
          .hero-area { padding: 0; }
          .date-social { font-size: 14px; }
        }
      `}</style>

      {/* ===== Top Header (Red bar) ===== */}
      <section className="main-top-header">
        <div className="header-inner">
          <div className="header-logo">
            <a href="/">
              {settingData?.LogoLiveUrl ? (
                <amp-img src={settingData.LogoLiveUrl} alt="Lokmat Bharat" width="130" height="42" layout="fixed"></amp-img>
              ) : (
                <span style={{ color: "#fff", fontSize: "22px", fontWeight: "bold" }}>Lokmat Bharat</span>
              )}
            </a>
          </div>
          <div className="header-right">
            <span className="header-date">{dateStr}</span>
            <div className="header-social">
              {settingData?.FacebookLink && <a href={settingData.FacebookLink}>Facebook</a>}
              {settingData?.TwitterLink && <a href={settingData.TwitterLink}>Twitter</a>}
              {settingData?.InstagramLink && <a href={settingData.InstagramLink}>Instagram</a>}
              {settingData?.YoutubeLink && <a href={settingData.YoutubeLink}>YouTube</a>}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Main Menu (Dark navbar) ===== */}
      <nav className="mainmenu-area">
        <div className="mainmenu-inner">
          <ul className="nav-menu">
            {menus.slice(0, 10).map((menu, i) => (
              <li key={i}><a href={`/category/${menu.Slug}`}>{menu.MenuTitle}</a></li>
            ))}
          </ul>
          <span className="nav-search">&#128269;</span>
        </div>
      </nav>

      {/* ===== Marquee / Breaking News ===== */}
      {marqueeNews && marqueeNews.length > 0 && (
        <div className="marquee-bar">
          <div className="marquee-inner">
            <span className="marquee-heading">अभी का दौर</span>
            <span className="marquee-arrow"></span>
            <div className="marquee-track">
              <div className="marquee-content">
                {marqueeNews.map((news, i) => (
                  <span key={`first-${i}`}>
                    <a href={`/details/${news.Slug}`}>{news.TitleData?.[0]?.Translation || ""}</a>
                    <span className="marquee-separator">»</span>
                  </span>
                ))}
                {marqueeNews.map((news, i) => (
                  <span key={`second-${i}`}>
                    <a href={`/details/${news.Slug}`}>{news.TitleData?.[0]?.Translation || ""}</a>
                    <span className="marquee-separator">»</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Article Content ===== */}
      <section className="hero-area">
        <div className="container">
          <div className="row">
            {/* Main Content */}
            <div className="col-lg-8">
              <div className="details-content-area">
                <div className="single-news">
                  <h1 className="article-title">{title}</h1>

                  <div className="post-footer">
                    <span className="date-social">{post.CreatedOnStr || ""}</span>
                    <ul className="social-share">
                      <li><amp-social-share type="facebook" data-param-url={canonicalUrl} data-param-text={title} width="32" height="32"></amp-social-share></li>
                      <li><amp-social-share type="twitter" data-param-url={canonicalUrl} data-param-text={title} width="32" height="32"></amp-social-share></li>
                      <li><amp-social-share type="whatsapp" data-param-url={canonicalUrl} data-param-text={title} width="32" height="32"></amp-social-share></li>
                    </ul>
                  </div>

                  <div className="article-image">
                    <div className="tag" style={{ backgroundColor: post.CategoryColor || "#a10509" }}>
                      {post.CategoryName || ""}
                    </div>
                    <amp-img
                      src={mainImage}
                      alt={title}
                      width="900"
                      height="500"
                      layout="responsive"
                    ></amp-img>
                  </div>

                  {cleanDescription && (
                    <div className="article-body" dangerouslySetInnerHTML={{ __html: cleanDescription }} />
                  )}

                  <div className="view-regular">
                    <a href={`/details/${postSlug}`}>
                      View Regular Version →
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-lg-4">
              <div className="sidebar">
                {settingData?.YoutubeVideoURL && (
                  <div className="side-video">
                    <amp-iframe
                      src={settingData.YoutubeVideoURL}
                      width="400"
                      height="200"
                      layout="responsive"
                      sandbox="allow-scripts allow-same-origin allow-popups"
                    >
                      <amp-img placeholder src="/assets/images/no-image.png" width="400" height="200" layout="responsive"></amp-img>
                    </amp-iframe>
                  </div>
                )}

                <div className="subscribe-widget">
                  <h5>Subscribe Newsletter!</h5>
                  <p>Stay updated with our latest news and articles directly in your inbox.</p>
                  <a href={`/details/${postSlug}`} className="subscribe-link">Subscribe on Regular Version →</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Related News ===== */}
      {relatedNews.length > 0 && (
        <section className="hero-area" style={{ paddingTop: "0" }}>
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="main-content border-theme">
                  <div className="header-area">
                    <h3 className="title">Related News</h3>
                  </div>
                  <div className="row" style={{ paddingBottom: "15px" }}>
                    {relatedNews.map((news, i) => (
                      <div className="col-md-3" key={i}>
                        <a href={`/details/${news.Slug}`}>
                          <div className="news-card">
                            <div className="news-card-img">
                              <div className="tag" style={{ backgroundColor: news.CategoryColor || "#9c27b0" }}>
                                {news.CategoryName || ""}
                              </div>
                              <amp-img
                                src={news.PostFiles?.[0]?.AssetLiveUrl || "/assets/images/no-image.png"}
                                alt={news.TitleData?.[0]?.Translation || "News"}
                                width="300"
                                height="130"
                                layout="responsive"
                              ></amp-img>
                            </div>
                            <div className="news-card-body">
                              <h3 className="news-card-title">{news.TitleData?.[0]?.Translation || "News"}</h3>
                            </div>
                          </div>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== Footer ===== */}
      <footer className="footer">
        <div className="footer-row">
          {/* Logo + Social */}
          <div className="footer-col-3">
            <div className="footer-logo-img">
              {settingData?.FooterLogoLiveUrl ? (
                <a href="/">
                  <amp-img src={settingData.FooterLogoLiveUrl} alt="Lokmat Bharat" width="150" height="85" layout="fixed"></amp-img>
                </a>
              ) : null}
            </div>
            <ul className="footer-social">
              {settingData?.FacebookLink && (
                <li><a href={settingData.FacebookLink} target="_blank"><amp-img src="/assets/images/social/facebook.png" alt="Facebook" width="40" height="40" layout="fixed"></amp-img></a></li>
              )}
              {settingData?.TwitterLink && (
                <li><a href={settingData.TwitterLink} target="_blank"><amp-img src="/assets/images/social/twitter.png" alt="Twitter" width="40" height="40" layout="fixed"></amp-img></a></li>
              )}
              {settingData?.YoutubeLink && (
                <li><a href={settingData.YoutubeLink} target="_blank"><amp-img src="/assets/images/social/youtube.png" alt="YouTube" width="40" height="40" layout="fixed"></amp-img></a></li>
              )}
              {settingData?.InstagramLink && (
                <li><a href={settingData.InstagramLink} target="_blank"><amp-img src="/assets/images/social/instagram.png" alt="Instagram" width="40" height="40" layout="fixed"></amp-img></a></li>
              )}
            </ul>
          </div>

          {/* Useful Links */}
          <div className="footer-col-2">
            <h4 className="footer-widget-title">USEFUL LINKS</h4>
            <ul className="footer-link-list">
              {footerMenu.map((menu, i) => (
                <li key={i}><a href={`/${menu.Slug}`}>{menu.MenuTitle}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div className="footer-col-4">
            <h4 className="footer-widget-title">CONTACT US</h4>
            <ul className="footer-contact-list">
              {settingData?.Address && (
                <li><span>📍</span> <span>{settingData.Address}</span></li>
              )}
              {settingData?.Mobile1 && (
                <li style={{ marginTop: "15px" }}>
                  <span>📞</span>
                  <span>
                    <a href={`tel:${settingData.Mobile1}`}>{settingData.Mobile1}</a>
                    {settingData?.Mobile2 && (<> | <a href={`tel:${settingData.Mobile2}`}>{settingData.Mobile2}</a></>)}
                  </span>
                </li>
              )}
              {settingData?.MailID && (
                <li style={{ marginTop: "15px" }}>
                  <span>✉️</span>
                  <a className="text-theme" href={`mailto:${settingData.MailID}`}>{settingData.MailID}</a>
                </li>
              )}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-col-3">
            <h4 className="footer-widget-title">NEWSLETTER</h4>
            <p className="footer-newsletter-desc">✉️ Subscribe for our daily news</p>
            <a href="/" style={{ color: "#a10509", fontSize: "14px" }}>Subscribe on our website →</a>
            <div className="footer-admin-link">
              <a href={configData.baseAdminUrl || "#"} target="_blank">Admin</a>
              {" | "}
              <a href={configData.baseAdminUrl || "#"} target="_blank">Reporter Login</a>
            </div>
          </div>
        </div>

        <div className="copy-bg">
          <p>{settingData?.Copyright || "Copyright © 2023 Lokmat Bharat. All Rights Reserved."}</p>
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
