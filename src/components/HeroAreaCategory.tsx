"use client";

import React, { Fragment, useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import configData from "./Config";
import { cachedAxiosGet } from "@/utils/apiCache";
import LazyImage from "./LazyImage";
import Newsletter from "./Newsletter";
import Link from "next/link";

export default function HeroAreaCategory(props: any) {
  const menus = props.menus;
  const categorySlug = props.categorySlug || "";
  const pageNumber = props.pageNumber || 1; // Get page number from props
  const searchParams = useSearchParams();
  
  // Use pageNumber from props (passed from parent component)
  const offset = pageNumber;
  const [totalRecords, setTotalRecords] = React.useState<number | null>(null);
  const [isPostLoading, setIsPostLoading] = React.useState(true);
  const rawSearchText = searchParams?.get("search")?.trim() || "";
  const searchText = rawSearchText.length > 0 ? rawSearchText : "";
  const searchApiUrl = searchText
    ? configData.SEARCH_API_URL + searchText
    : null;
  const perPagePost = configData.PER_PAGE_POST;
  const [settingData, setSettingData] = React.useState<{
    YoutubeVideoURL?: string;
  } | null>(null);
  const [adFooter, setAdFooter] = React.useState<any>();
  const [adRight, setAdRight] = React.useState<any>();

  const adFooterApiUrl = configData.AD_API_URL + "home-footer1";
  const adRightApiUrl = configData.AD_API_URL + "home-right1";

  const axiosConfig = React.useMemo(
    () => ({
      headers: {
        sessionToken: configData.SESSION_TOKEN,
      },
    }),
    []
  );

  const [post, setPost] = React.useState<any[]>([]);
  // Get post categories
  useEffect(() => {
    if (!categorySlug) return;

    let isMounted = true;
    setIsPostLoading(true);
    // Calculate API offset: page 1 = offset 0, page 2 = offset 16, page 6 = offset 80
    const apiOffset = offset > 1 ? String((offset - 1) * perPagePost) : "0";
    const postApiUrl = configData.POST_API_URL.replace(
      "#CATEGORY_SLUG",
      categorySlug
    ).replace("#OFFSET", apiOffset);
    const finalSearchApiUrl = searchApiUrl
      ? searchApiUrl.replace("#OFFSET", apiOffset)
      : null;

    const requestUrl =
      searchText && finalSearchApiUrl ? finalSearchApiUrl : postApiUrl;

    cachedAxiosGet(requestUrl, axiosConfig)
      .then((result: any) => {
        if (!isMounted) return;
        // Extract the actual data from the cached response
        const data = result?._data ?? result;
        const posts = Array.isArray(data) ? data : [];
        setPost(posts);
        const totalRecordsValue = result?._totalRecords ?? result?._fullResponse?.TotalRecords ?? posts.length;
        setTotalRecords(totalRecordsValue);
      })
      .catch((error) => {
        console.error("Failed to fetch category posts:", error);
      })
      .finally(() => {
        if (isMounted) {
          setIsPostLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [categorySlug, searchText, searchApiUrl, axiosConfig, offset, perPagePost]);

  useEffect(() => {
    let isMounted = true;

    const fetchStaticData = async () => {
      try {
        const [settingsRes, adFooterRes, adRightRes] = await Promise.all([
          cachedAxiosGet(configData.SETTING_URL, axiosConfig),
          cachedAxiosGet(adFooterApiUrl, axiosConfig),
          cachedAxiosGet(adRightApiUrl, axiosConfig),
        ]);

        if (!isMounted) return;

        const extractData = (result: any) => result?._data ?? result;
        const parsedSettings = extractData(settingsRes);
        setSettingData(Array.isArray(parsedSettings) ? parsedSettings[0] ?? null : parsedSettings);
        const adFooterData = extractData(adFooterRes);
        const adRightData = extractData(adRightRes);
        setAdFooter(adFooterData);
        setAdRight(adRightData);
      } catch (error) {
        console.error("Failed to fetch static data:", error);
      }
    };

    fetchStaticData();

    return () => {
      isMounted = false;
    };
  }, [adFooterApiUrl, adRightApiUrl, axiosConfig]);


  // Calculate total pages (page numbers start from 1)
  const totalPages = Math.ceil((totalRecords || 0) / perPagePost);
  const numberOfPages = totalPages > 0 ? Array.from({ length: totalPages }, (_, i) => i + 1) : [];


  const threshhold = 7;
  //   let i = 0;
  //   let pageRange = new Array(32);
  //   for(i=0;i<32;i++){
  //     for(let j = offset > threshhold ? offset : 1;j<threshhold;j++ ){
  //       pageRange[i] = [...Array((threshhold*i)+threshhold-threshhold*i).keys()].map(x=>x+threshhold*i+1)
  //     }
  //   }
  //   console.log(pageRange)

  const pageRange = [
    [...Array(threshhold).keys()].map(x => x + 1),
    [...Array(threshhold).keys()].map(x => x + threshhold),
    [...Array(threshhold * 2 + threshhold - threshhold * 2).keys()].map(x => x + threshhold * 2),
    [...Array(threshhold * 3 + threshhold - threshhold * 3).keys()].map(x => x + threshhold * 3),
    [...Array(threshhold * 4 + threshhold - threshhold * 4).keys()].map(x => x + threshhold * 4),
    [...Array(threshhold * 5 + threshhold - threshhold * 5).keys()].map(x => x + threshhold * 5),
    [...Array(threshhold * 6 + threshhold - threshhold * 6).keys()].map(x => x + threshhold * 6),
    [...Array(threshhold * 7 + threshhold - threshhold * 7).keys()].map(x => x + threshhold * 7),
    [...Array(threshhold * 8 + threshhold - threshhold * 8).keys()].map(x => x + threshhold * 8),
    [...Array(threshhold * 9 + threshhold - threshhold * 9).keys()].map(x => x + threshhold * 9),
    [...Array(threshhold * 10 + threshhold - threshhold * 10).keys()].map(x => x + threshhold * 10),
    [...Array(threshhold * 11 + threshhold - threshhold * 11).keys()].map(x => x + threshhold * 11),
    [...Array(threshhold * 12 + threshhold - threshhold * 12).keys()].map(x => x + threshhold * 12),
    [...Array(threshhold * 13 + threshhold - threshhold * 13).keys()].map(x => x + threshhold * 13),
    [...Array(threshhold * 14 + threshhold - threshhold * 14).keys()].map(x => x + threshhold * 14),
    [...Array(threshhold * 15 + threshhold - threshhold * 15).keys()].map(x => x + threshhold * 15),
    [...Array(threshhold * 16 + threshhold - threshhold * 16).keys()].map(x => x + threshhold * 16),
    [...Array(threshhold * 17 + threshhold - threshhold * 17).keys()].map(x => x + threshhold * 17),
    [...Array(threshhold * 18 + threshhold - threshhold * 18).keys()].map(x => x + threshhold * 18),
    [...Array(threshhold * 19 + threshhold - threshhold * 19).keys()].map(x => x + threshhold * 19),
    [...Array(threshhold * 20 + threshhold - threshhold * 20).keys()].map(x => x + threshhold * 20),
    [...Array(threshhold * 21 + threshhold - threshhold * 21).keys()].map(x => x + threshhold * 21),
    [...Array(threshhold * 22 + threshhold - threshhold * 22).keys()].map(x => x + threshhold * 22),
    [...Array(threshhold * 23 + threshhold - threshhold * 23).keys()].map(x => x + threshhold * 23),
    [...Array(threshhold * 24 + threshhold - threshhold * 24).keys()].map(x => x + threshhold * 24),
    [...Array(threshhold * 25 + threshhold - threshhold * 25).keys()].map(x => x + threshhold * 25),
    [...Array(threshhold * 26 + threshhold - threshhold * 26).keys()].map(x => x + threshhold * 26),
    [...Array(threshhold * 27 + threshhold - threshhold * 27).keys()].map(x => x + threshhold * 27),
    [...Array(threshhold * 28 + threshhold - threshhold * 28).keys()].map(x => x + threshhold * 28),
    [...Array(threshhold * 29 + threshhold - threshhold * 29).keys()].map(x => x + threshhold * 29),
    [...Array(threshhold * 30 + threshhold - threshhold * 30).keys()].map(x => x + threshhold * 30),
    [...Array(threshhold * 31 + threshhold - threshhold * 31).keys()].map(x => x + threshhold * 31),
    [...Array(threshhold * 32 + threshhold - threshhold * 32).keys()].map(x => x + threshhold * 32),
    [...Array(threshhold * 33 + threshhold - threshhold * 33).keys()].map(x => x + threshhold * 33),
    [...Array(threshhold * 34 + threshhold - threshhold * 34).keys()].map(x => x + threshhold * 34),
    [...Array(threshhold * 35 + threshhold - threshhold * 35).keys()].map(x => x + threshhold * 35),
    [...Array(threshhold * 36 + threshhold - threshhold * 36).keys()].map(x => x + threshhold * 36),
    [...Array(threshhold * 37 + threshhold - threshhold * 37).keys()].map(x => x + threshhold * 37),
    [...Array(threshhold * 38 + threshhold - threshhold * 38).keys()].map(x => x + threshhold * 38),
    [...Array(threshhold * 39 + threshhold - threshhold * 39).keys()].map(x => x + threshhold * 39),
    [...Array(threshhold * 40 + threshhold - threshhold * 40).keys()].map(x => x + threshhold * 40),
    [...Array(threshhold * 41 + threshhold - threshhold * 41).keys()].map(x => x + threshhold * 41),
    [...Array(threshhold * 42 + threshhold - threshhold * 42).keys()].map(x => x + threshhold * 42),
    [...Array(threshhold * 43 + threshhold - threshhold * 43).keys()].map(x => x + threshhold * 43),
    [...Array(threshhold * 44 + threshhold - threshhold * 44).keys()].map(x => x + threshhold * 44),
    [...Array(threshhold * 45 + threshhold - threshhold * 45).keys()].map(x => x + threshhold * 45),
    [...Array(threshhold * 46 + threshhold - threshhold * 46).keys()].map(x => x + threshhold * 46),
    [...Array(threshhold * 47 + threshhold - threshhold * 47).keys()].map(x => x + threshhold * 47),
    [...Array(threshhold * 48 + threshhold - threshhold * 48).keys()].map(x => x + threshhold * 48),
    [...Array(threshhold * 49 + threshhold - threshhold * 49).keys()].map(x => x + threshhold * 49),
    [...Array(threshhold * 50 + threshhold - threshhold * 50).keys()].map(x => x + threshhold * 50),
  ]

  let currentPageRecords = null;
  if (numberOfPages) {
    if (offset < numberOfPages.length - 3) {
      currentPageRecords = pageRange[offset > threshhold ? Math.floor(offset / threshhold) : 0];
    } else {
      currentPageRecords = pageRange[offset > threshhold ? Math.floor(((numberOfPages.length) - 3) / threshhold) : 0];
    }
  }
  return (
    <Fragment>
      <section className="hero-area news-details-page home-front-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              {/* <!--Section Category 1--> */}
              <div className="main-content tab-view border-theme">
                <div className="row">
                  <div className="col-lg-12 mycol">
                    <div className="header-area">
                      <h3 className="title">
                        {searchText ? searchText : post && post.length > 0 ? post[0].CategoryName : categorySlug}

                      </h3>
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
                          <div className="col-md-12 mycol">
                            <div className="row">
                              {post && post.length > 0
                                ? post.map((p, i) => {
                                  return (
                                    <div key={i} className="col-md-3 r-p">
                                      <div className="single-box landScape-small-with-meta box_design_block margin-10">
                                        <Link
                                          href={`${configData.BASE_URL_CATEGORY_DETAIL}${p.Slug}`}
                                        >
                                          <div className="img">
                                            <LazyImage
                                              src={
                                                p?.PostFiles?.[0]?.AssetLiveUrl
                                              }
                                              alt={
                                                p?.TitleData?.[0]?.Translation ||
                                                "news-thumbnail"
                                              }
                                              className="lazy"
                                            />
                                          </div>
                                          <div className="content">
                                            <h4 className="title">
                                              {p.TitleData[0].Translation}
                                            </h4>
                                          </div>
                                        </Link>
                                      </div>
                                    </div>
                                  );
                                })
                                : ""}
                            </div>
                          </div>
                        </div>

                        <center>
                          <div className="mt-3 mb-15">
                            <nav>
                              <ul className="pagination">
                                {offset > 1 && (
                                  <li className="page-item">
                                    <Link
                                      className="page-link"
                                      href={`${configData.BASE_URL_CATEGORY}${categorySlug}/${offset - 1}`}
                                      rel="prev"
                                      aria-label="« Previous"
                                    >
                                      ‹
                                    </Link>
                                  </li>
                                )}
                                {offset > threshhold &&
                                  <li className="page-item"><Link className="page-link" href={`${configData.BASE_URL_CATEGORY
                                    }${categorySlug}/${currentPageRecords && currentPageRecords.length > 0 ? currentPageRecords[0] - 1 : 0}`}>...</Link></li>
                                }
                                {currentPageRecords && currentPageRecords.map((n: number, i: number) => {
                                  const pageNumber = n;
                                  if (pageNumber <= totalPages) {
                                    return (
                                      <li key={i} className={`page-item${offset === pageNumber ? " active" : ""}`}>
                                        <Link className="page-link" href={`${configData.BASE_URL_CATEGORY}${categorySlug}/${pageNumber}`}>
                                          {pageNumber}
                                        </Link>
                                      </li>
                                    );
                                  }
                                  return null;
                                })}

                                {totalRecords && totalRecords > 70 &&
                                  <>
                                    {currentPageRecords && currentPageRecords[threshhold - 1] + 1 < numberOfPages[numberOfPages.length - 1] &&
                                      <li className="page-item">
                                        <Link
                                          className="page-link"
                                          href={`${configData.BASE_URL_CATEGORY
                                            }${categorySlug}/${currentPageRecords[threshhold - 1] + 1}`}
                                        >
                                          ...
                                        </Link>
                                      </li>
                                    }
                                    {totalPages > 0 && (
                                      <li className={`page-item${offset === totalPages ? " active" : ""}`}>
                                        <Link className="page-link" href={`${configData.BASE_URL_CATEGORY}${categorySlug}/${totalPages}`}>
                                          {totalPages}
                                        </Link>
                                      </li>
                                    )}
                                  </>
                                }
                                {offset < totalPages && (
                                  <li className="page-item">
                                    <Link
                                      className="page-link"
                                      href={`${configData.BASE_URL_CATEGORY}${categorySlug}/${offset + 1}`}
                                      rel="next"
                                      aria-label="Next »"
                                    >
                                      ›
                                    </Link>
                                  </li>
                                )}
                              </ul>
                            </nav>
                          </div>
                        </center>
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
                    {settingData?.YoutubeVideoURL ? (
                      <iframe
                        frameBorder="0"
                        scrolling="no"
                        marginHeight={0}
                        marginWidth={0}
                        width="100%"
                        height="220"
                        loading="lazy"
                        title="category-featured-video"
                        src={settingData.YoutubeVideoURL}
                      ></iframe>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* <!-- सोशल मीडिया start --> */}
              <div className="main-content tab-view border-theme mt-15">
                <div className="row">
                  <div className="col-lg-12 mycol">
                    <div className="header-area">
                      <h3 className="title">सोशल मीडिया</h3>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12 mycol">
                    <div className="blank"></div>
                  </div>
                </div>
              </div>
              {/* <!-- सोशल मीडिया emd --> */}
              {/* <!-- NewsLetter start --> */}
              <Newsletter adRight3={props.adRight3} />
              {/* <!-- NewsLetter end --> */}
              {/* <!-- Ads start --> */}
              <div className="row">
                <div className="col-lg-12">
                  <div className="ad-area">
                    <a
                      href={adRight?.AdLink || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <LazyImage
                        src={adRight ? adRight.pAsset.AssetLiveUrl : ""}
                        alt="right-side-ad"
                      />
                    </a>
                  </div>
                </div>
              </div>
              {/* <!-- Ads start --> */}
            </div>
          </div>
        </div>
      </section>
      {/* <!-- Footer Ad Start--> */}
      <section className="home-front-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              {/* <!-- News Tabs start --> */}
              <div className="main-content tab-view">
                <div className="row">
                  <div className="col-lg-12 mycol padding_15">
                    <a
                      href={adFooter?.AdLink || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <LazyImage
                        src={adFooter ? adFooter.pAsset.AssetLiveUrl : ""}
                        alt="footer-ad"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* <!-- Footer Ad End --> */}
    </Fragment>
  );
}
