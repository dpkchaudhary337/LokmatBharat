"use client";

import React, { Fragment, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import configData from "./Config";
import { cachedAxiosGet } from "@/utils/apiCache";
import Link from "next/link";

export default function SearchList(props: any) {
  const searchText = props.searchText || "";
  const categorySlug = props.categorySlug || "";

  const searchParams = useSearchParams();
  const offset = searchParams?.get("page")
    ? parseInt(searchParams.get("page")!)
    : 1;

  const perPagePost = configData.PER_PAGE_POST;
  const axiosConfig = React.useMemo(
    () => ({
      headers: {
        sessionToken: configData.SESSION_TOKEN,
      },
    }),
    []
  );

  const sanitizedSearchText = searchText.trim();
  const searchApiUrl = React.useMemo(() => {
    if (!sanitizedSearchText) return null;
    return `${configData.SEARCH_API_URL}${encodeURIComponent(
      sanitizedSearchText
    )}`;
  }, [sanitizedSearchText]);

  const [post, setPost] = React.useState<any[]>([]);
  const [totalRecords, setTotalRecords] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    if (!searchApiUrl) {
      setPost([]);
      setTotalRecords(0);
      return;
    }

    const controller = new AbortController();
    const fetchSearchResults = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const finalSearchApiUrl = searchApiUrl.replace(
          "#OFFSET",
          String(offset > 1 ? (offset - 1) * perPagePost : 0)
        );
        // For search results, we might want fresh data, so use shorter cache or force refresh
        // But for same search query, we can cache it
        const result = await cachedAxiosGet(finalSearchApiUrl, {
          ...axiosConfig,
          signal: controller.signal,
        }, { expiry: 2 * 60 * 1000 }); // 2 minutes cache for search
        const data = (result as any)?._data ?? result;
        setPost(Array.isArray(data) ? data : []);
        // Extract TotalRecords from the response if available
        const totalRecordsValue = (result as any)?._totalRecords ?? (result as any)?._fullResponse?.TotalRecords ?? 0;
        setTotalRecords(totalRecordsValue);
      } catch (err: any) {
        if (err?.name === "CanceledError") return;
        console.error("Search API error:", err);
        setError(
          err?.response?.data?.Message ||
            "Search is temporarily unavailable. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
    return () => controller.abort();
  }, [searchApiUrl, offset, axiosConfig, perPagePost]);

  if (isLoading) {
    return (
      <section className="hero-area news-details-page home-front-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center py-5">
              <div className="loader">Loading...</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="hero-area news-details-page home-front-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center py-5">
              <p className="text-danger mb-2">{error}</p>
              <p className="text-muted">
                कृपया कुछ देर बाद पुनः प्रयास करें या अलग कीवर्ड इस्तेमाल करें।
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!post.length && !totalRecords) return null;


  const totalPages =
    typeof totalRecords === "number"
      ? Math.max(0, Math.ceil(totalRecords / perPagePost))
      : 0;
  const numberOfPages = [...Array(totalPages).keys()];


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
    [...Array(threshhold).keys()].map(x=>x+1),
    [...Array(threshhold).keys()].map(x=>x+threshhold),
    [...Array(threshhold*2+threshhold-threshhold*2).keys()].map(x=>x+threshhold*2),
    [...Array(threshhold*3+threshhold-threshhold*3).keys()].map(x=>x+threshhold*3),
    [...Array(threshhold*4+threshhold-threshhold*4).keys()].map(x=>x+threshhold*4),
    [...Array(threshhold*5+threshhold-threshhold*5).keys()].map(x=>x+threshhold*5),
    [...Array(threshhold*6+threshhold-threshhold*6).keys()].map(x=>x+threshhold*6),
    [...Array(threshhold*7+threshhold-threshhold*7).keys()].map(x=>x+threshhold*7),
    [...Array(threshhold*8+threshhold-threshhold*8).keys()].map(x=>x+threshhold*8),
    [...Array(threshhold*9+threshhold-threshhold*9).keys()].map(x=>x+threshhold*9),
    [...Array(threshhold*10+threshhold-threshhold*10).keys()].map(x=>x+threshhold*10),
    [...Array(threshhold*11+threshhold-threshhold*11).keys()].map(x=>x+threshhold*11),
    [...Array(threshhold*12+threshhold-threshhold*12).keys()].map(x=>x+threshhold*12),
    [...Array(threshhold*13+threshhold-threshhold*13).keys()].map(x=>x+threshhold*13),
    [...Array(threshhold*14+threshhold-threshhold*14).keys()].map(x=>x+threshhold*14),
    [...Array(threshhold*15+threshhold-threshhold*15).keys()].map(x=>x+threshhold*15),
    [...Array(threshhold*16+threshhold-threshhold*16).keys()].map(x=>x+threshhold*16),
    [...Array(threshhold*17+threshhold-threshhold*17).keys()].map(x=>x+threshhold*17),
    [...Array(threshhold*18+threshhold-threshhold*18).keys()].map(x=>x+threshhold*18),
    [...Array(threshhold*19+threshhold-threshhold*19).keys()].map(x=>x+threshhold*19),
    [...Array(threshhold*20+threshhold-threshhold*20).keys()].map(x=>x+threshhold*20),
    [...Array(threshhold*21+threshhold-threshhold*21).keys()].map(x=>x+threshhold*21),
    [...Array(threshhold*22+threshhold-threshhold*22).keys()].map(x=>x+threshhold*22),
    [...Array(threshhold*23+threshhold-threshhold*23).keys()].map(x=>x+threshhold*23),
    [...Array(threshhold*24+threshhold-threshhold*24).keys()].map(x=>x+threshhold*24),
    [...Array(threshhold*25+threshhold-threshhold*25).keys()].map(x=>x+threshhold*25),
    [...Array(threshhold*26+threshhold-threshhold*26).keys()].map(x=>x+threshhold*26),
    [...Array(threshhold*27+threshhold-threshhold*27).keys()].map(x=>x+threshhold*27),
    [...Array(threshhold*28+threshhold-threshhold*28).keys()].map(x=>x+threshhold*28),
    [...Array(threshhold*29+threshhold-threshhold*29).keys()].map(x=>x+threshhold*29),
    [...Array(threshhold*30+threshhold-threshhold*30).keys()].map(x=>x+threshhold*30),
    [...Array(threshhold*31+threshhold-threshhold*31).keys()].map(x=>x+threshhold*31),
    [...Array(threshhold*32+threshhold-threshhold*32).keys()].map(x=>x+threshhold*32),
    [...Array(threshhold*33+threshhold-threshhold*33).keys()].map(x=>x+threshhold*33),
    [...Array(threshhold*34+threshhold-threshhold*34).keys()].map(x=>x+threshhold*34),
    [...Array(threshhold*35+threshhold-threshhold*35).keys()].map(x=>x+threshhold*35),
    [...Array(threshhold*36+threshhold-threshhold*36).keys()].map(x=>x+threshhold*36),
    [...Array(threshhold*37+threshhold-threshhold*37).keys()].map(x=>x+threshhold*37),
    [...Array(threshhold*38+threshhold-threshhold*38).keys()].map(x=>x+threshhold*38),
    [...Array(threshhold*39+threshhold-threshhold*39).keys()].map(x=>x+threshhold*39),
    [...Array(threshhold*40+threshhold-threshhold*40).keys()].map(x=>x+threshhold*40),
    [...Array(threshhold*41+threshhold-threshhold*41).keys()].map(x=>x+threshhold*41),
    [...Array(threshhold*42+threshhold-threshhold*42).keys()].map(x=>x+threshhold*42),
    [...Array(threshhold*43+threshhold-threshhold*43).keys()].map(x=>x+threshhold*43),
    [...Array(threshhold*44+threshhold-threshhold*44).keys()].map(x=>x+threshhold*44),
    [...Array(threshhold*45+threshhold-threshhold*45).keys()].map(x=>x+threshhold*45),
    [...Array(threshhold*46+threshhold-threshhold*46).keys()].map(x=>x+threshhold*46),
    [...Array(threshhold*47+threshhold-threshhold*47).keys()].map(x=>x+threshhold*47),
    [...Array(threshhold*48+threshhold-threshhold*48).keys()].map(x=>x+threshhold*48),
    [...Array(threshhold*49+threshhold-threshhold*49).keys()].map(x=>x+threshhold*49),
    [...Array(threshhold*50+threshhold-threshhold*50).keys()].map(x=>x+threshhold*50),
  ]

  let currentPageRecords = null;
  if(numberOfPages){
  if(offset < numberOfPages.length-3){
    currentPageRecords = pageRange[offset>threshhold ? Math.floor(offset/threshhold):0];
  }else{
    currentPageRecords = pageRange[offset>threshhold ? Math.floor(((numberOfPages.length)-3)/threshhold):0];
  }
  }
  return (
    <Fragment>
      <section className="hero-area news-details-page home-front-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              {/* <!--Section Category 1--> */}
              <div className="main-content tab-view border-theme mt-15">
                <div className="row">
                  <div className="col-lg-12 mycol">
                    <div className="header-area">
                      <h3 className="title">
                        {searchText ? searchText : categorySlug}
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
                                        <Link
                                          href={`${configData.BASE_URL_CATEGORY_DETAIL}${p.Slug}`}
                                        >
                                          <div className="single-box landScape-small-with-meta box_design_block margin-10">
                                            <div className="img">
                                              <img
                                                src={
                                                  p.PostFiles[0].AssetLiveUrl
                                                }
                                                alt=""
                                                className="lazy"
                                              />
                                            </div>
                                            <div className="content">
                                              <h4 className="title">
                                                {p.TitleData[0].Translation}
                                              </h4>
                                            </div>
                                          </div>
                                        </Link>
                                      </div>
                                    );
                                  })
                                : ""}
                            </div>
                          </div>
                        </div>

                        <center>
                          <div className="mt-3">
                            <nav>
                              <ul className="pagination">
                                <li className="page-item">
                                  <Link
                                    className="page-link"
                                    href={`${
                                      configData.BASE_URL_SEARCH
                                    }${searchText}&page=${offset-1}`}
                                    rel="prev"
                                    aria-label="« Previous"
                                  >
                                    ‹
                                  </Link>
                                </li>
                                {offset > threshhold &&
                                <li className="page-item"><Link className="page-link" href={`${configData.BASE_URL_SEARCH}${searchText}&page=${currentPageRecords && currentPageRecords.length>0 ? currentPageRecords[0]-1:0}`}>...</Link></li>
                                }
                                {currentPageRecords && currentPageRecords.map((n: number, i: number) => {
                                  const pageNumber = n;
                                  if(pageNumber<numberOfPages[numberOfPages.length-1]){
                                  return (
                                      <li key={i} className={`page-item${offset == n ? " active" : ""}`}>
                                        <Link className="page-link" href={`${configData.BASE_URL_SEARCH}${searchText}&page=${n}`}>
                                          {pageNumber}
                                        </Link>
                                      </li>
                                    );
                                  }
                                })}

                                {totalRecords && totalRecords > 70 &&
                                <>
                                {currentPageRecords && currentPageRecords[threshhold-1]+1<numberOfPages[numberOfPages.length-1] &&
                                <li className="page-item">
                                  <Link
                                    className="page-link"
                                    href={`${
                                      configData.BASE_URL_SEARCH
                                    }${searchText}&page=${currentPageRecords[threshhold-1]+1}`}
                                  >
                                    ...
                                  </Link>
                                </li>
                                }
                                <li className={`page-item${
                                          offset == numberOfPages[numberOfPages.length - 1] ? " active" : ""
                                        }`}>
                                  <Link className="page-link" href={`${
                                      configData.BASE_URL_SEARCH
                                    }${searchText}&page=${numberOfPages[numberOfPages.length - 1]}`}>
                                    {numberOfPages[numberOfPages.length - 1]}
                                  </Link>
                                </li>
                                <li className={`page-item${
                                          offset == numberOfPages.length ? " active" : ""
                                        }`}>
                                  <Link className="page-link" href={`${
                                      configData.BASE_URL_SEARCH
                                    }${searchText}&page=${numberOfPages.length}`}>
                                    {numberOfPages.length}
                                  </Link>
                                </li>
                                </>
                                }
                                {numberOfPages.length != offset &&
                                  <>
                                <li className="page-item">
                                  <Link
                                    className="page-link"
                                    href={`${
                                      configData.BASE_URL_SEARCH
                                    }${searchText}&page=${offset+1}`}
                                    rel="next"
                                    aria-label="Next »"
                                  >
                                    ›
                                  </Link>
                                </li>
                                </>
                                }
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
                    <iframe
                      frameBorder="0"
                      scrolling="no"
                      marginHeight={0}
                      marginWidth={0}
                      width="100%"
                      height="200"
                      title="search-video"
                      src="https://www.youtube.com/embed/mLQ8yeckbNM?autoplay=0&origin=https://awarepedia.com"
                    ></iframe>
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
              <div className="main-content tab-view border-theme mt-15">
                <div className="row">
                  <div className="col-lg-12 mycol">
                    <div className="header-area">
                      <h3 className="title">Subscribe Newsletter</h3>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12 mycol">
                    <div className="aside-newsletter-widget mt-3 subarea">
                      <h5 className="title">Subscribe Newsletter!</h5>
                      <p>
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry. Lorem Ipsum has been the
                        industry's standard dummy text ever since the 1500s.
                      </p>

                      <div className="input-group mb-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Email"
                          aria-label="Email"
                          aria-describedby="basic-addon2"
                        />
                        <div className="input-group-append">
                          <span className="input-group-text" id="basic-addon2">
                            <i className="fa fa-arrow-right"></i>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* <!-- NewsLetter end --> */}
              {/* <!-- Ads start --> */}
              <div className="row">
                <div className="col-lg-12">
                  <div className="ad-area">
                    <p>AD</p>
                  </div>
                </div>
              </div>
              {/* <!-- Ads start --> */}
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  );
}
