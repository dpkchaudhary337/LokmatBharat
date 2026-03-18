import React, { Fragment, useEffect,useState } from "react";
import configData from "./Config";
import { cachedAxiosGet } from "@/utils/apiCache";
import parse from "html-react-parser";
import sanitizeHtml from "@/utils/sanitizeHtml";
import Link from "next/link";

interface HomePlace1Props {
    adHeader?: any;
    homeCategory?: any[];
}

export default function HomePlace1(props: HomePlace1Props) {
  const adsData = props.adHeader;
  const adImage = adsData ? adsData.pAsset.AssetLiveUrl : "";
  let homeCategory1Array = props.homeCategory ? props.homeCategory.filter((category) => {
    return category.PlaceHolderIDForHome == 1;
  }) : [];

  let post0 = "";

  const homeCategory1: any = homeCategory1Array.length > 0 ? homeCategory1Array[0] : null;
  
  // Early return if no category found
  if (!homeCategory1 || !homeCategory1.Slug) {
    return null;
  }
  
  const postApiUrl = configData.POST_API_URL.replace(
    "#CATEGORY_SLUG",
    homeCategory1.Slug
  ).replace('#OFFSET','0');

  const axiosConfig = {
    headers: {
      sessionToken: configData.SESSION_TOKEN,
    },
  };

  const [post, setPost] = useState<any[]>([]);

  // Get post categories
  useEffect(() => {
    if(homeCategory1 && homeCategory1.Slug){
      const url = configData.POST_API_URL.replace(
        "#CATEGORY_SLUG",
        homeCategory1.Slug
      ).replace('#OFFSET','0');
      
      cachedAxiosGet(url, axiosConfig).then((result: any) => {
        const data = result?._data ?? result;
        setPost(Array.isArray(data) ? data : []);
      }).catch((error) => {
        console.error("Error fetching posts:", error);
      });
    }
  }, [homeCategory1?.Slug]);

  if(!post || (Array.isArray(post) && post.length === 0)) return null;

  return (
    <Fragment>
      <section className="home-front-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              {/* <!-- News Tabs start --> */}
              <div className="main-content tab-view border-theme homeplace1_Section">
                <div className="row">
                  <div className="col-lg-12 mycol">
                    <div className="header-area">
                      <h3 className="title">
                        {homeCategory1.DefaultTitleToDisplay}
                      </h3>
                      <Link href={`${configData.BASE_URL_CATEGORY}${homeCategory1.Slug}`}>सभी देखें</Link>
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
                              <Link href={`${configData.BASE_URL_CATEGORY_DETAIL}${post && post.length>0?post[0].Slug:''}`}>
                                <div className="content-wrapper">
                                  <div className="img">
                                  <div className="tag" style={post && post.length > 0 ? { backgroundColor: post[0].CategoryColor } : { backgroundColor: '#9c27b0' }}>
                                      {homeCategory1.DefaultTitleToDisplay}
                                    </div>
                                    <img
                                      src={post && post.length > 0 && post[0].PostFiles.length > 0 ? post[0].PostFiles[0].AssetLiveUrl : '/assets/images/no-image.png'}
                                      alt={post[0].TitleData[0].Translation}
                                      className="lazy"
                                    />
                                  </div>
                                  <div className="inner-content">
                                    <h4 className="title">
                                      {post && post.length > 0
                                        ? post[0].TitleData[0].Translation.substring(0,40) + ' ...'
                                        : ""}
                                    </h4>
                                    <div className="text">
                                      {post && post.length > 0 ? parse(
                                        `${sanitizeHtml(post[0].DescriptionData[0].Translation.substring(0,180))} ...`
                                      ) : ''}
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            </div>
                          </div>
                          <div className="col-md-6 mycol">
                            <div className="row">
                              {post && post.length > 0 ? post.map((p, i) => {
                                if(i>0 && i<5){
                                return (
                                  <div className="col-md-6 r-p" key={i}>
                                    <Link href={`${configData.BASE_URL_CATEGORY_DETAIL}${p.Slug}`}>
                                      <div className="single-box landScape-small-with-meta box_design_block">
                                        <div className="img">
                                          <img
                                            src={p.PostFiles[0].AssetLiveUrl}
                                            alt={p.TitleData[0].Translation}
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
                                )
                                }
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
              <div className="main-content tab-view border-theme social-blank homeplace1_Section">
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
