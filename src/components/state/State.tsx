"use client";

import React, { useEffect, useState } from "react";
import HeroAreaCategory from "../HeroAreaCategory";
import SearchList from "../SearchList";
import { useSearchParams } from "next/navigation";
import HomePlace2 from "../HomePlace2";
import HomePlace4 from "../HomePlace4";
import HomePlace5 from "../HomePlace5";
import HomePlace6 from "../HomePlace6";
import Axios from "axios";
import StatePlace1 from "./StatePlace1";
import configData from "../Config";
import StateHeroArea from "./StateHeroArea";
import HeroAreaSkeleton from "../HeroAreaSkeleton";
import HomePlace1Skeleton from "../HomePlace1Skeleton";
import HomePlace7 from "../HomePlace7";
import { cachedAxiosGet } from "@/utils/apiCache";

export default function State(props: any) {
    const stateslug = props.stateslug || "";

    const menus = props.menus;
    const site_lang = props.site_lang;
    const marqueeNews = props.marqueeNews;
    const [homeCategory, setHomeCategory] = React.useState<any[]>([]);
    const [StateSliderData, setStateSliderData] = useState<any[]>([])
    const [StateRightSliderData, setStateRightSliderData] = useState<any[]>([])
    const homeCategoryApiUrl = configData.HOME_CATEGORY_BASE_URL;
    const axiosConfig = {
        headers: {
            sessionToken: configData.SESSION_TOKEN,
        },
    };
    // Get post categories

    const adHeader = props.adHeader;

    const adsDataFooter = props.adFooter;
    const adImageFooter = adsDataFooter ? adsDataFooter.pAsset?.AssetLiveUrl : '';
    const adFooterLink = adsDataFooter ? adsDataFooter.AdLink : '';

    const adsDataRight = props.adRight;
    const adImageRight = adsDataRight ? adsDataRight.pAsset?.AssetLiveUrl : '';
    const adRightLink = adsDataRight ? adsDataRight.AdLink : '';

    const settingData = props.settingData;

    const searchParams = useSearchParams();
    const searchText = searchParams?.get("search") || null;

    useEffect(() => {
        if (!stateslug) return;
        
        const State_SLIDER_API_URL = configData.baseApiUrl + "getPosts?languageId=" + configData.languageId + "&offset=0&itemcount=10&categoryId=0&isFeature=0&isSlider=1&isSliderLeft=0&isSliderRight=0&isTrending=0&categorySlug=" + stateslug
        const State_RIGHT_SLIDER_API_URL = configData.baseApiUrl + "getPosts?languageId=" + configData.languageId + "&offset=0&itemcount=10&categoryId=0&isFeature=0&isSlider=0&isSliderLeft=0&isSliderRight=1&isTrending=0&categorySlug=" + stateslug
        
        const extractData = (result: any) => {
            const data = result?._data ?? result;
            return Array.isArray(data) ? data : [];
        };
        
        cachedAxiosGet(State_SLIDER_API_URL, axiosConfig).then((result: any) => {
            setStateSliderData(extractData(result));
        }).catch((error) => {
            console.error("Error fetching state slider data:", error);
        });

        cachedAxiosGet(State_RIGHT_SLIDER_API_URL, axiosConfig).then((result: any) => {
            setStateRightSliderData(extractData(result));
        }).catch((error) => {
            console.error("Error fetching state right slider data:", error);
        });
        
        cachedAxiosGet(homeCategoryApiUrl, axiosConfig).then((result: any) => {
            setHomeCategory(extractData(result));
        }).catch((error) => {
            console.error("Error fetching home category:", error);
        });
    }, [stateslug])
    return (
        <div>
            {/* <!-- Hero Area Start --> */}

            {/* state work area start ****************************************############################### */}

            {(StateRightSliderData.length > 0 && StateSliderData.length > 0) ?
                <StateHeroArea stateslug={stateslug} rightSlider={StateRightSliderData} homeSlider={StateSliderData} />
                :
                <HeroAreaSkeleton />
            }

            {
                stateslug &&
                    <StatePlace1 stateslug={stateslug} homeCategory={homeCategory} />
            }


            <HomePlace2 homeCategory={homeCategory} adHeader={adHeader} />

            <HomePlace4 homeCategory={homeCategory} adHeader={adHeader} />
            {/* <!-- Aadhyatm Area Start --> */}
            <HomePlace5 homeCategory={homeCategory} adRight3={props.adRight3} adHeader={adHeader} />
            <HomePlace6 homeCategory={homeCategory} adHeader={adHeader} />


            {settingData?.YoutubeVideoURL && (
                <section className="home-front-area">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <iframe 
                                    className='youtubeVideo' 
                                    frameBorder="0" 
                                    scrolling="no" 
                                    marginHeight={0} 
                                    marginWidth={0}
                                    src={settingData.YoutubeVideoURL}
                                    loading="lazy"
                                    title="state-youtube-video"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </section>
            )}
            <HomePlace7 homeCategory={homeCategory} adHeader={adHeader} />
            {adImageFooter && (
                <section className="home-front-area">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                {/* <!-- News Tabs start --> */}
                                <div className="main-content tab-view">
                                    <div className="row">
                                        <div className="col-lg-12 mycol padding_15">
                                            <a href={adFooterLink || undefined} target="_blank" rel="noopener noreferrer">
                                                <img src={adImageFooter} alt="Footer Advertisement" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}


            {/* state work area end ****************************************############################### */}

            {searchText &&
                <SearchList />
            }
            {/* <!-- Hero Area End --> */}

            {/* <!--  देश विदेश Area End --> */}

            {/* <!-- Back to Top Start --> */}
            <div className="bottomtotop">
                <i className="fas fa-chevron-right"></i>
            </div>
            {/* <!-- Back to Top End --> */}

        </div>
    )
}




