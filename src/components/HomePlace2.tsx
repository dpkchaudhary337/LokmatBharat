"use client";
import React, { Fragment, useEffect, useState } from "react";
import configData from "./Config";
import { cachedAxiosGet } from "@/utils/apiCache";
import parse from "html-react-parser";
import HomePlace3 from "./HomePlace3";
import sanitizeHtml from "@/utils/sanitizeHtml";
import Link from "next/link";

export default function HomePlace2(props: any) {
  const { adHeader, homeCategory } = props;

  // ✅ Safe optional chaining to prevent undefined errors
  const adImage = adHeader?.pAsset?.AssetLiveUrl || "";

  // ✅ Filter category for placeholder 2
  const homeCategory1 = homeCategory?.find(
    (category: any) => category.PlaceHolderIDForHome === 2
  ) as any;

  const [post, setPost] = useState<any[]>([]);

  const axiosConfig = React.useMemo(
    () => ({
      headers: {
        sessionToken: configData.SESSION_TOKEN,
      },
    }),
    []
  );

  // ✅ Fetch posts when category slug available
  useEffect(() => {
    if (homeCategory1?.Slug) {
      const postApiUrl = configData.POST_API_URL.replace(
        "#CATEGORY_SLUG",
        homeCategory1.Slug
      ).replace("#OFFSET", "0");

      cachedAxiosGet(postApiUrl, axiosConfig)
        .then((result: any) => {
          const data = result?._data ?? result;
          setPost(Array.isArray(data) ? data : []);
        })
        .catch((err) => console.error("Post API error:", err));
    } else {
      // Reset post if category is not available
      setPost([]);
    }
  }, [homeCategory1?.Slug, axiosConfig]);

  // Early return if no category found
  if (!homeCategory1 || !homeCategory1.Slug) {
    return null;
  }

  return (
    <Fragment>
      <section className="home-front-area">
        <div className="container">
          <div className="row">
            {/* Left Section */}
            <div className="col-lg-6">
              <div className="main-content tab-view border-theme">
                <div className="row">
                  <div className="col-lg-12 mycol">
                    <div className="header-area">
                      <h3 className="title">
                        {homeCategory1?.DefaultTitleToDisplay || ""}
                      </h3>
                      {homeCategory1?.Slug && (
                        <Link
                          href={`${configData.BASE_URL_CATEGORY}${homeCategory1.Slug}`}
                        >
                          सभी देखें
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Content Section */}
                <div className="row">
                  <div className="col-lg-12">
                    <div className="tab-content" id="pills-tabContent">
                      <div
                        className="tab-pane fade show active"
                        id="pills-Rajasthan"
                        role="tabpanel"
                        aria-labelledby="pills-Rajasthan-tab"
                      >
                        <div className="row">
                          {/* Left Big Post */}
                          <div className="col-md-6 mycol">
                            <div className="single-news landScape-normal box_design_Line HomePlace2">
                              <Link
                                href={`${configData.BASE_URL_CATEGORY_DETAIL}${
                                  post?.[0]?.Slug || ""
                                }`}
                              >
                                <div className="content-wrapper">
                                  <div className="img">
                                    <div
                                      className="tag"
                                      style={{
                                        backgroundColor:
                                          post?.[0]?.CategoryColor ||
                                          "#9c27b0",
                                      }}
                                    >
                                      {homeCategory1?.DefaultTitleToDisplay}
                                    </div>

                                    <img
                                      src={
                                        post?.[0]?.PostFiles?.[0]?.AssetLiveUrl ||
                                        "/assets/images/no-image.png"
                                      }
                                      alt={
                                        post?.[0]?.TitleData?.[0]?.Translation ||
                                        ""
                                      }
                                      className="lazy"
                                    />
                                  </div>

                                  <div className="inner-content">
                                    <h4 className="title font-10">
                                      {post?.[0]?.TitleData?.[0]?.Translation ||
                                        ""}
                                    </h4>
                                    {post?.[0]?.DescriptionData?.[0]?.Translation && (
                                      <div className="text">
                                        {parse(
                                          sanitizeHtml(
                                            post[0].DescriptionData[0].Translation.substring(
                                              0,
                                              175
                                            )
                                          ) + "..."
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            </div>
                          </div>

                          {/* Right List of Posts */}
                          <div className="col-md-6 mycol">
                            <div className="row">
                              {post && post.length > 1
                                ? post
                                    .slice(1, 6)
                                    .map((p, i) => (
                                      <div
                                        className="col-md-12 r-p"
                                        key={p?.Slug || `post-${i}-${p?.ID || i}`}
                                      >
                                        <div className="single-box landScape-small-with-meta box_design_Line">
                                          <div className="content border_1">
                                            <Link
                                              href={`${configData.BASE_URL_CATEGORY_DETAIL}${p?.Slug || ""}`}
                                            >
                                              <h4 className="title_long angleRight">
                                                {p?.TitleData?.[0]?.Translation ||
                                                  ""}
                                              </h4>
                                            </Link>
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section (HomePlace3) */}
            <HomePlace3 homeCategory={homeCategory} />
          </div>
        </div>
      </section>
    </Fragment>
  );
}
