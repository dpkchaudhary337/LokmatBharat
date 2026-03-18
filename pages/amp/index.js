import Axios from "axios";
import configData from "../../lib/amp-config";
import Head from "next/head";
import Link from "next/link";

// Next.js 15 built-in AMP support
export const config = { amp: true };

async function getHomeData() {
  const axiosConfig = {
    headers: {
      sessionToken: configData.SESSION_TOKEN,
    },
  };

  try {
    const [homeSliderRes, marqueeRes, featureRes, settingsRes] = await Promise.all([
      Axios.get(configData.HOME_SLIDER_API_URL, axiosConfig),
      Axios.get(configData.MARQUEE_API_URL, axiosConfig),
      Axios.get(configData.FEATURE_POST_API_URL.replace("#CATEGORY_SLUG", ""), axiosConfig),
      Axios.get(configData.SETTING_URL, axiosConfig),
    ]);

    const homeSlider = JSON.parse(homeSliderRes.data.payload || "[]");
    const marqueeNews = JSON.parse(marqueeRes.data.payload || "[]");
    const featurePosts = JSON.parse(featureRes.data.payload || "[]");
    const settings = JSON.parse(settingsRes.data.payload || "[]");
    const settingData = Array.isArray(settings) ? settings[0] : settings || {};

    return {
      homeSlider: Array.isArray(homeSlider) ? homeSlider : [],
      marqueeNews: Array.isArray(marqueeNews) ? marqueeNews : [],
      featurePosts: Array.isArray(featurePosts) ? featurePosts : [],
      categorySections: [],
      settingData,
    };
  } catch (error) {
    console.error("Error fetching home data:", error);
    return {
      homeSlider: [],
      marqueeNews: [],
      featurePosts: [],
      categorySections: [],
      settingData: {},
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

export default function AMPHomePage({ homeSlider, marqueeNews, featurePosts, categorySections, settingData }) {
  return (
    <>
      <Head>
        <title>Lokmat Bharat - AMP</title>
        <meta name="description" content="Lokmat Bharat Hindi News" />
        <link rel="canonical" href="https://lokmatbharat.com/" />
      </Head>

      <style jsx global>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 0;
          background: #f5f5f5;
        }
        .amp-navbar {
          background: #a10509;
          padding: 8px 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .amp-navbar-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 15px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .amp-navbar-logo {
          display: inline-block;
          text-decoration: none;
        }
        .amp-navbar-logo amp-img {
          display: block;
          margin: 0 auto;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 15px;
        }
        .content {
          background: #fff;
          padding: 25px;
          margin: 20px 0;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .header-area {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
        }
        .header-area h2 {
          font-size: 24px;
          font-weight: bold;
          margin: 0;
          color: #29293a;
        }
        .news-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 25px;
          margin: 20px 0;
        }
        .news-card {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .news-card-content {
          padding: 20px;
        }
        .news-card-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #333;
        }
        .category-tag {
          display: inline-block;
          padding: 6px 14px;
          background: #007bff;
          color: #fff;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 12px;
        }
        @media (max-width: 768px) {
          .news-list {
            grid-template-columns: 1fr;
          }
          .content {
            padding: 15px;
          }
        }
      `}</style>

      {/* AMP Navbar with Logo */}
      <nav className="amp-navbar">
        <div className="amp-navbar-inner">
          <Link href="/amp" className="amp-navbar-logo">
            {settingData?.LogoLiveUrl ? (
              <amp-img
                src={settingData.LogoLiveUrl}
                alt="Lokmat Bharat"
                width="120"
                height="45"
                layout="fixed"
              ></amp-img>
            ) : (
              <span style={{ color: "#fff", fontSize: "18px", fontWeight: "bold" }}>Lokmat Bharat</span>
            )}
          </Link>
        </div>
      </nav>

      <div className="container">
        {featurePosts.length > 0 && (
          <div className="content" style={{ marginTop: "20px" }}>
            <div className="header-area">
              <h2>Featured News</h2>
            </div>
            <div className="news-list">
              {featurePosts.map((news, index) => (
                <div key={index} className="news-card">
                  <Link href={`/amp/details/${news.Slug}`}>
                    <amp-img
                      src={news.PostFiles?.[0]?.AssetLiveUrl || "/assets/images/no-image.png"}
                      alt={news.TitleData?.[0]?.Translation || "News"}
                      width="300"
                      height="200"
                      layout="responsive"
                    ></amp-img>
                    <div className="news-card-content">
                      <span className="category-tag">{news.CategoryName || "News"}</span>
                      <h3 className="news-card-title">
                        {news.TitleData?.[0]?.Translation || "News"}
                      </h3>
                      <div style={{ color: "#666", fontSize: "12px" }}>{news.CreatedOnStr}</div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="content" style={{ textAlign: "center", marginTop: "20px" }}>
          <Link rel="canonical" href="/" style={{ color: "#007bff", textDecoration: "none" }}>
            View Regular Version →
          </Link>
        </div>
      </div>
    </>
  );
}

