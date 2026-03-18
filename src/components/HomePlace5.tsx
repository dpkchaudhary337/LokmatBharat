"use client";

import React, { Fragment, useEffect, useState, useMemo } from "react";
import configData from "@/components/Config";
import { cachedAxiosGet } from "@/utils/apiCache";
import parse from "html-react-parser";
import sanitizeHtml from "@/utils/sanitizeHtml";
import Newsletter from "@/components/Newsletter";
import Link from "next/link";
import Image from "next/image";

interface HomePlace5Props {
  adHeader: any;
  adRight3: any;
  homeCategory: any[];
}

export default function HomePlace5({
  adHeader,
  adRight3,
  homeCategory,
}: HomePlace5Props) {
  const adsData = adHeader;
  const adImage = adsData ? adsData.pAsset?.AssetLiveUrl : "";

  const homeCategory1 = useMemo(() => {
    return homeCategory?.find(
      (category) => category.PlaceHolderIDForHome == 5
    );
  }, [homeCategory]);

  const [post, setPost] = useState<any[]>([]);

  const axiosConfig = useMemo(
    () => ({
      headers: {
        sessionToken: configData.SESSION_TOKEN,
      },
    }),
    []
  );

  useEffect(() => {
    if (homeCategory1 && homeCategory1.Slug) {
      const postApiUrl = configData.POST_API_URL.replace(
        "#CATEGORY_SLUG",
        homeCategory1.Slug
      ).replace("#OFFSET", "0");

      cachedAxiosGet(postApiUrl, axiosConfig)
        .then((result: any) => {
          const data = result?._data ?? result;
          setPost(Array.isArray(data) ? data : []);
        })
        .catch((error) => {
          console.error("Error fetching posts:", error);
          setPost([]);
        });
    } else {
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
            {/* Left section (News) */}
            <div className="col-lg-8">
              <div className="main-content tab-view border-theme homeplace5_Section">
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
                      >
                        <div className="row">
                          {/* Left big post */}
                          <div className="col-md-6 mycol">
                            {post && post.length > 0 ? (
                              <Link
                                href={`${configData.BASE_URL_CATEGORY_DETAIL}${post[0]?.Slug || ""}`}
                                className="single-news landScape-normal HomePlace5_1"
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
                                      {homeCategory1?.DefaultTitleToDisplay || ""}
                                    </div>

                                    <Image
                                      src={
                                        post[0]?.PostFiles?.[0]?.AssetLiveUrl ||
                                        "/assets/images/no-image.png"
                                      }
                                      alt={
                                        post[0]?.TitleData?.[0]?.Translation ||
                                        "News Image"
                                      }
                                      width={500}
                                      height={300}
                                      className="lazy"
                                    />
                                  </div>

                                  <div className="inner-content">
                                    <h4 className="title">
                                      {post[0]?.TitleData?.[0]?.Translation || ""}
                                    </h4>
                                    <div className="text">
                                      {post[0]?.DescriptionData?.[0]?.Translation ? (
                                        parse(
                                          `${sanitizeHtml(
                                            post[0].DescriptionData[0].Translation.substring(
                                              0,
                                              230
                                            )
                                          )}...`
                                        )
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            ) : null}
                          </div>

                          {/* Right small posts */}
                          <div className="col-md-6 mycol">
                            <div className="row r-p">
                              {post && post.length > 1
                                ? post.slice(1, 5).map((p, i) => (
                                    <Link
                                      key={p?.Slug || p?.ID || `post-${i}`}
                                      href={`${configData.BASE_URL_CATEGORY_DETAIL}${p?.Slug || ""}`}
                                      className="single-box landScape-small-with-meta box_design_line_img HomePlace5_2"
                                    >
                                      <div className="img col-md-4 r-p">
                                        <Image
                                          src={
                                            p?.PostFiles?.[0]?.AssetLiveUrl ||
                                            "/assets/images/no-image.png"
                                          }
                                          alt={
                                            p?.TitleData?.[0]?.Translation ||
                                            "News Image"
                                          }
                                          width={200}
                                          height={130}
                                          className="lazy"
                                        />
                                      </div>
                                      <div className="content col-md-8">
                                        <h4 className="title">
                                          {p?.TitleData?.[0]?.Translation || ""}
                                        </h4>
                                      </div>
                                    </Link>
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

            {/* Right Section - Newsletter */}
            <div className="col-lg-4">
              <div className="noTopMargin homeplace5_Section">
                <Newsletter adRight3={adRight3} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  );
}
