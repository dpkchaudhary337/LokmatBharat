"use client";

import React, { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { cachedAxiosGet } from "@/utils/apiCache";
import parse from "html-react-parser";
import sanitizeHtml from "@/utils/sanitizeHtml";
import configData from "./Config";

interface HomePlace6Props {
    adHeader?: any;
    homeCategory?: any[];
}

export default function HomePlace6({ adHeader, homeCategory }: HomePlace6Props) {
  const [post, setPost] = useState<any[]>([]);

  const adsData = adHeader;
  const adImage = adsData?.pAsset?.AssetLiveUrl || "";

  const axiosConfig = {
    headers: {
      sessionToken: configData.SESSION_TOKEN,
    },
  };

  const homeCategory1 = homeCategory?.find(
    (category) => category.PlaceHolderIDForHome === 6
  );

  useEffect(() => {
    if (homeCategory1?.Slug) {
      const postApiUrl = configData.POST_API_URL.replace(
        "#CATEGORY_SLUG",
        homeCategory1.Slug
      ).replace("#OFFSET", "0");

      cachedAxiosGet(postApiUrl, axiosConfig).then((result: any) => {
        const data = result?._data ?? result;
        setPost(Array.isArray(data) ? data : []);
      }).catch((err) => {
        console.error("Error fetching posts:", err);
      });
    }
  }, [homeCategory1?.Slug]);

  return (
    <Fragment>
      <section className="home-front-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="main-content tab-view border-theme">
                <div className="row">
                  <div className="col-lg-12 mycol">
                    <div className="header-area">
                      <h3 className="title">
                        {homeCategory1?.DefaultTitleToDisplay || ""}
                      </h3>
                      <Link
                        href={`${configData.BASE_URL_CATEGORY}${homeCategory1?.Slug || ""}`}
                      >
                        सभी देखें
                      </Link>
                    </div>
                  </div>
                </div>

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
                          {/* Left side big post */}
                          <div className="col-md-8 mycol">
                            <div className="single-news landScape-normal box_design_block HomePlace6_1">
                              {post?.[0] && (
                                <Link
                                  href={`${configData.BASE_URL_CATEGORY_DETAIL}${post[0].Slug}`}
                                >
                                  <div className="content-wrapper">
                                    <div className="img">
                                      <div
                                        className="tag"
                                        style={{
                                          backgroundColor:
                                            post[0]?.CategoryColor || "#9c27b0",
                                        }}
                                      >
                                        {homeCategory1?.DefaultTitleToDisplay}
                                      </div>
                                      <img
                                        src={post[0]?.PostFiles?.[0]?.AssetLiveUrl || ""}
                                        alt={post[0]?.TitleData?.[0]?.Translation || ""}
                                        className="lazy"
                                      />
                                    </div>
                                    <div className="inner-content">
                                      <h4 className="title">
                                        {post[0]?.TitleData?.[0]?.Translation || ""}
                                      </h4>
                                      <div className="text">
                                        {post[0]?.DescriptionData?.[0]?.Translation
                                          ? parse(
                                              sanitizeHtml(
                                                post[0].DescriptionData[0].Translation.substring(
                                                  0,
                                                  180
                                                )
                                              )
                                            )
                                          : ""}
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              )}
                            </div>
                          </div>

                          {/* Right side small posts */}
                          <div className="col-md-4 mycol">
                            <div className="row r-p">
                              {post?.length > 1 &&
                                post.map((p, i) => {
                                  if (i > 0 && i < 6) {
                                    return (
                                      <Link
                                        key={p.Slug}
                                        href={`${configData.BASE_URL_CATEGORY_DETAIL}${p.Slug}`}
                                      >
                                        <div className="single-box landScape-small-with-meta box_design_line_img height85 HomePlace6_2">
                                          <div className="img height85 col-md-4 r-p">
                                            <img
                                              src={p?.PostFiles?.[0]?.AssetLiveUrl || ""}
                                              alt={p?.TitleData?.[0]?.Translation || ""}
                                              className="lazy"
                                            />
                                          </div>
                                          <div className="content col-md-8">
                                            <h4 className="title">
                                              {p?.TitleData?.[0]?.Translation || ""}
                                            </h4>
                                          </div>
                                        </div>
                                      </Link>
                                    );
                                  }
                                })}
                            </div>
                          </div>
                        </div>

                        {/* Optional Ad Section */}
                        {adImage && (
                          <div className="text-center mt-4">
                            <img src={adImage} alt="ad-banner" className="img-fluid" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  );
}
