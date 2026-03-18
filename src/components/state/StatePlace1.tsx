import React, { Fragment, useEffect, useState, useMemo } from "react";
import configData from "../Config";
import { cachedAxiosGet } from "@/utils/apiCache";
import parse from "html-react-parser";
import sanitizeHtml from "@/utils/sanitizeHtml";
import Link from "next/link";
import HomePlace1Skeleton from "../HomePlace1Skeleton";

interface StatePlace1Props {
    adHeader?: any;
    stateslug?: string;
    homeCategory?: any[];
}

export default function StatePlace1(props: StatePlace1Props) {
  const adsData = props.adHeader;
  const adImage = adsData?.pAsset?.AssetLiveUrl || "";

  // Memoize postApiUrl to prevent unnecessary re-renders
  const postApiUrl = useMemo(() => {
    return configData.POST_API_URL.replace(
      "#CATEGORY_SLUG",
      props.stateslug || ""
    ).replace('#OFFSET', '0');
  }, [props.stateslug]);

  const axiosConfig = {
    headers: {
      sessionToken: configData.SESSION_TOKEN,
    },
  };

  const [post, setPost] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to parse payload from API response
  const parsePayload = (result: any): any[] => {
    try {
      // Check if result has _data (from cache)
      const response = result?._data ?? result;
      
      // If response has payload field (string), parse it
      if (response?.payload) {
        const parsed = typeof response.payload === 'string' 
          ? JSON.parse(response.payload) 
          : response.payload;
        return Array.isArray(parsed) ? parsed : [];
      }
      
      // If response is already an array, return it
      if (Array.isArray(response)) {
        return response;
      }
      
      // If response has data field
      if (response?.data) {
        const data = typeof response.data === 'string' 
          ? JSON.parse(response.data) 
          : response.data;
        return Array.isArray(data) ? data : [];
      }
      
      return [];
    } catch (error) {
      console.error("Error parsing payload:", error);
      return [];
    }
  };

  // Get post categories
  useEffect(() => {
    if (!props.stateslug) {
      setIsLoading(false);
      setPost([]);
      return;
    }

    // Reset state before fetching
    setIsLoading(true);
    setPost([]);
    
    // Fetch data
    const fetchData = async () => {
      try {
        const result = await cachedAxiosGet(postApiUrl, axiosConfig);
        const parsedData = parsePayload(result);
        setPost(parsedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching state posts:", error);
        setPost([]);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [props.stateslug, postApiUrl]);

  // Show "No record found" if no posts after loading
  if (!isLoading && (!post || post.length === 0)) {
    return (
      <Fragment>
        <section className="home-front-area">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="main-content tab-view border-theme">
                  <div className="row">
                    <div className="col-lg-12 mycol">
                      <div className="text-center" style={{ padding: '60px 20px' }}>
                        <h3 style={{ color: '#666', marginBottom: '20px' }}>कोई रिकॉर्ड नहीं मिला</h3>
                        <p style={{ color: '#999' }}>इस राज्य के लिए अभी कोई समाचार उपलब्ध नहीं है।</p>
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

  // Show loading state
  if (isLoading) {
    return <HomePlace1Skeleton />;
  }

  return (
    <Fragment>
      <section className="home-front-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              {/* <!-- News Tabs start --> */}
              <div className="main-content tab-view border-theme">
                <div className="row">
                  <div className="col-lg-12 mycol">
                    <div className="header-area">
                      <h3 className="title">
                        {props.stateslug}
                      </h3>
                      <Link href={`${configData.BASE_URL_CATEGORY}${props.stateslug}`}>सभी देखें</Link>
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
                          <div className="col-md-6 mycol">
                            <div className="single-news landScape-normal box_design_block HomePlace1">
                              <Link href={`${configData.BASE_URL_CATEGORY_DETAIL}${post && post.length > 0 ? post[0].Slug : ''}`}>
                                <div className="content-wrapper">
                                  <div className="img">
                                    <div className="tag" style={post && post.length > 0 ? { backgroundColor: post[0].CategoryColor } : { backgroundColor: '#9c27b0' }}>
                                      {props.stateslug}
                                    </div>
                                    
                                    <img
                                      src={post && post.length > 0 && post[0]?.PostFiles?.length > 0 ? post[0].PostFiles[0].AssetLiveUrl : '/assets/images/no-image.png'}
                                      alt={post?.[0]?.TitleData?.[0]?.Translation || "News Image"}
                                      className="lazy"
                                    />


                                  </div>
                                  <div className="inner-content">
                                    <h4 className="title">
                                      {(() => {
                                        const title = post?.[0]?.TitleData?.[0]?.Translation;
                                        return title ? title.substring(0, 40) + ' ...' : "";
                                      })()}
                                    </h4>
                                    <div className="text">
                                      {(() => {
                                        const description = post?.[0]?.DescriptionData?.[0]?.Translation;
                                        return description ? parse(
                                          `${sanitizeHtml(description.substring(0,180))} ...`
                                        ) : '';
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            </div>
                          </div>
                          <div className="col-md-6 mycol">
                            <div className="row">
                              {post && post.length > 0 ? post.map((p, i) => {
                                if (i > 0 && i < 5 && p?.TitleData?.[0]?.Translation) {
                                  return (
                                    <div className="col-md-6 r-p" key={i}>
                                      <Link href={`${configData.BASE_URL_CATEGORY_DETAIL}${p?.Slug || ''}`}>
                                        <div className="single-box landScape-small-with-meta box_design_block">
                                          <div className="img">
                                            <img
                                              src={p?.PostFiles?.length > 0 ? p.PostFiles[0].AssetLiveUrl : "/assets/images/no-image.png"}
                                              alt={p?.TitleData?.[0]?.Translation || "News Image"}
                                              className="lazy"
                                            />
                                          </div>
                                          <div className="content">
                                            <h4 className="title">
                                              {p?.TitleData?.[0]?.Translation || ""}
                                            </h4>
                                          </div>
                                        </div>
                                      </Link>
                                    </div>
                                  )
                                }
                                return null;
                              }) : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              {/* <!-- सोशल मीडिया start --> */}
              <div className="main-content tab-view border-theme">
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
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  );
}
