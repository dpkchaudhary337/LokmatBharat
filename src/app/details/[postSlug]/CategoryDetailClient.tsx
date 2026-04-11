"use client";

import React, { useEffect, useMemo, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import parse from "html-react-parser";
import axios from "axios";
import RelatedNews from "@/components/RelatedNews";
import Newsletter from "@/components/Newsletter";
import Script from "next/script";
import Head from "next/head";
import configData from "@/components/Config";
import styles from "./CategoryDetailClient.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import {
  WhatsappShareButton,
  FacebookShareButton,
  TwitterShareButton,
} from "react-share";

// Helper functions for embed URLs
const buildInstagramEmbedUrl = (url: string | null | undefined) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.toLowerCase().includes("instagram.com")) {
      return null;
    }
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length < 2) {
      return null;
    }
    const contentType = segments[0];
    const supportedTypes = ["p", "reel", "tv"];
    if (!supportedTypes.includes(contentType)) {
      return null;
    }
    const postId = segments[1];
    if (!postId) {
      return null;
    }
    return `https://www.instagram.com/${contentType}/${postId}/embed`;
  } catch {
    return null;
  }
};

const buildFacebookEmbedUrl = (url: string | null | undefined) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    if (
      !hostname.includes("facebook.com") &&
      !hostname.includes("fb.watch")
    ) {
      return null;
    }

    const cleanedUrl = parsed.toString();
    const encoded = encodeURIComponent(cleanedUrl);

    const pathname = parsed.pathname.toLowerCase();
    const isVideo =
      pathname.includes("/reel/") ||
      pathname.includes("/video") ||
      pathname.includes("/videos") ||
      hostname === "fb.watch";

    if (isVideo) {
      return `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=false&width=500`;
    }

    return `https://www.facebook.com/plugins/post.php?href=${encoded}&show_text=true&width=500`;
  } catch {
    return null;
  }
};

const buildTwitterEmbedUrl = (url: string | null | undefined) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    if (!hostname.includes("twitter.com") && !hostname.includes("x.com")) {
      return null;
    }

    const match = parsed.pathname.match(/\/(?:[^/]+)\/status\/(\d+)/i);
    const statusId = match?.[1];

    if (!statusId) {
      return null;
    }

    const canonicalUrl = `https://twitter.com/i/status/${statusId}`;
    const embedUrl = new URL("https://platform.twitter.com/embed/Tweet.html");
    embedUrl.searchParams.set("id", statusId);
    embedUrl.searchParams.set("lang", "hi");
    embedUrl.searchParams.set("embedId", "twitter-widget-0");
    embedUrl.searchParams.set("theme", "light");
    embedUrl.searchParams.set("widgetsVersion", "r20250110");
    embedUrl.searchParams.set("dnt", "true");
    embedUrl.searchParams.set("frame", canonicalUrl);
    return embedUrl.toString();
  } catch {
    return null;
  }
};

const extractHttpUrl = (raw: string) => {
  const trimmed = raw.trim().replace(/&amp;/gi, "&");
  const match = trimmed.match(/https?:\/\/[^\s<>"']+/i);
  return match ? match[0] : trimmed;
};

/** API may send ISYoutubeEmbed, IsYoutubeEmbed, or string "1". */
const isYoutubeEmbedFlagOn = (post: Record<string, unknown> | null | undefined) => {
  if (!post) return false;
  const keys = ["ISYoutubeEmbed", "IsYoutubeEmbed", "isyoutubeembed"] as const;
  for (const k of keys) {
    const v = post[k as keyof typeof post] as unknown;
    if (v === true || v === 1) return true;
    if (typeof v === "string") {
      const s = v.trim().toLowerCase();
      if (s === "1" || s === "true" || s === "yes") return true;
    }
  }
  return false;
};

const getEmbedSocial = (post: Record<string, unknown> | null | undefined) => {
  if (!post) return undefined;
  const v =
    post.EmbedSocial ?? post.embedSocial ?? post.embedsocial;
  if (v == null || v === "") return undefined;
  return String(v);
};

const buildYoutubeEmbedUrl = (url: string | null | undefined) => {
  if (!url) return null;
  try {
    const trimmed = extractHttpUrl(String(url));
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    const host = parsed.hostname.toLowerCase();
    if (!host.includes("youtube.com") && !host.includes("youtu.be")) {
      return null;
    }

    let videoId: string | null = null;

    if (host === "youtu.be" || host === "www.youtu.be") {
      videoId = parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (parsed.pathname.startsWith("/embed/")) {
      videoId = parsed.pathname.split("/").filter(Boolean)[1] ?? null;
    } else if (parsed.pathname.startsWith("/shorts/")) {
      videoId = parsed.pathname.split("/").filter(Boolean)[1] ?? null;
    } else if (parsed.pathname.startsWith("/live/")) {
      videoId = parsed.pathname.split("/").filter(Boolean)[1] ?? null;
    } else {
      videoId = parsed.searchParams.get("v");
    }

    if (!videoId) return null;
    videoId = videoId.split(/[?&]/)[0];
    if (!/^[a-zA-Z0-9_-]{6,}$/.test(videoId)) {
      return null;
    }

    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
};

export default function CategoryDetailClient({ params }: { params: Promise<{ postSlug: string }> }) {
  const { postSlug } = use(params);

  const [post, setPost] = useState<any>(null);
  const [isPostLoading, setIsPostLoading] = useState(true);
  const [postLoadError, setPostLoadError] = useState<string | null>(null);
  const [settingData, setSettingData] = useState<any>({ YoutubeVideoURL: "" });
  const [adRight, setAdRight] = useState<any>(null);
  const [adRight2, setAdRight2] = useState<any>(null);
  const [adFooter, setAdFooter] = useState<any>(null);
  const [adRight3, setAdRight3] = useState<any>(null);

  const postDetailApiUrl = `${configData.POST_DETAIL_API_URL}${postSlug}`;
  const axiosConfig = {
    headers: { sessionToken: configData.SESSION_TOKEN },
  };

  // Smooth scroll to top when page loads (if scrolled down)
  useEffect(() => {
    // Check if page is scrolled down
    if (typeof window !== "undefined" && window.scrollY > 0) {
      // Smooth scroll to top
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [postSlug]);

  useEffect(() => {
    let cancelled = false;
    setIsPostLoading(true);
    setPostLoadError(null);
    setPost(null);

    axios
      .get(postDetailApiUrl, axiosConfig)
      .then((response) => {
        if (cancelled) return;
        try {
          const data = JSON.parse(response.data.payload);
          setPost(data);
        } catch {
          setPostLoadError("Could not read this article.");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPostLoadError("Could not load this article. Please try again.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsPostLoading(false);
      });

    // Fetch settings
    axios.get(configData.SETTING_URL, axiosConfig).then((response) => {
      const data = JSON.parse(response.data.payload);
      setSettingData(data[0] || {});
    });

    // Fetch ads
    Promise.all([
      axios.get(configData.AD_API_URL + "home-right1", axiosConfig),
      axios.get(configData.AD_API_URL + "home-right2", axiosConfig),
      axios.get(configData.AD_API_URL + "home-footer1", axiosConfig),
      axios.get(configData.AD_API_URL + "home-right3", axiosConfig),
    ]).then(([adRightRes, adRight2Res, adFooterRes, adRight3Res]) => {
      setAdRight(JSON.parse(adRightRes.data.payload));
      setAdRight2(JSON.parse(adRight2Res.data.payload));
      setAdFooter(JSON.parse(adFooterRes.data.payload));
      setAdRight3(JSON.parse(adRight3Res.data.payload));
    });

    return () => {
      cancelled = true;
    };
  }, [postSlug]);

  const embedSocial = useMemo(() => getEmbedSocial(post), [post]);

  const instagramEmbedUrl = useMemo(
    () =>
      post?.ISInstagramEmbed
        ? buildInstagramEmbedUrl(embedSocial)
        : null,
    [embedSocial, post?.ISInstagramEmbed]
  );

  const facebookEmbedUrl = useMemo(
    () =>
      post?.ISFacebookEmbed
        ? buildFacebookEmbedUrl(embedSocial)
        : null,
    [embedSocial, post?.ISFacebookEmbed]
  );

  const twitterEmbedUrl = useMemo(
    () =>
      post?.ISTwitterEmbed ? buildTwitterEmbedUrl(embedSocial) : null,
    [embedSocial, post?.ISTwitterEmbed]
  );

  const youtubeEmbedUrl = useMemo(() => {
    if (!post || !isYoutubeEmbedFlagOn(post)) return null;
    return buildYoutubeEmbedUrl(embedSocial);
  }, [post, embedSocial]);

  if (isPostLoading) {
    return (
      <section className="hero-area news-details-page home-front-area">
        <div className="container">
          <div className={styles.loadingWrap} role="status" aria-live="polite">
            <div className={styles.spinner} aria-hidden />
            <p className={styles.loadingText}>Loading ...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="hero-area news-details-page home-front-area">
        <div className="container">
          <div className={styles.errorWrap}>
            <p className={styles.errorTitle}>Something went wrong</p>
            <p>{postLoadError || "This article could not be found."}</p>
          </div>
        </div>
      </section>
    );
  }

  const adImageRight = adRight?.pAsset?.AssetLiveUrl || "";
  const adRightLink = adRight?.AdLink || "";
  const adImageRight2 = adRight2?.pAsset?.AssetLiveUrl || "";
  const adRightLink2 = adRight2?.AdLink || "";
  const adImageFooter = adFooter?.pAsset?.AssetLiveUrl || "";
  const adFooterLink = adFooter?.AdLink || "";

  return (
    <>
      <Head>
        <link
          rel="amphtml"
          href={`https://lokmatbharat.com/amp/details/${postSlug}`}
        />
      </Head>
      <section className="hero-area news-details-page home-front-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="details-content-area">
                <div className="row">
                  <div className="col-lg-12 details-post">
                    <div className="single-news">
                      <h4 className="title">
                        {post && post.TitleData ? post.TitleData[0].Translation : ""}
                      </h4>

                      <div className="post-footer">
                        <div
                          className="a2a_kit a2a_kit_size_32 a2a_default_style"
                          style={{ lineHeight: "32px" }}
                        >
                          <span className="date-social">{post.CreatedOnStr}</span>
                          <ul className="social-share">
                            <FacebookShareButton url={`${configData.LIVE_DOMAIN}/details/${postSlug}`}>
                              <li>
                                <a
                                  className="a2a_button_facebook"
                                  href="javascript:void(0)"
                                  rel="nofollow noopener"
                                >
                                  <i className="fab fa-facebook-f"></i>
                                </a>
                              </li>
                            </FacebookShareButton>

                            <TwitterShareButton url={`${configData.LIVE_DOMAIN}/details/${postSlug}`}>
                              <li>
                                <a
                                  className="a2a_button_twitter"
                                  href="javascript:void(0)"
                                  rel="nofollow noopener"
                                >
                                  <i className="fab fa-twitter"></i>
                                </a>
                              </li>
                            </TwitterShareButton>

                            <WhatsappShareButton url={`${configData.LIVE_DOMAIN}/details/${postSlug}`}>
                              <li>
                                <a
                                  className="a2a_button_twitter-"
                                  href="javascript:void(0)"
                                  rel="nofollow noopener"
                                >
                                  <i className="fab fa-whatsapp" aria-hidden="true"></i>
                                </a>
                              </li>
                            </WhatsappShareButton>
                          </ul>
                          <div style={{ clear: "both" }}></div>
                        </div>
                        <Script
                          async
                          src="https://static.addtoany.com/menu/page.js"
                          strategy="afterInteractive"
                        />
                      </div>

                      <div className="img">
                        <div
                          className="tag"
                          style={
                            post && post.TitleData
                              ? { backgroundColor: post.CategoryColor }
                              : { backgroundColor: "#9c27b0" }
                          }
                        >
                          {post.CategoryName}
                        </div>
                        <Image
                          src={
                            post && post.PostFiles && post.PostFiles.length > 0
                              ? post.PostFiles[0].AssetLiveUrl
                              : "/assets/images/no-image.png"
                          }
                          alt={post && post.TitleData ? post.TitleData[0].Translation : ""}
                          width={900}
                          height={500}
                          style={{ width: "100%", height: "auto" }}
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {post && post.DescriptionData && post.DescriptionData[0] && post.DescriptionData[0].Translation && (
                        <div className="content">
                          {parse(post.DescriptionData[0].Translation)}
                        </div>
                      )}

                      {post && post.PostFiles && post.PostFiles.length > 1 && (
                        <div className="content">
                          <Swiper
                            modules={[Autoplay]}
                            autoplay={{ delay: 2500 }}
                            loop={true}
                            slidesPerView={1}
                            className="owl-theme"
                          >
                            {post.PostFiles.map((p: any, i: number) => (
                              <SwiperSlide key={i}>
                                <div className="item intro-carousel">
                                  <div className="content-wrapper">
                                    <Image
                                      src={
                                        post && post.PostFiles && post.PostFiles.length > 0
                                          ? post.PostFiles[i].AssetLiveUrl
                                          : "/assets/images/no-image.png"
                                      }
                                      alt=""
                                      width={900}
                                      height={500}
                                      style={{ width: "100%", height: "auto" }}
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                </div>
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        </div>
                      )}

                      {(facebookEmbedUrl ||
                        instagramEmbedUrl ||
                        twitterEmbedUrl ||
                        youtubeEmbedUrl) && (
                        <div className="content">
                          {facebookEmbedUrl && (
                            <div style={{ display: "flex", justifyContent: "center" }}>
                              <div style={{ width: "100%" }}>
                                <iframe
                                  src={facebookEmbedUrl}
                                  width="100%"
                                  height="480"
                                  style={{ border: "none", overflow: "hidden" }}
                                  scrolling="no"
                                  loading="lazy"
                                  allow="encrypted-media"
                                  allowFullScreen
                                />
                              </div>
                            </div>
                          )}
                          {instagramEmbedUrl && (
                            <div style={{ display: "flex", justifyContent: "center" }}>
                              <div style={{ width: "100%" }}>
                                <iframe
                                  src={instagramEmbedUrl}
                                  width="100%"
                                  height="720"
                                  style={{ border: "none", overflow: "hidden" }}
                                  scrolling="no"
                                  loading="lazy"
                                  allowFullScreen
                                />
                              </div>
                            </div>
                          )}
                          {twitterEmbedUrl && (
                            <div style={{ display: "flex", justifyContent: "center" }}>
                              <div style={{ width: "100%" }}>
                                <iframe
                                  src={twitterEmbedUrl}
                                  width="100%"
                                  height="520"
                                  style={{ border: "none", overflow: "hidden" }}
                                  scrolling="no"
                                  loading="lazy"
                                  allowFullScreen
                                />
                              </div>
                            </div>
                          )}
                          {youtubeEmbedUrl && (
                            <div style={{ display: "flex", justifyContent: "center" }}>
                              <div style={{ width: "100%" }}>
                                <iframe
                                  title="YouTube video"
                                  src={youtubeEmbedUrl}
                                  width="100%"
                                  height="480"
                                  style={{ border: "none", width: "100%" }}
                                  loading="lazy"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div
                        style={{
                          marginTop: "30px",
                          padding: "15px",
                          background: "#f5f5f5",
                          borderRadius: "4px",
                        }}
                      >
                        <Link rel="amphtml"
                          href={`/amp/details/${postSlug}`}
                          style={{ color: "#007bff", textDecoration: "none" }}
                        >
                          View AMP Version →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="row">
                <div className="col-lg-12">
                  <div className="side-video">
                    {settingData.YoutubeVideoURL && (
                      <iframe
                        frameBorder="0"
                        scrolling="no"
                        marginHeight={0}
                        marginWidth={0}
                        width="100%"
                        height="200"
                        src={settingData.YoutubeVideoURL}
                      ></iframe>
                    )}
                  </div>
                </div>
              </div>

              {/* <!-- News Tabs start --> */}
              <div className="row">
                <div className="col-lg-12">
                  <div className="ad-area">
                    {adImageRight && (
                      <Link href={adRightLink} target="_blank">
                        <Image
                          src={adImageRight}
                          alt="Advertisement"
                          width={400}
                          height={200}
                          style={{ width: "100%", height: "auto" }}
                          referrerPolicy="no-referrer"
                        />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* <!-- News Tabs start --> */}
              <Newsletter adRight3={adRight3} />

              <div className="row">
                <div className="col-lg-12">
                  <div className="ad-area">
                    {adImageRight2 && (
                      <Link href={adRightLink2} target="_blank">
                        <Image
                          src={adImageRight2}
                          alt="Advertisement"
                          width={400}
                          height={200}
                          style={{ width: "100%", height: "auto" }}
                          referrerPolicy="no-referrer"
                        />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* <!-- Hero Area End --> */}

      {/* <!--  देश विदेश Area Start --> */}
      {post && post.ID ? <RelatedNews postId={post.ID} /> : null}
      {/* <!--  देश विदेश Area End --> */}

      <section className="home-front-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              {/* <!-- News Tabs start --> */}
              <div className="main-content tab-view">
                <div className="row">
                  <div className="col-lg-12 mycol padding_15">
                    {adImageFooter && (
                      <Link href={adFooterLink} target="_blank">
                        <Image
                          src={adImageFooter}
                          alt="Advertisement"
                          width={1200}
                          height={200}
                          style={{ width: "100%", height: "auto" }}
                          referrerPolicy="no-referrer"
                        />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

