"use client";

import React, { Fragment, useEffect, useState, useMemo } from "react";
import configData from "@/components/Config";
import { cachedAxiosGet } from "@/utils/apiCache";
import parse from "html-react-parser";
import sanitizeHtml from "@/utils/sanitizeHtml";
import Image from "next/image";
import Link from "next/link"; // ✅ Added Link from next/link

interface HomePlace4Props {
  adHeader: any;
  homeCategory: any[];
}

export default function HomePlace4({ adHeader, homeCategory }: HomePlace4Props) {
  const adImage = adHeader ? adHeader.pAsset?.AssetLiveUrl : "";

  const homeCategory1 = homeCategory?.find(
    (category) => category.PlaceHolderIDForHome == 4
  );

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

      cachedAxiosGet(postApiUrl, axiosConfig).then((result: any) => {
        const data = result?._data ?? result;
        setPost(Array.isArray(data) ? data : []);
      }).catch((error) => {
        console.error("Error fetching posts:", error);
      });
    } else {
      setPost([]);
    }
  }, [homeCategory1?.Slug, axiosConfig]);

  // Return null only if category doesn't exist, but keep component structure stable
  if (!homeCategory1 || !homeCategory1.Slug) {
    return null;
  }

  return (
    <Fragment>
      {/* Section 1 */}
      <section className="home-front-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="main-content tab-view border-theme">
                <div className="row">
                  <div className="col-lg-12 mycol">
                    <div className="header-area">
                      <h3 className="title">
                        {homeCategory1.DefaultTitleToDisplay}
                      </h3>
                      <Link
                        href={`${configData.BASE_URL_CATEGORY}${homeCategory1.Slug}`}
                      >
                        सभी देखें
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="row">
            {post && post.length > 0
              ? post.map((p, i) => {
                  if (i < 3) {
                    return (
                      <div className="col-lg-4 mycol" key={p?.Slug || p?.ID || `post-${i}`} style={{ paddingBottom: 15 }}>
                        <Link
                          href={`${configData.BASE_URL_CATEGORY_DETAIL}${p.Slug}`}
                          className="single-news animation"
                        >
                          <div className="content-wrapper heightBig HomePlace4_1">
                            <div
                              className="tag"
                              style={{
                                backgroundColor: p.CategoryColor || "#9c27b0",
                              }}
                            >
                              {homeCategory1.DefaultTitleToDisplay}
                            </div>

                            <Image
                              src={
                                p.PostFiles[0]?.AssetLiveUrl ||
                                "/assets/images/no-image.png"
                              }
                              alt={p.TitleData[0]?.Translation || "News Image"}
                              width={500}
                              height={300}
                              className="lazy"
                            />

                            <div className="inner-content">
                              <span className="white-section">
                                <h4 className="title">
                                  {p.TitleData[0]?.Translation}
                                </h4>
                              </span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  }
                  return null;
                })
              : null}
          </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Section 3 */}
      <section className="home-front-area">
        <div className="container">
          <div className="row">
            {/* Left big post */}
            <div className="col-lg-8">
              <Link
                href={`${configData.BASE_URL_CATEGORY_DETAIL}${
                  post && post.length > 3 ? post[3].Slug : ""
                }`}
                className="single-news animation"
              >
                <div className="content-wrapper heightBig HomePlace4_2">
                  <div
                    className="tag"
                    style={{
                      backgroundColor:
                        post && post.length > 3
                          ? post[3].CategoryColor
                          : "#9c27b0",
                    }}
                  >
                    {homeCategory1.DefaultTitleToDisplay}
                  </div>

                  <Image
                    src={
                      post && post.length > 3
                        ? post[3].PostFiles[0]?.AssetLiveUrl
                        : "/assets/images/no-image.png"
                    }
                    alt={
                      post && post.length > 3
                        ? post[3].TitleData[0]?.Translation
                        : "News Image"
                    }
                    width={800}
                    height={400}
                    className="lazy"
                  />

                  <div className="inner-content">
                    <span className="white-section">
                      <h4 className="title">
                        {post && post.length > 3
                          ? post[3].TitleData[0]?.Translation
                          : ""}
                      </h4>
                      {post && post.length > 3
                        ? parse(
                            sanitizeHtml(
                              post[3].DescriptionData[0]?.Translation.substring(
                                0,
                                200
                              )
                            )
                          )
                        : ""}
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Right small post */}
            <div className="col-lg-4">
              <Link
                href={`${configData.BASE_URL_CATEGORY_DETAIL}${
                  post && post.length > 4 ? post[4].Slug : ""
                }`}
                className="single-news animation"
              >
                <div className="content-wrapper heightBig HomePlace4_3">
                  <div
                    className="tag"
                    style={{
                      backgroundColor:
                        post && post.length > 4
                          ? post[4].CategoryColor
                          : "#9c27b0",
                    }}
                  >
                    {homeCategory1.DefaultTitleToDisplay}
                  </div>

                  <Image
                    src={
                      post && post.length > 4
                        ? post[4].PostFiles[0]?.AssetLiveUrl
                        : "/assets/images/no-image.png"
                    }
                    alt={
                      post && post.length > 4
                        ? post[4].TitleData[0]?.Translation
                        : "News Image"
                    }
                    width={600}
                    height={350}
                    className="lazy"
                  />

                  <div className="inner-content">
                    <span className="white-section">
                      <h4 className="title">
                        {post && post.length > 4
                          ? post[4].TitleData[0]?.Translation
                          : ""}
                      </h4>
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  );
}
