"use client";

import React, { useEffect, useState, useMemo } from "react";
import configData from "./Config";
import { cachedAxiosGet } from "@/utils/apiCache";
import LazyImage from "./LazyImage";

// Components (Only Home Sections)
import HeroArea from "./HeroArea";
import HomePlace1 from "./HomePlace1";
import HomePlace2 from "./HomePlace2";
import HomePlace4 from "./HomePlace4";
import HomePlace5 from "./HomePlace5";
import HomePlace6 from "./HomePlace6";
import HomePlace7 from "./HomePlace7";

// Skeletons
import HeroAreaSkeleton from "./HeroAreaSkeleton";
import HomePlace1Skeleton from "./HomePlace1Skeleton";

export default function Home(props: any) {
  const {
    menus,
    marqueeNews,
    site_lang,
    homeSlider,
    adHeader,
    adFooter,
    adRight,
    adRight3,
    homeRightSlider,
    todayDate,
    footerMenu,
    settingData,
  } = props;

  const [homeCategory, setHomeCategory] = useState<any[]>([]);

  const axiosConfig = React.useMemo(
    () => ({
      headers: {
        sessionToken: configData.SESSION_TOKEN,
      },
    }),
    []
  );

  // Load Home Categories
  useEffect(() => {
    const controller = new AbortController();
    const fetchCategory = async () => {
      try {
        console.log("Home: Fetching home categories from:", configData.HOME_CATEGORY_BASE_URL);
        const result = await cachedAxiosGet(configData.HOME_CATEGORY_BASE_URL, {
          ...axiosConfig,
          signal: controller.signal,
        });
        console.log("Home: API Response:", result);
        // Extract actual data from cached result
        const data = (result as any)?._data ?? result;
        console.log("Home: Extracted data:", data);
        const categoryData = Array.isArray(data) ? data : [];
        console.log("Home: Setting homeCategory with", categoryData.length, "items");
        setHomeCategory(categoryData);
      } catch (error) {
        if ((error as Error)?.name === "CanceledError") return;
        console.error("Home: Error fetching home categories:", error);
      }
    };
    fetchCategory();
    return () => controller.abort();
  }, [axiosConfig]);

  const adImageFooter = adFooter?.pAsset?.AssetLiveUrl || "";
  const adFooterLink = adFooter?.AdLink || "";

  // Memoize homeCategory to ensure stable reference
  const safeHomeCategory = useMemo<any[]>(() => {
    return Array.isArray(homeCategory) ? homeCategory : [];
  }, [homeCategory]);

  const hasHomeCategory = safeHomeCategory.length > 0;

  return (
    <div>
      {/* Slider */}
      {homeSlider && homeSlider.length > 0 ? (
        <HeroArea rightSlider={homeRightSlider} homeSlider={homeSlider} />
      ) : (
        <HeroAreaSkeleton />
      )}

      {/* Home Categories */}
      {hasHomeCategory ? (
        <HomePlace1 homeCategory={safeHomeCategory} adHeader={adHeader} />
      ) : (
        <HomePlace1Skeleton />
      )}

      {/* Always render these components - they handle their own early returns */}
      <HomePlace2 homeCategory={safeHomeCategory} adHeader={adHeader} />
      <HomePlace4 homeCategory={safeHomeCategory} adHeader={adHeader} />
      <HomePlace5 homeCategory={safeHomeCategory} adRight3={adRight3} adHeader={adHeader} />
      <HomePlace6 homeCategory={safeHomeCategory} adHeader={adHeader} />

      {/* YouTube Section */}
      <section className="home-front-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              {settingData?.YoutubeVideoURL ? (
                <iframe
                  className="youtubeVideo"
                  frameBorder="0"
                  scrolling="no"
                  loading="lazy"
                  title="homepage-youtube-video"
                  src={settingData.YoutubeVideoURL}
                ></iframe>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <HomePlace7 homeCategory={safeHomeCategory as any} adHeader={adHeader} />

      {/* Footer Ad */}
      <section className="home-front-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 mycol padding_15">
              {adImageFooter && (
                <a href={adFooterLink} target="_blank" rel="noopener noreferrer">
                  <LazyImage src={adImageFooter} alt="Ad Footer" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
