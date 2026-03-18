"use client";

import React, { Fragment, useEffect, useState } from "react";
import HeroAreaCategory from "./HeroAreaCategory";
import RelatedNews from "./RelatedNews";
import configData from "./Config";
import { cachedAxiosGet } from "@/utils/apiCache";
import parse from "html-react-parser";
import sanitizeHtml from "@/utils/sanitizeHtml";
import Newsletter from "./Newsletter";

export default function Features(props: any) {
    const [customPages, setCustomPages] = useState<any>(null);
    const axiosConfig = {
        headers: {
            sessionToken: configData.SESSION_TOKEN,
        },
    };
    const site_lang = props.site_lang;
    const menus = props.menus;
    const slug = props.slug || "";
    const customPageURL = configData.GET_CUSTOM_PAGE + slug;

    const adHeader = props.adHeader;

    const adsDataFooter = props.adFooter;
    const adImageFooter = adsDataFooter ? adsDataFooter.pAsset.AssetLiveUrl : '';
    const adFooterLink = adsDataFooter ? adsDataFooter.AdLink : '';

    const adsDataRight = props.adRight;
    const adImageRight = adsDataRight ? adsDataRight.pAsset.AssetLiveUrl : '';
    const adRightLink = adsDataRight ? adsDataRight.AdLink : '';

    const settingData = props.settingData;

    // Getting Custom Page
    useEffect(() => {
        if (!slug) {
            console.log("Features: No slug provided");
            return;
        }
        
        console.log("Features: Fetching data for slug:", slug);
        console.log("Features: API URL:", customPageURL);
        
        cachedAxiosGet(customPageURL, axiosConfig)
            .then((result: any) => {
                console.log("Features: API Response:", result);
                const data = result?._data ?? result;
                console.log("Features: Extracted data:", data);
                
                // Handle both array and object responses
                if (Array.isArray(data)) {
                    setCustomPages(data.length > 0 ? data[0] : null);
                } else if (data && typeof data === 'object') {
                    setCustomPages(data);
                } else {
                    console.warn("Features: Unexpected data format:", data);
                    setCustomPages(null);
                }
            })
            .catch((error) => {
                console.error("Features: Error fetching custom page data:", error);
                setCustomPages(null);
            });

    }, [slug, customPageURL]);


    return (
        <div>
            {/* <!--Content of each page--> */}
            {/* <!-- Hero Area Start --> */}
            <section className="hero-area news-details-page home-front-area">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8">
                            <div className="details-content-area">
                                <div className="row">

                                    <div className="col-lg-12 details-post">
                                        <div className="single-news">
                                            {customPages ? (
                                                <>
                                                    {customPages.TitleData && customPages.TitleData[0]?.Translation && (
                                                        <h4 className="title">
                                                            {parse(sanitizeHtml(customPages.TitleData[0].Translation))}
                                                        </h4>
                                                    )}

                                                    {customPages.DescriptionData && customPages.DescriptionData[0]?.Translation && (
                                                        <div>
                                                            {parse(sanitizeHtml(customPages.DescriptionData[0].Translation))}
                                                        </div>
                                                    )}
                                                    
                                                    {(!customPages.TitleData && !customPages.DescriptionData) && (
                                                        <p>Loading content...</p>
                                                    )}
                                                </>
                                            ) : (
                                                <p>Loading...</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="row">
                                <div className="col-lg-12">
                                    {settingData?.YoutubeVideoURL && (
                                        <div className="side-video">
                                            <iframe 
                                                frameBorder="0" 
                                                scrolling="no" 
                                                marginHeight={0} 
                                                marginWidth={0} 
                                                width="100%" 
                                                height="220"
                                                src={settingData.YoutubeVideoURL}
                                                title="Features page video"
                                            ></iframe>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* <!-- News Tabs start --> */}
                            {/* <!-- News Tabs start --> */}
                            <Newsletter adRight3={props.adRight3} />
                            {adImageRight && (
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="ad-area">
                                            <a href={adRightLink} target="_blank" rel="noopener noreferrer">
                                                <img src={adImageRight} alt="Advertisement" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            {/* <!-- Hero Area End --> */}
            {adImageFooter && (
                <section className="home-front-area">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                {/* <!-- News Tabs start --> */}
                                <div className="main-content tab-view">
                                    <div className="row">
                                        <div className="col-lg-12 mycol padding_15">
                                            <a href={adFooterLink} target="_blank" rel="noopener noreferrer">
                                                <img src={adImageFooter} alt="Advertisement" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
            {/* <!-- Back to Top Start --> */}
            <div className="bottomtotop">
                <i className="fas fa-chevron-right"></i>
            </div>
            {/* <!-- Back to Top End --> */}
        </div>
    )
}