"use client";

import React, { useEffect, useState } from "react";
import { cachedAxiosGet } from "@/utils/apiCache";
import parse from "html-react-parser";
import sanitizeHtml from "@/utils/sanitizeHtml";
import Link from "next/link";
import configData from "@/components/Config";

export default function HomePlace3({ adHeader, homeCategory }: any) {
  const adsData = adHeader;
  const adImage = adsData ? adsData.pAsset.AssetLiveUrl : "";

  const homeCategory1 = homeCategory?.find(
    (category: any) => category.PlaceHolderIDForHome == 3
  );

  // Early return if no category found
  if (!homeCategory1 || !homeCategory1.Slug) {
    return null;
  }

  const axiosConfig = {
    headers: {
      sessionToken: configData.SESSION_TOKEN,
    },
  };

  const [postCrime, setPostCrime] = useState<any[]>([]);

  useEffect(() => {
    if (homeCategory1 && homeCategory1.Slug) {
      const postApiUrl = configData.POST_API_URL.replace(
        "#CATEGORY_SLUG",
        homeCategory1.Slug
      ).replace("#OFFSET", "0");

      cachedAxiosGet(postApiUrl, axiosConfig).then((result: any) => {
        const data = result?._data ?? result;
        setPostCrime(Array.isArray(data) ? data : []);
      }).catch((e) => {
        console.error("Error fetching posts:", e);
      });
    }
  }, [homeCategory1.Slug]);

  return (
    <div className="col-lg-6">
      <div className="main-content tab-view border-theme HomePlace3Space">
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
            <div className="tab-content">
              <div className="tab-pane fade show active">
                <div className="row">
                  {/* Left big post */}
                  <div className="col-md-6 mycol">
                    <div className="single-news landScape-normal box_design_Line HomePlace3">
                      <Link
                        href={`${configData.BASE_URL_CATEGORY_DETAIL}${
                          postCrime && postCrime.length > 0
                            ? postCrime[0].Slug
                            : ""
                        }`}
                      >
                        <div className="content-wrapper">
                          <div className="img">
                            <div
                              className="tag"
                              style={
                                postCrime && postCrime.length > 0
                                  ? { backgroundColor: postCrime[0].CategoryColor }
                                  : { backgroundColor: "#9c27b0" }
                              }
                            >
                              {homeCategory1.DefaultTitleToDisplay}
                            </div>
                            <img
                              src={
                                postCrime && postCrime.length > 0
                                  ? postCrime[0].PostFiles[0].AssetLiveUrl
                                  : "/assets/images/no-image.png"
                              }
                              alt={
                                postCrime && postCrime.length > 0
                                  ? postCrime[0].TitleData[0].Translation
                                  : ""
                              }
                            />
                          </div>

                          <div className="inner-content">
                            <h4 className="title font-10">
                              {postCrime && postCrime.length > 0
                                ? postCrime[0].TitleData[0].Translation
                                : ""}
                            </h4>
                            <div className="text">
                              {postCrime && postCrime.length > 0
                                ? parse(
                                    `${sanitizeHtml(
                                      postCrime[0].DescriptionData[0].Translation.substring(
                                        0,
                                        175
                                      )
                                    )}...`
                                  )
                                : ""}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Right small list */}
                  <div className="col-md-6 mycol">
                    <div className="row">
                      {postCrime && postCrime.length > 0
                        ? postCrime.map((p, i) => {
                            if (i > 0 && i < 6) {
                              return (
                                <div key={i} className="col-md-12 r-p">
                                  <div className="single-box landScape-small-with-meta box_design_Line">
                                    <div className="content border_1">
                                      <Link
                                        href={`${configData.BASE_URL_CATEGORY_DETAIL}${p.Slug}`}
                                      >
                                        <h4 className="title_long angleRight">
                                          {p.TitleData[0].Translation}
                                        </h4>
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          })
                        : ""}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
}
