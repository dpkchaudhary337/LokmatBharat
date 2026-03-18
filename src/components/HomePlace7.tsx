"use client";

import React, { Fragment, useEffect, useState } from "react";
import { cachedAxiosGet } from "@/utils/apiCache";
import parse from "html-react-parser";
import sanitizeHtml from "@/utils/sanitizeHtml";
import Link from "next/link";
import Image from "next/image";
import configData from "./Config";

interface HomePlace7Props {
    adHeader?: any;
    homeCategory?: any[];
}

export default function HomePlace7({ adHeader, homeCategory = [] }: HomePlace7Props) {
  const [post, setPost] = useState<any[]>([]);

  // Filter for PlaceHolderIDForHome = 7
  const homeCategory1 = homeCategory.find(
    (category) => category.PlaceHolderIDForHome == 7
  );

  const axiosConfig = {
    headers: {
      sessionToken: configData.SESSION_TOKEN,
    },
  };

  // Fetch posts for the category
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
        .catch((error) => {
          console.error("Error fetching posts:", error);
        });
    }
  }, [homeCategory1?.Slug]);

  if (!homeCategory1) return null;

  return (
    <Fragment>
      <section className="home-front-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              {/* News Tabs start */}
              <div className="main-content tab-view border-theme">
                <div className="row">
                  <div className="col-lg-12 mycol">
                    <div className="header-area">
                      <h3 className="title">{homeCategory1.DefaultTitleToDisplay}</h3>
                      <Link href={`${configData.BASE_URL_CATEGORY}${homeCategory1.Slug}`}>
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
                          {post && post.length > 0 ? (
                            post.map((p, i) => {
                              if (i > 0 && i < 5) {
                                const imageUrl = p?.PostFiles?.[0]?.AssetLiveUrl || "/assets/images/no-image.png";
                                return (
                                  <div className="col-md-3 mycol" key={p.Slug || i}>
                                    <div className="single-news landScape-normal box_design_Line HomePlace7">
                                      <Link href={`${configData.BASE_URL_CATEGORY_DETAIL}${p.Slug}`}>
                                        <div className="content-wrapper">
                                          <div className="img">
                                            <div
                                              className="tag"
                                              style={{
                                                backgroundColor: p?.CategoryColor || "#9c27b0",
                                              }}
                                            >
                                              {homeCategory1.DefaultTitleToDisplay}
                                            </div>
                                            <Image
                                              src={imageUrl}
                                              alt={p.TitleData?.[0]?.Translation || "Post image"}
                                              width={400}
                                              height={250}
                                              className="lazy"
                                            />
                                          </div>
                                          <div className="inner-content">
                                            <h4 className="title">
                                              {p.TitleData?.[0]?.Translation || ""}
                                            </h4>
                                            <div className="text">
                                              {p.DescriptionData?.[0]?.Translation
                                                ? parse(
                                                    sanitizeHtml(
                                                      p.DescriptionData[0].Translation.substring(
                                                        0,
                                                        100
                                                      )
                                                    )
                                                  )
                                                : ""}
                                            </div>
                                          </div>
                                        </div>
                                      </Link>
                                    </div>
                                  </div>
                                );
                              }
                            })
                          ) : (
                            <p>No posts found.</p>
                          )}
                        </div>
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
