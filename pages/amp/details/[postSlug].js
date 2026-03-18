import Axios from "axios";
import configData from "../../../lib/amp-config";
import Head from "next/head";
import Link from "next/link";

// Next.js 15 built-in AMP support
export const config = { amp: true };

async function getPostDetails(postSlug) {
  const axiosConfig = {
    headers: {
      sessionToken: configData.SESSION_TOKEN,
    },
  };

  try {
    // First get post and settings
    const [postRes, settingsRes] = await Promise.all([
      Axios.get(
        `${configData.POST_DETAIL_API_URL}${postSlug}`,
        axiosConfig
      ),
      Axios.get(configData.SETTING_URL, axiosConfig),
    ]);
    
    const post = JSON.parse(postRes.data.payload);
    const settings = JSON.parse(settingsRes.data.payload || "[]");
    const settingData = Array.isArray(settings) ? settings[0] : settings || {};

    // Then get related news using post ID
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

    return { post, relatedNews, settingData };
  } catch (error) {
    console.error("Error fetching post details:", error);
    // Try to get settings even if post fails
    try {
      const settingsRes = await Axios.get(configData.SETTING_URL, axiosConfig);
      const settings = JSON.parse(settingsRes.data.payload || "[]");
      const settingData = Array.isArray(settings) ? settings[0] : settings || {};
      return { post: null, relatedNews: [], settingData };
    } catch {
      return { post: null, relatedNews: [], settingData: {} };
    }
  }
}

export async function getServerSideProps({ params }) {
  const { postSlug } = params;
  const { post, relatedNews, settingData } = await getPostDetails(postSlug);

  return {
    props: {
      post,
      relatedNews,
      postSlug,
      settingData,
    },
  };
}

export default function AMPDetailPage({ post, relatedNews, postSlug, settingData }) {
  if (!post) {
    return (
      <>
        <Head>
          <title>Post Not Found | Lokmat Bharat</title>
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
        `}</style>
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
          <div className="content">
            <h1>Post Not Found</h1>
            <Link href="/amp">← Back to Home</Link>
          </div>
        </div>
      </>
    );
  }

  const title = post.TitleData?.[0]?.Translation || "";
  const description = post.DescriptionData?.[0]?.Translation || "";
  const mainImage =
    post.PostFiles?.[0]?.AssetLiveUrl || "/assets/images/no-image.png";
  const shareUrl = `https://lokmatbharat.com/details/${postSlug}`;

  // Clean description for AMP - remove invalid attributes
  const cleanDescription = description
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/\sframeborder=["'][^"']*["']/gi, "")
    .replace(/\sframeborder(?:=["'][^"']*["'])?/gi, "")
    .replace(/\sscrolling=["'][^"']*["']/gi, "")
    .replace(/\sallowfullscreen(?:=["'][^"']*["'])?/gi, "")
    .replace(/<iframe\b[^>]*>/gi, "")
    .replace(/<\/iframe>/gi, "");

  return (
    <>
      <Head>
        <title>{title} | Lokmat Bharat</title>
        <meta name="description" content={description.substring(0, 160).replace(/<[^>]*>/g, "")} />
        <link rel="canonical" href={`https://lokmatbharat.com/details/${postSlug}`} />
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
        .post-title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 15px;
          color: #333;
        }
        .post-meta {
          color: #666;
          font-size: 14px;
          margin-bottom: 20px;
        }
        .category-tag {
          margin-left: 10px;
          padding: 4px 12px;
          background: #007bff;
          color: #fff;
          border-radius: 4px;
        }
        .post-image {
          margin: 20px 0;
        }
        .post-content {
          line-height: 1.8;
          color: #444;
          font-size: 16px;
        }
        .post-content p {
          margin-bottom: 15px;
        }
        .share-buttons {
          display: flex;
          gap: 10px;
          margin: 30px 0;
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
        <div className="content">
          <h1 className="post-title">{title}</h1>

          <div className="post-meta">
            <span>{post.CreatedOnStr}</span>
            {post.CategoryName && (
              <span className="category-tag">{post.CategoryName}</span>
            )}
          </div>

          <div className="share-buttons">
            <amp-social-share
              type="facebook"
              data-param-url={shareUrl}
              data-param-text={title}
              width="40"
              height="40"
            ></amp-social-share>
            <amp-social-share
              type="twitter"
              data-param-url={shareUrl}
              data-param-text={title}
              width="40"
              height="40"
            ></amp-social-share>
            <amp-social-share
              type="whatsapp"
              data-param-url={shareUrl}
              data-param-text={title}
              width="40"
              height="40"
            ></amp-social-share>
          </div>

          <div className="post-image">
            <amp-img
              src={mainImage}
              alt={title}
              width="1200"
              height="600"
              layout="responsive"
            ></amp-img>
          </div>

          {cleanDescription && (
            <div
              className="post-content"
              dangerouslySetInnerHTML={{ __html: cleanDescription }}
            />
          )}

          <div style={{ marginTop: "30px", padding: "15px", background: "#f5f5f5", borderRadius: "4px" }}>
            <Link rel="canonical" href={`/details/${postSlug}`} style={{ color: "#007bff", textDecoration: "none" }}>
              View Regular Version →
            </Link>
          </div>
        </div>

        {relatedNews.length > 0 && (
          <div className="content" style={{ marginTop: "20px" }}>
            <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>Related News</h2>
            <div className="news-list">
              {relatedNews.map((news, index) => (
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
      </div>
    </>
  );
}

