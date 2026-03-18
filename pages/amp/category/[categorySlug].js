import Axios from "axios";
import configData from "../../../lib/amp-config";
import Head from "next/head";
import Link from "next/link";

// Next.js 15 built-in AMP support
export const config = { amp: true };

async function getCategoryPosts(categorySlug) {
  const axiosConfig = {
    headers: {
      sessionToken: configData.SESSION_TOKEN,
    },
  };

  try {
    const [response, settingsRes] = await Promise.all([
      Axios.get(
        configData.POST_API_URL.replace("#CATEGORY_SLUG", categorySlug).replace("#OFFSET", "0"),
        axiosConfig
      ),
      Axios.get(configData.SETTING_URL, axiosConfig),
    ]);
    const data = JSON.parse(response.data.payload || "[]");
    const settings = JSON.parse(settingsRes.data.payload || "[]");
    const settingData = Array.isArray(settings) ? settings[0] : settings || {};
    return { posts: Array.isArray(data) ? data : [], settingData };
  } catch (error) {
    console.error("Error fetching category posts:", error);
    return { posts: [], settingData: {} };
  }
}

export async function getServerSideProps({ params }) {
  const { categorySlug } = params;
  const { posts, settingData } = await getCategoryPosts(categorySlug);

  return {
    props: {
      posts,
      categorySlug,
      settingData,
    },
  };
}

export default function AMPCategoryPage({ posts, categorySlug, settingData }) {
  const categoryName = posts[0]?.CategoryName || categorySlug.replace(/-/g, " ");

  return (
    <>
      <Head>
        <title>{categoryName} | Lokmat Bharat - AMP</title>
        <meta name="description" content={`Latest ${categoryName} news on Lokmat Bharat`} />
        <link rel="canonical" href={`https://lokmatbharat.com/category/${categorySlug}`} />
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
        <div className="content" style={{ marginTop: "20px" }}>
          <div className="header-area">
            <h2>{categoryName}</h2>
          </div>
          <div className="news-list">
            {posts.map((news, index) => (
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

        <div className="content" style={{ textAlign: "center", marginTop: "20px" }}>
          <Link rel="canonical" href={`/category/${categorySlug}`} style={{ color: "#007bff", textDecoration: "none" }}>
            View Regular Version →
          </Link>
        </div>
      </div>
    </>
  );
}

